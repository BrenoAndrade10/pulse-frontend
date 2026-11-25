type Snapshot = {
	type: 'track';
	sessionId: string;
	visitorId: string;
	returning: boolean;
	firstSeen: string;
	lastSeen: string;
	activeSeconds: number;
	totalSeconds: number;
	maxScroll: number;
	formViewed: boolean;
	formStarted: boolean;
	maxStep: number;
	lastField: string;
	submitted: boolean;
	leadId: string;
	device: string;
	width: number;
	language: string;
	referrer: string;
	fbclid: string;
	fbp: string;
	fbc: string;
	interacted: boolean;
	firstInteractionSeconds: number;
	automated: boolean;
	reason: string;
};

const ENDPOINT = '/.netlify/functions/track';
const HEARTBEAT_MS = 15000;
const FORM_SELECTOR = '#pesquisa';
const INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown', 'wheel', 'scroll'] as const;

const readStorage = (key: string) => {
	try {
		return localStorage.getItem(key) ?? '';
	} catch {
		return '';
	}
};
const writeStorage = (key: string, value: string) => {
	try {
		localStorage.setItem(key, value);
	} catch {
		return;
	}
};
const readCookie = (name: string) => {
	const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : '';
};
const uuid = () =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
const referrerOf = () => {
	if (!document.referrer) return '';
	try {
		const url = new URL(document.referrer);
		return `${url.hostname}${url.pathname}`.slice(0, 200);
	} catch {
		return '';
	}
};

export function createTracker() {
	const visitorKey = 'pl_visitor';
	let visitorId = readStorage(visitorKey);
	const returning = Boolean(visitorId);
	if (!visitorId) {
		visitorId = uuid();
		writeStorage(visitorKey, visitorId);
	}

	const sessionId = uuid();
	const params = new URLSearchParams(location.search);
	const fbclid = params.get('fbclid') ?? '';
	const fbpCookie = readCookie('_fbp');
	const fbcCookie = readCookie('_fbc');
	const startedAt = Date.now();
	const firstSeen = new Date(startedAt).toISOString();

	let visibleSince = document.hidden ? 0 : startedAt;
	let activeMs = 0;
	let maxScroll = 0;
	let formViewed = false;
	let formStarted = false;
	let maxStep = 0;
	let lastField = '';
	let submitted = false;
	let leadId = '';
	let interacted = false;
	let firstInteractionSeconds = 0;
	const automated =
		navigator.webdriver === true ||
		/HeadlessChrome|PhantomJS|Lighthouse/i.test(navigator.userAgent);
	let dirty = true;
	let timer: ReturnType<typeof setInterval> | undefined;
	let observer: IntersectionObserver | undefined;

	const currentActiveMs = () => activeMs + (visibleSince ? Date.now() - visibleSince : 0);

	const snapshot = (reason: string): Snapshot => ({
		type: 'track',
		sessionId,
		visitorId,
		returning,
		firstSeen,
		lastSeen: new Date().toISOString(),
		activeSeconds: Math.round(currentActiveMs() / 1000),
		totalSeconds: Math.round((Date.now() - startedAt) / 1000),
		maxScroll,
		formViewed,
		formStarted,
		maxStep,
		lastField,
		submitted,
		leadId,
		device: window.matchMedia('(pointer: coarse)').matches ? 'mobile' : 'desktop',
		width: window.innerWidth,
		language: navigator.language ?? '',
		referrer: referrerOf(),
		fbclid,
		fbp: fbpCookie,
		fbc: fbcCookie,
		interacted,
		firstInteractionSeconds,
		automated,
		reason
	});

	const flush = (reason: string, force = false) => {
		if (!dirty && !force) return;
		dirty = false;
		const body = JSON.stringify(snapshot(reason));
		try {
			if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return;
		} catch {
			dirty = true;
		}
		void fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {
			dirty = true;
		});
	};

	const onScroll = () => {
		const doc = document.documentElement;
		const total = doc.scrollHeight - window.innerHeight;
		const pct = total <= 0 ? 100 : Math.min(100, Math.round((window.scrollY / total) * 100));
		if (pct > maxScroll) {
			maxScroll = pct;
			dirty = true;
		}
	};

	const onVisibility = () => {
		if (document.hidden) {
			if (visibleSince) activeMs += Date.now() - visibleSince;
			visibleSince = 0;
			dirty = true;
			flush('hidden', true);
		} else if (!visibleSince) {
			visibleSince = Date.now();
		}
	};

	const onPageHide = () => {
		if (visibleSince) {
			activeMs += Date.now() - visibleSince;
			visibleSince = 0;
		}
		flush('pagehide', true);
	};

	const onInteraction = () => {
		if (interacted) return;
		interacted = true;
		firstInteractionSeconds = Math.round((Date.now() - startedAt) / 1000);
		for (const name of INTERACTION_EVENTS) window.removeEventListener(name, onInteraction);
		dirty = true;
		flush('interaction', true);
	};

	const markStarted = () => {
		if (formStarted) return;
		formStarted = true;
		if (maxStep < 1) maxStep = 1;
		dirty = true;
		flush('form_start', true);
	};

	const onFocusIn = (event: FocusEvent) => {
		const target = event.target as HTMLElement | null;
		if (!target || !target.closest(FORM_SELECTOR)) return;
		const tag = target.tagName;
		if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') return;
		const field =
			target.getAttribute('name') || target.getAttribute('id') || target.getAttribute('type') || '';
		const value = field.slice(0, 60);
		if (value && value !== lastField) {
			lastField = value;
			dirty = true;
		}
		markStarted();
	};

	const start = () => {
		window.addEventListener('scroll', onScroll, { passive: true });
		document.addEventListener('visibilitychange', onVisibility);
		window.addEventListener('pagehide', onPageHide);
		document.addEventListener('focusin', onFocusIn);
		for (const name of INTERACTION_EVENTS)
			window.addEventListener(name, onInteraction, { passive: true });
		const form = document.querySelector(FORM_SELECTOR);
		if (form && 'IntersectionObserver' in window) {
			observer = new IntersectionObserver(
				(entries) => {
					if (entries.some((entry) => entry.isIntersecting) && !formViewed) {
						formViewed = true;
						dirty = true;
						flush('form_view', true);
						observer?.disconnect();
					}
				},
				{ threshold: 0.2 }
			);
			observer.observe(form);
		}
		onScroll();
		flush('view', true);
		timer = setInterval(() => {
			if (!document.hidden) flush('heartbeat', true);
		}, HEARTBEAT_MS);
	};

	const stop = () => {
		if (timer) clearInterval(timer);
		observer?.disconnect();
		window.removeEventListener('scroll', onScroll);
		document.removeEventListener('visibilitychange', onVisibility);
		window.removeEventListener('pagehide', onPageHide);
		document.removeEventListener('focusin', onFocusIn);
		for (const name of INTERACTION_EVENTS) window.removeEventListener(name, onInteraction);
		onPageHide();
	};

	return {
		start,
		stop,
		formStart: markStarted,
		step(value: number) {
			if (value > maxStep) {
				maxStep = value;
				dirty = true;
				flush('step', true);
			}
		},
		submitted(id: string) {
			submitted = true;
			leadId = id;
			dirty = true;
			flush('submitted', true);
		},
		get sessionId() {
			return sessionId;
		}
	};
}

export type Tracker = ReturnType<typeof createTracker>;
