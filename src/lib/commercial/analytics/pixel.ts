const PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID || '1470545477929332';
const SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';
export const CONSENT_KEY = 'pl_cookie_consent';

export type Consent = 'granted' | 'denied';

type FbqFn = ((...args: unknown[]) => void) & {
	callMethod?: (...args: unknown[]) => void;
	queue: unknown[][];
	push: unknown;
	loaded: boolean;
	version: string;
};
type PixelWindow = Window & { fbq?: FbqFn; _fbq?: FbqFn };

const pixelWindow = () => window as PixelWindow;
const enabled = () => import.meta.env.PROD && Boolean(PIXEL_ID);

let started = false;
let pageViewRequested: string | null = null;
let pageViewSent = false;
let blocked = false;
const listeners = new Set<(consent: Consent) => void>();

export function getConsent(): Consent | null {
	try {
		const value = localStorage.getItem(CONSENT_KEY);
		return value === 'granted' || value === 'denied' ? value : null;
	} catch {
		return null;
	}
}

function storeConsent(value: Consent) {
	try {
		localStorage.setItem(CONSENT_KEY, value);
	} catch {
		return;
	}
}

const ready = () => !blocked && started && getConsent() === 'granted' && Boolean(pixelWindow().fbq);

function sendPageView() {
	if (!ready() || pageViewSent || pageViewRequested === null) return;
	pageViewSent = true;
	pixelWindow().fbq?.('track', 'PageView', {}, { eventID: pageViewRequested });
}

function startPixel() {
	if (!enabled() || blocked || started || getConsent() !== 'granted') return;
	const w = pixelWindow();
	started = true;
	if (!w.fbq) {
		const fbq = function (...args: unknown[]) {
			if (fbq.callMethod) fbq.callMethod(...args);
			else fbq.queue.push(args);
		} as FbqFn;
		if (!w._fbq) w._fbq = fbq;
		fbq.push = fbq;
		fbq.loaded = true;
		fbq.version = '2.0';
		fbq.queue = [];
		w.fbq = fbq;
		const script = document.createElement('script');
		script.async = true;
		script.src = SCRIPT_URL;
		document.head.appendChild(script);
		w.fbq('set', 'autoConfig', false, PIXEL_ID);
		w.fbq('init', PIXEL_ID);
	}
	sendPageView();
}

export function blockPixel(): void {
	blocked = true;
}

export function initPixel(): Consent | null {
	const consent = getConsent();
	if (consent === 'granted') startPixel();
	return consent;
}

export function setConsent(value: Consent): void {
	storeConsent(value);
	if (value === 'granted') startPixel();
	for (const listener of listeners) listener(value);
}

export function onConsentChange(listener: (consent: Consent) => void): () => void {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function pixelPageView(eventId: string): void {
	pageViewRequested = eventId;
	pageViewSent = false;
	sendPageView();
}

const CUSTOM_PARAM_KEYS = ['feature_id', 'operation_type', 'plan_id', 'value', 'currency'] as const;

export function trackCustom(
	event: string,
	params: Partial<Record<(typeof CUSTOM_PARAM_KEYS)[number], string | number>>,
	eventId: string
): void {
	if (!ready()) return;
	const safe: Record<string, string | number> = {};
	for (const key of CUSTOM_PARAM_KEYS) {
		const v = params[key];
		if (v !== undefined && v !== '') safe[key] = v;
	}
	pixelWindow().fbq?.('trackCustom', event, safe, { eventID: eventId });
}

export function trackLead(eventId: string): void {
	if (!ready()) return;
	pixelWindow().fbq?.('track', 'Lead', { content_name: 'acesso-antecipado' }, { eventID: eventId });
}
