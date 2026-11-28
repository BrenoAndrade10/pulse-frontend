import {
	EXPERIMENT_VERSION,
	FEATURE_IDS,
	DEMO_TYPES,
	OPERATION_TYPES,
	SCENARIO_IDS,
	PAGE_VERSION,
	type EventName,
	type EventProps,
	type FeatureId,
	type OperationType
} from '../contract.ts';
import { CtaThrottle, DemoGate, DEMO_EVENTS, normalizeDemoProps } from './demo-gate.ts';
import { ActiveTimer, ENGAGED_THRESHOLD_MS } from './active-time.ts';
import {
	deriveFbc,
	mergeAttribution,
	parseAttribution,
	parseStoredAttribution,
	type Attribution
} from './attribution.ts';
import { detectAutomated, isLocalHost, parseTestQuery, TEST_STORE_KEY } from './flags.ts';
import {
	blockPixel,
	getConsent,
	initPixel,
	onConsentChange,
	pixelPageView,
	setConsent as setPixelConsent,
	trackCustom,
	trackLead,
	type Consent
} from './pixel.ts';
import { BatchQueue } from './queue.ts';
import { computeScroll, reachedMilestones, ScrollGate } from './scroll.ts';
import {
	claimOnce,
	nextSequence,
	parseSessionRecord,
	resolveSession,
	SESSION_TIMEOUT_MS,
	type SessionRecord
} from './session.ts';
import { readCookie, sessionStore, uuid } from './storage.ts';
import { postBatch } from './transport.ts';
import {
	emptyAggregates,
	type Aggregates,
	type WireAttribution,
	type WireEvent,
	type WireSnapshot
} from './types.ts';
import { clearPersisted, resolveVisitor } from './visitor.ts';

const SESSION_KEY = 'pl_c_session';
const AGG_KEY = 'pl_c_agg';
const ATTR_KEY = 'pl_c_attr';
const ATTR_TS_KEY = 'pl_c_attr_ts';
const RETURNING_KEY = 'pl_c_ret';
const IMMEDIATE: ReadonlySet<EventName> = new Set([
	'PlanInterest',
	'Lead',
	'SignupOpen',
	'SignupClose',
	'DemoInterest'
]);
const PIXEL_CUSTOM: ReadonlySet<EventName> = new Set([
	'FeatureExplore',
	'ViewPricing',
	'PlanInterest',
	'DemoInterest'
]);
const INPUT_EVENTS = [
	'pointerdown',
	'touchstart',
	'touchmove',
	'keydown',
	'wheel',
	'click'
] as const;
const PERSIST_THROTTLE_MS = 5000;
const MAX_DEFERRED = 60;

type Deferred = { name: EventName; props: EventProps; at: number };
type Runtime = {
	destroy: () => void;
	emit: (name: EventName, props: EventProps, at?: number) => void;
	identity: () => { sessionId: string; visitorId: string; isTest: boolean; automated: boolean };
	attribution: () => WireAttribution;
	flushPending: () => void;
};

let runtime: Runtime | null = null;
let refs = 0;
let preInit: Deferred[] = [];
const pending = new Set<() => void>();

export const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined';

export function deferUntilVisible(fire: () => void): void {
	pending.add(fire);
}

export function track(name: EventName, props: EventProps = {}): void {
	if (!isBrowser()) return;
	try {
		if (runtime) runtime.emit(name, props);
		else if (preInit.length < MAX_DEFERRED) preInit.push({ name, props, at: Date.now() });
	} catch {
		return;
	}
}

export function getIdentity() {
	return runtime?.identity() ?? null;
}

export function getAttribution(): WireAttribution {
	if (runtime) return runtime.attribution();
	if (!isBrowser()) return {};
	const parsed = parseAttribution(location.search, document.referrer, location.hostname);
	return Object.fromEntries(Object.entries(parsed).filter(([, v]) => v !== ''));
}

export function setConsent(value: Consent): void {
	setPixelConsent(value);
}

export { getConsent, onConsentChange };

export const dedupeKey = (name: EventName, props: EventProps): string | null => {
	switch (name) {
		case 'EngagedSession':
		case 'ViewPricing':
			return name;
		case 'SectionView':
			return props.sectionId ? `sv:${props.sectionId}` : null;
		case 'FeatureView':
			return props.featureId ? `fv:${props.featureId}` : null;
		case 'ScrollMilestone':
			return props.detail ? `sm:${props.detail}` : null;
		default:
			return null;
	}
};

const deviceOf = (): 'mobile' | 'tablet' | 'desktop' => {
	const w = window.innerWidth;
	const coarse = window.matchMedia?.('(pointer: coarse)').matches ?? false;
	if (w < 768) return 'mobile';
	if (coarse && w < 1100) return 'tablet';
	return 'desktop';
};

const compact = (a: Record<string, string>): WireAttribution => {
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(a)) if (v) out[k] = v;
	return out;
};

function createRuntime(): Runtime {
	const wall = () => Date.now();
	const mono = () => performance.now();
	const cleanups: (() => void)[] = [];

	const test =
		parseTestQuery(location.search) ||
		isLocalHost(location.hostname) ||
		sessionStore.get(TEST_STORE_KEY) === '1';
	if (test) {
		sessionStore.set(TEST_STORE_KEY, '1');
		blockPixel();
	}
	const automated = detectAutomated({
		userAgent: navigator.userAgent,
		webdriver: navigator.webdriver
	});

	let consent: Consent | null = getConsent();
	const visitor = resolveVisitor(consent === 'granted', uuid);
	let visitorId = visitor.id;

	const resolved = resolveSession(parseSessionRecord(sessionStore.get(SESSION_KEY)), wall(), uuid);
	let session: SessionRecord = resolved.session;
	let returning: boolean;
	if (resolved.resumed && sessionStore.get(RETURNING_KEY))
		returning = sessionStore.get(RETURNING_KEY) === '1';
	else returning = visitor.returning;
	sessionStore.set(RETURNING_KEY, returning ? '1' : '0');

	const readAgg = (): Aggregates => {
		if (!resolved.resumed) return emptyAggregates();
		try {
			return { ...emptyAggregates(), ...(JSON.parse(sessionStore.get(AGG_KEY) || '{}') as object) };
		} catch {
			return emptyAggregates();
		}
	};
	let agg = readAgg();

	const attrStored = parseStoredAttribution(sessionStore.get(ATTR_KEY));
	const attribution: Attribution = mergeAttribution(
		attrStored,
		parseAttribution(location.search, document.referrer, location.hostname)
	);
	let attrTs = Number(sessionStore.get(ATTR_TS_KEY)) || wall();
	if (!attrStored || JSON.stringify(attrStored) !== JSON.stringify(attribution)) {
		if (!attrStored || attribution.fbclid !== attrStored.fbclid) attrTs = wall();
		sessionStore.set(ATTR_KEY, JSON.stringify(attribution));
		sessionStore.set(ATTR_TS_KEY, String(attrTs));
	}

	const pageVisible = () =>
		document.visibilityState === 'visible' &&
		!(document as Document & { prerendering?: boolean }).prerendering;

	let baseActive = session.activeMs;
	let baseTotal = session.totalMs;
	let timer = new ActiveTimer(mono(), pageVisible());
	const gate = new ScrollGate();
	const demoGate = new DemoGate();
	const ctaThrottle = new CtaThrottle();
	let pageviewId = uuid();
	let pageViewSent = false;
	let lastActivityWall = wall();
	let lastPersist = 0;
	let lastSnapshotAt = Number.NEGATIVE_INFINITY;
	let dirty = true;
	let engagedTimer: ReturnType<typeof setInterval> | undefined;
	let rafPending = false;
	let scrollable = false;
	const deferred: Deferred[] = preInit.splice(0);
	let destroyed = false;

	const savedSession = () => {
		session.lastActivityAt = lastActivityWall;
		session.activeMs = baseActive + timer.activeMs(mono());
		session.totalMs = baseTotal + timer.totalMs(mono());
		sessionStore.set(SESSION_KEY, JSON.stringify(session));
		lastPersist = wall();
	};
	const saveAgg = () => sessionStore.set(AGG_KEY, JSON.stringify(agg));

	const fbp = () => (consent === 'granted' ? readCookie('_fbp') : '');
	const fbc = () =>
		consent === 'granted' ? readCookie('_fbc') || deriveFbc('', attribution.fbclid, attrTs) : '';
	const wireAttribution = (): WireAttribution =>
		compact({ ...attribution, fbp: fbp(), fbc: fbc() });

	const snapshot = (force: boolean): WireSnapshot | null => {
		const now = mono();
		if (!dirty && (!force || now - lastSnapshotAt < 2000)) return null;
		lastSnapshotAt = now;
		const metrics = computeScroll(scrollingMetrics());
		scrollable = metrics.scrollable;
		dirty = false;
		savedSession();
		return {
			sessionId: session.id,
			visitorId,
			returning,
			firstActivityAt: new Date(session.startedAt).toISOString(),
			lastActivityAt: new Date(lastActivityWall).toISOString(),
			activeSeconds: Math.round((baseActive + timer.activeMs(now)) / 1000),
			totalSeconds: Math.round((baseTotal + timer.totalMs(now)) / 1000),
			maxScroll: agg.maxScroll,
			scrollable,
			startedHidden: timer.startedHidden,
			attribution: wireAttribution(),
			device: deviceOf(),
			viewport: { w: window.innerWidth, h: window.innerHeight },
			language: navigator.language || '',
			featuresViewed: agg.viewed,
			featuresExplored: agg.explored,
			operationType: agg.op,
			demoInteractions: agg.demo,
			demoStats: agg.demos,
			scenariosExplored: agg.scenarios,
			viewedPricing: agg.price,
			commercialInterest: agg.interest,
			planId: agg.plan,
			signupStarted: agg.started,
			signupCompleted: agg.done,
			demoInterest: agg.demoInt,
			isTest: test,
			automated,
			experimentVersion: EXPERIMENT_VERSION,
			pageVersion: PAGE_VERSION
		};
	};

	const queue = new BatchQueue<WireEvent, WireSnapshot>({
		snapshot,
		send: (batch, exit) => postBatch(JSON.stringify(batch), exit)
	});

	const scrollingMetrics = () => {
		const el = document.scrollingElement ?? document.documentElement;
		return {
			scrollTop: el.scrollTop,
			scrollHeight: el.scrollHeight,
			clientHeight: el.clientHeight
		};
	};

	const demoStat = (name: EventName, props: EventProps) => {
		if (!props.demoType) return;
		const op = props.operationType ?? '';
		const scenario = props.scenario ?? '';
		let stat = agg.demos.find(
			(d) => d.demoType === props.demoType && d.operationType === op && d.scenario === scenario
		);
		if (!stat) {
			stat = {
				demoType: props.demoType,
				operationType: op,
				scenario,
				plays: 0,
				progress: 0,
				maxStep: 0,
				completed: 0,
				replays: 0
			};
			agg.demos.push(stat);
		}
		if (name === 'DemoPlay') stat.plays += 1;
		else if (name === 'DemoReplay') stat.replays += 1;
		else if (name === 'DemoCompleted') stat.completed += 1;
		else {
			stat.progress += 1;
			stat.maxStep = Math.max(stat.maxStep, props.maxStep ?? props.step ?? 0);
		}
	};

	const update = (name: EventName, props: EventProps) => {
		if (
			props.scenario &&
			(name === 'FeatureExplore' || DEMO_EVENTS.has(name)) &&
			!agg.scenarios.includes(props.scenario)
		)
			agg.scenarios.push(props.scenario);
		switch (name) {
			case 'FeatureView':
				if (props.featureId && !agg.viewed.includes(props.featureId))
					agg.viewed.push(props.featureId);
				break;
			case 'FeatureExplore':
				if (props.featureId && !agg.explored.includes(props.featureId))
					agg.explored.push(props.featureId);
				break;
			case 'OperationTypeSelected':
				if (props.operationType && OPERATION_TYPES.includes(props.operationType))
					agg.op = props.operationType;
				break;
			case 'DemoPlay':
			case 'DemoProgress':
			case 'DemoCompleted':
			case 'DemoReplay':
				agg.demo += 1;
				demoStat(name, props);
				break;
			case 'AutomationDemoInteraction':
				agg.demo += 1;
				break;
			case 'ViewPricing':
				agg.price = true;
				break;
			case 'PlanInterest':
				agg.interest = true;
				if (props.planId) agg.plan = props.planId;
				break;
			case 'SignupStart':
				agg.started = true;
				break;
			case 'Lead':
				agg.done = true;
				agg.interest = true;
				break;
			case 'DemoInterest':
				agg.demoInt = true;
				agg.interest = true;
				break;
		}
	};

	const build = (name: EventName, props: EventProps, at: number): WireEvent => {
		const event: WireEvent = {
			eventId: uuid(),
			eventName: name,
			occurredAt: new Date(at).toISOString(),
			sequenceNumber: nextSequence(session),
			sessionId: session.id,
			visitorId,
			pageviewId,
			attribution: wireAttribution(),
			device: deviceOf(),
			viewport: { w: window.innerWidth, h: window.innerHeight },
			language: navigator.language || '',
			experimentVersion: EXPERIMENT_VERSION,
			pageVersion: PAGE_VERSION,
			isTest: test,
			automated
		};
		if (props.featureId && FEATURE_IDS.includes(props.featureId)) event.featureId = props.featureId;
		if (props.sectionId) event.sectionId = props.sectionId;
		if (props.operationType && OPERATION_TYPES.includes(props.operationType))
			event.operationType = props.operationType;
		if (props.planId) event.planId = String(props.planId).slice(0, 40);
		if (typeof props.displayedPrice === 'number' && Number.isFinite(props.displayedPrice))
			event.displayedPrice = props.displayedPrice;
		if (props.currency) event.currency = String(props.currency).slice(0, 3);
		if (props.ctaSource) event.ctaSource = String(props.ctaSource).slice(0, 60);
		if (props.scenario && SCENARIO_IDS.includes(props.scenario)) event.scenario = props.scenario;
		if (props.demoType && DEMO_TYPES.includes(props.demoType)) event.demoType = props.demoType;
		for (const key of ['step', 'maxStep', 'totalSteps', 'durationMs'] as const)
			if (typeof props[key] === 'number') event[key] = props[key];
		if (props.detail) event.detail = String(props.detail).slice(0, 80);
		if (props.value !== undefined) event.value = props.value;
		return event;
	};

	const pixelParams = (e: WireEvent) => ({
		feature_id: e.featureId ?? '',
		operation_type: e.operationType ?? '',
		plan_id: e.planId ?? '',
		value: e.displayedPrice,
		currency: e.currency ?? ''
	});

	const record = (name: EventName, rawProps: EventProps, at: number) => {
		const props = DEMO_EVENTS.has(name) ? normalizeDemoProps(rawProps) : rawProps;
		if (props.demoType && !DEMO_TYPES.includes(props.demoType)) return;
		if (props.scenario && !SCENARIO_IDS.includes(props.scenario)) return;
		if (!demoGate.allow(name, props, mono())) return;
		if (!ctaThrottle.allow(name, props, mono())) return;
		const key = dedupeKey(name, props);
		if (key && !claimOnce(session, key)) return;
		const event = build(name, props, at);
		update(name, props);
		dirty = true;
		saveAgg();
		savedSession();
		if (name === 'Lead') trackLead(event.eventId);
		else if (PIXEL_CUSTOM.has(name) && !test) trackCustom(name, pixelParams(event), event.eventId);
		queue.push(event, IMMEDIATE.has(name));
		return event;
	};

	const firePageView = () => {
		if (pageViewSent) return;
		pageViewSent = true;
		const event = record(
			'PageView',
			timer.startedHidden ? { detail: 'started_hidden' } : {},
			wall()
		);
		if (event) pixelPageView(event.eventId);
		const queued = deferred.splice(0);
		for (const item of queued) record(item.name, item.props, item.at);
	};

	const emit = (name: EventName, props: EventProps, at: number = wall()) => {
		if (destroyed) return;
		if (name === 'PageView') return;
		if (!pageViewSent) {
			if (deferred.length < MAX_DEFERRED) deferred.push({ name, props, at });
			return;
		}
		record(name, props, at);
	};

	const renewIfStale = () => {
		if (wall() - lastActivityWall <= SESSION_TIMEOUT_MS) return;
		queue.exit();
		const fresh = resolveSession(null, wall(), uuid).session;
		session = fresh;
		agg = emptyAggregates();
		baseActive = 0;
		baseTotal = 0;
		timer = new ActiveTimer(mono(), pageVisible());
		lastActivityWall = wall();
		savedSession();
		saveAgg();
		dirty = true;
		armEngaged();
	};

	const checkEngaged = () => {
		if (timer.activeMs(mono()) + baseActive < ENGAGED_THRESHOLD_MS) return;
		if (engagedTimer) clearInterval(engagedTimer);
		engagedTimer = undefined;
		if (pageViewSent) record('EngagedSession', { value: ENGAGED_THRESHOLD_MS / 1000 }, wall());
	};
	function armEngaged() {
		if (engagedTimer) clearInterval(engagedTimer);
		if (session.flags.includes('EngagedSession')) return;
		engagedTimer = setInterval(checkEngaged, 1000);
	}

	const evaluateScroll = () => {
		rafPending = false;
		const metrics = computeScroll(scrollingMetrics());
		scrollable = metrics.scrollable;
		if (!metrics.scrollable) return;
		if (metrics.percent > agg.maxScroll) {
			agg.maxScroll = metrics.percent;
			dirty = true;
			saveAgg();
		}
		if (!pageViewSent) return;
		for (const milestone of reachedMilestones(metrics.percent))
			record('ScrollMilestone', { detail: String(milestone), value: milestone }, wall());
	};

	const markActive = (isInput: boolean) => {
		const n = mono();
		if (!timer.isVisible() && pageVisible()) timer.setVisible(true, n);
		renewIfStale();
		timer.interact(n);
		if (isInput) gate.input(n);
		lastActivityWall = wall();
		dirty = true;
		if (wall() - lastPersist > PERSIST_THROTTLE_MS) savedSession();
		queue.touch();
	};

	const onInput = (event: Event) => {
		if (!event.isTrusted) return;
		markActive(true);
	};
	const onScroll = (event: Event) => {
		if (!event.isTrusted) return;
		const n = mono();
		if (!gate.accept(n)) return;
		markActive(false);
		if (rafPending) return;
		rafPending = true;
		requestAnimationFrame(evaluateScroll);
	};

	const hide = () => {
		timer.setVisible(false, mono());
		savedSession();
		queue.exit();
	};
	const show = () => {
		if (!pageVisible()) return;
		timer.setVisible(true, mono());
		renewIfStale();
		dirty = true;
		if (!pageViewSent) firePageView();
		for (const fire of [...pending]) {
			pending.delete(fire);
			fire();
		}
		queue.touch();
	};
	const onVisibility = () => (document.visibilityState === 'hidden' ? hide() : show());
	const onPageHide = () => hide();
	const onPageShow = (event: PageTransitionEvent) => {
		if (!event.persisted) return;
		pageviewId = uuid();
		pageViewSent = false;
		timer.setVisible(pageVisible(), mono());
		renewIfStale();
		if (pageVisible()) firePageView();
	};
	const onBlur = () => timer.setVisible(false, mono());
	const onFocus = () => {
		if (pageVisible()) timer.setVisible(true, mono());
	};

	const stopConsent = onConsentChange((value) => {
		consent = value;
		if (value === 'granted') {
			const v = resolveVisitor(true, () => visitorId);
			visitorId = v.id;
		} else clearPersisted();
		dirty = true;
	});
	cleanups.push(stopConsent);

	for (const name of INPUT_EVENTS) {
		window.addEventListener(name, onInput, { passive: true, capture: true });
		cleanups.push(() => window.removeEventListener(name, onInput, { capture: true }));
	}
	window.addEventListener('scroll', onScroll, { passive: true, capture: true });
	cleanups.push(() => window.removeEventListener('scroll', onScroll, { capture: true }));
	document.addEventListener('visibilitychange', onVisibility);
	cleanups.push(() => document.removeEventListener('visibilitychange', onVisibility));
	window.addEventListener('pagehide', onPageHide);
	cleanups.push(() => window.removeEventListener('pagehide', onPageHide));
	window.addEventListener('pageshow', onPageShow);
	cleanups.push(() => window.removeEventListener('pageshow', onPageShow));
	window.addEventListener('blur', onBlur);
	cleanups.push(() => window.removeEventListener('blur', onBlur));
	window.addEventListener('focus', onFocus);
	cleanups.push(() => window.removeEventListener('focus', onFocus));
	document.addEventListener('prerenderingchange', show);
	cleanups.push(() => document.removeEventListener('prerenderingchange', show));

	initPixel();
	savedSession();
	armEngaged();
	if (pageVisible()) firePageView();

	return {
		emit,
		identity: () => ({ sessionId: session.id, visitorId, isTest: test, automated }),
		attribution: wireAttribution,
		flushPending: show,
		destroy() {
			if (destroyed) return;
			hide();
			destroyed = true;
			if (engagedTimer) clearInterval(engagedTimer);
			for (const cleanup of cleanups) cleanup();
			queue.destroy();
			pending.clear();
		}
	};
}

export function initAnalytics(): () => void {
	if (!isBrowser()) return () => {};
	refs += 1;
	if (!runtime) {
		try {
			runtime = createRuntime();
		} catch {
			runtime = null;
		}
	}
	let released = false;
	return () => {
		if (released) return;
		released = true;
		refs = Math.max(0, refs - 1);
		if (refs === 0 && runtime) {
			try {
				runtime.destroy();
			} catch {
				void 0;
			}
			runtime = null;
			preInit = [];
		}
	};
}

export type { EventProps, FeatureId, OperationType };
