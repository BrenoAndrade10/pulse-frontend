import {
	DEMO_TYPES,
	EVENT_NAMES,
	FEATURE_IDS,
	OPERATION_TYPES,
	SCENARIO_IDS,
	SECTION_IDS
} from '../../src/lib/commercial/contract.ts';
import {
	callAppsScript,
	clientIp,
	cleanId,
	cleanText,
	createRateLimiter,
	ID_PATTERN,
	isOriginAllowed,
	json,
	SLUG_PATTERN,
	toBool,
	toInt,
	toIso,
	toMoney
} from '../../src/lib/commercial/server/common.ts';

export const MAX_BODY_BYTES = 64000;
export const MAX_EVENTS = 50;
const DEVICES = ['mobile', 'tablet', 'desktop'];
const VERSION_PATTERN = /^[\w.-]{1,64}$/;
const FB_PATTERN = /^[\w.-]{0,240}$/;
const LANG_PATTERN = /^[A-Za-z]{2,3}([-_][A-Za-z0-9]{2,8}){0,2}$/;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const pick = <T extends string>(value: unknown, list: readonly T[]): T | '' =>
	typeof value === 'string' && (list as readonly string[]).includes(value) ? (value as T) : '';
const list = <T extends string>(value: unknown, allowed: readonly T[]): T[] =>
	Array.isArray(value)
		? [...new Set(value.map((v) => pick(v, allowed)).filter((v): v is T => v !== ''))]
		: [];

export const sanitizeAttribution = (value: unknown): Record<string, string> => {
	const a = isObj(value) ? value : {};
	const out: Record<string, string> = {};
	const put = (key: string, text: string) => {
		if (text) out[key] = text;
	};
	for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'])
		put(key, cleanText(a[key], 150));
	for (const key of ['campaign_id', 'adset_id', 'ad_id']) put(key, cleanText(a[key], 64));
	for (const key of ['fbclid', 'fbp', 'fbc']) {
		const text = cleanText(a[key], 240);
		put(key, FB_PATTERN.test(text) ? text : '');
	}
	put('referrer', cleanText(a.referrer, 200));
	return out;
};

const sanitizeContext = (p: Obj) => {
	const viewport = isObj(p.viewport) ? p.viewport : {};
	const language = cleanText(p.language, 16);
	return {
		device: pick(p.device, DEVICES) || 'desktop',
		viewport: { w: toInt(viewport.w, 0, 20000), h: toInt(viewport.h, 0, 20000) },
		language: LANG_PATTERN.test(language) ? language : '',
		experimentVersion: cleanId(p.experimentVersion, VERSION_PATTERN),
		pageVersion: cleanId(p.pageVersion, VERSION_PATTERN),
		isTest: toBool(p.isTest),
		automated: toBool(p.automated)
	};
};

export const sanitizeEvent = (raw: unknown, now: number) => {
	if (!isObj(raw)) return null;
	const eventName = pick(raw.eventName, EVENT_NAMES);
	const eventId = cleanId(raw.eventId, ID_PATTERN);
	const sessionId = cleanId(raw.sessionId, ID_PATTERN);
	const visitorId = cleanId(raw.visitorId, ID_PATTERN);
	if (!eventName || !eventId || !sessionId || !visitorId) return null;
	const occurredAt = toIso(raw.occurredAt, now) || new Date(now).toISOString();
	const value = raw.value;
	const event: Obj = {
		eventId,
		eventName,
		occurredAt,
		sequenceNumber: toInt(raw.sequenceNumber, 0, 10000000),
		sessionId,
		visitorId,
		pageviewId: cleanId(raw.pageviewId, ID_PATTERN),
		featureId: pick(raw.featureId, FEATURE_IDS),
		sectionId: pick(raw.sectionId, SECTION_IDS),
		operationType: pick(raw.operationType, OPERATION_TYPES),
		planId: cleanId(raw.planId, SLUG_PATTERN, 40),
		currency: /^[A-Z]{3}$/.test(String(raw.currency ?? '')) ? String(raw.currency) : '',
		ctaSource: cleanId(raw.ctaSource, SLUG_PATTERN, 60),
		demoType: pick(raw.demoType, DEMO_TYPES),
		scenario: pick(raw.scenario, SCENARIO_IDS),
		detail: cleanText(raw.detail, 80),
		attribution: sanitizeAttribution(raw.attribution),
		...sanitizeContext(raw)
	};
	const price = toMoney(raw.displayedPrice);
	if (price !== undefined) event.displayedPrice = price;
	for (const key of ['step', 'maxStep', 'totalSteps'])
		if (raw[key] !== undefined && raw[key] !== null) event[key] = toInt(raw[key], 0, 50);
	if (raw.durationMs !== undefined && raw.durationMs !== null)
		event.durationMs = toInt(raw.durationMs, 0, 1800000);
	if (typeof value === 'number' && Number.isFinite(value))
		event.value = Math.round(value * 100) / 100;
	else if (typeof value === 'boolean') event.value = value;
	else if (typeof value === 'string') event.value = cleanText(value, 80);
	return event;
};

export const sanitizeDemoStats = (value: unknown) => {
	if (!Array.isArray(value)) return [];
	const out: Obj[] = [];
	for (const item of value.slice(0, 24)) {
		if (!isObj(item)) continue;
		const demoType = pick(item.demoType, DEMO_TYPES);
		if (!demoType) continue;
		out.push({
			demoType,
			operationType: pick(item.operationType, OPERATION_TYPES),
			scenario: pick(item.scenario, SCENARIO_IDS),
			plays: toInt(item.plays, 0, 100000),
			progress: toInt(item.progress, 0, 100000),
			maxStep: toInt(item.maxStep, 0, 50),
			completed: toInt(item.completed, 0, 100000),
			replays: toInt(item.replays, 0, 100000)
		});
	}
	return out;
};

export const sanitizeSnapshot = (raw: unknown, now: number) => {
	if (!isObj(raw)) return null;
	const sessionId = cleanId(raw.sessionId, ID_PATTERN);
	const visitorId = cleanId(raw.visitorId, ID_PATTERN);
	if (!sessionId || !visitorId) return null;
	const first = toIso(raw.firstActivityAt, now, 8 * 86400000) || new Date(now).toISOString();
	const last = toIso(raw.lastActivityAt, now, 8 * 86400000) || new Date(now).toISOString();
	return {
		sessionId,
		visitorId,
		returning: toBool(raw.returning),
		firstActivityAt: first,
		lastActivityAt: last,
		activeSeconds: toInt(raw.activeSeconds, 0, 86400),
		totalSeconds: toInt(raw.totalSeconds, 0, 7 * 86400),
		maxScroll: toInt(raw.maxScroll, 0, 100),
		scrollable: toBool(raw.scrollable),
		startedHidden: toBool(raw.startedHidden),
		attribution: sanitizeAttribution(raw.attribution),
		featuresViewed: list(raw.featuresViewed, FEATURE_IDS),
		featuresExplored: list(raw.featuresExplored, FEATURE_IDS),
		operationType: pick(raw.operationType, OPERATION_TYPES),
		demoInteractions: toInt(raw.demoInteractions, 0, 100000),
		demoStats: sanitizeDemoStats(raw.demoStats),
		scenariosExplored: list(raw.scenariosExplored, SCENARIO_IDS),
		viewedPricing: toBool(raw.viewedPricing),
		commercialInterest: toBool(raw.commercialInterest),
		planId: cleanId(raw.planId, SLUG_PATTERN, 40),
		signupStarted: toBool(raw.signupStarted),
		signupCompleted: toBool(raw.signupCompleted),
		demoInterest: toBool(raw.demoInterest),
		...sanitizeContext(raw)
	};
};

export type BatchResult =
	| { ok: true; value: { sessionSnapshot: ReturnType<typeof sanitizeSnapshot>; events: Obj[] } }
	| { ok: false; reason: string };

export const sanitizeBatch = (payload: unknown, now: number = Date.now()): BatchResult => {
	if (!isObj(payload)) return { ok: false, reason: 'INVALID_BODY' };
	const rawEvents = payload.events === undefined ? [] : payload.events;
	if (!Array.isArray(rawEvents)) return { ok: false, reason: 'INVALID_EVENTS' };
	if (rawEvents.length > MAX_EVENTS) return { ok: false, reason: 'TOO_MANY_EVENTS' };
	const seen = new Set<string>();
	const events: Obj[] = [];
	for (const raw of rawEvents) {
		const event = sanitizeEvent(raw, now);
		if (!event || seen.has(event.eventId as string)) continue;
		seen.add(event.eventId as string);
		events.push(event);
	}
	const sessionSnapshot =
		payload.sessionSnapshot == null ? null : sanitizeSnapshot(payload.sessionSnapshot, now);
	if (!events.length && !sessionSnapshot) return { ok: false, reason: 'EMPTY_BATCH' };
	return { ok: true, value: { sessionSnapshot, events } };
};

const allow = createRateLimiter(90, 60000);

export default async (request: Request) => {
	if (request.method !== 'POST') return json({ success: false }, 405);
	if (
		!isOriginAllowed(
			request.headers.get('origin') ?? '',
			request.headers.get('referer') ?? '',
			process.env
		)
	)
		return json({ success: false }, 403);
	if (!allow(clientIp(request))) return json({ success: false }, 429);
	const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
	if (!appsScriptUrl) return json({ success: true, skipped: true });
	const secret = process.env.COMMERCIAL_SHARED_SECRET;
	if (!secret) return json({ success: true, skipped: true });
	try {
		const raw = await request.text();
		if (raw.length > MAX_BODY_BYTES) return json({ success: false }, 413);
		let parsed: unknown;
		try {
			parsed = JSON.parse(raw);
		} catch {
			return json({ success: false }, 400);
		}
		const batch = sanitizeBatch(parsed);
		if (!batch.ok) return json({ success: false, reason: batch.reason }, 400);
		const result = await callAppsScript(appsScriptUrl, {
			type: 'c_batch',
			secret,
			...batch.value
		});
		if (!result.ok) return json({ success: false }, 502);
		return json({ success: true });
	} catch (error) {
		console.error('c-track failed', error instanceof Error ? error.message : 'unknown');
		return json({ success: false }, 502);
	}
};
