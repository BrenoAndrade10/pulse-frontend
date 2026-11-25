const PIXEL_ID = import.meta.env.PUBLIC_META_PIXEL_ID || '1470545477929332';
const SCRIPT_URL = 'https://connect.facebook.net/en_US/fbevents.js';
const CONSENT_KEY = 'pl_cookie_consent';
const FORM_SELECTOR = '#pesquisa';

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
let pageViewSent = false;

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

const ready = () => started && getConsent() === 'granted' && Boolean(pixelWindow().fbq);

function startPixel() {
	if (!enabled() || started || getConsent() !== 'granted') return;
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
	if (!pageViewSent) {
		pageViewSent = true;
		w.fbq?.('track', 'PageView');
	}
}

export function initPixel(): Consent | null {
	const consent = getConsent();
	if (consent === 'granted') startPixel();
	return consent;
}

export function setConsent(value: Consent): void {
	storeConsent(value);
	if (value === 'granted') startPixel();
}

export function trackCustom(event: string, params: Record<string, unknown> = {}): void {
	if (ready()) pixelWindow().fbq?.('trackCustom', event, params);
}

export function trackLead(eventId: string): void {
	if (!ready()) return;
	pixelWindow().fbq?.(
		'track',
		'Lead',
		{ content_name: 'pesquisa-pre-lancamento' },
		{ eventID: eventId }
	);
}

export function observeFormView(): () => void {
	const target = document.querySelector(FORM_SELECTOR);
	if (!target || !('IntersectionObserver' in window)) return () => {};
	let fired = false;
	const observer = new IntersectionObserver(
		(entries) => {
			if (fired || !entries.some((entry) => entry.isIntersecting)) return;
			fired = true;
			observer.disconnect();
			trackCustom('ViewForm');
		},
		{ threshold: 0.2 }
	);
	observer.observe(target);
	return () => observer.disconnect();
}

export function observeFormStart(): () => void {
	let fired = false;
	const onFocusIn = (event: FocusEvent) => {
		if (fired) return;
		const el = event.target as HTMLElement | null;
		if (!el || !el.closest(FORM_SELECTOR)) return;
		if (el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' && el.tagName !== 'SELECT') return;
		fired = true;
		document.removeEventListener('focusin', onFocusIn);
		trackCustom('FormStart');
	};
	document.addEventListener('focusin', onFocusIn);
	return () => document.removeEventListener('focusin', onFocusIn);
}

export const pixelNoscriptSrc = `https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`;
