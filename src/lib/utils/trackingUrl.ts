import { t } from '#lib/i18n/index.svelte.js';
export type ParsedPageUrl =
	{ ok: true; url: string; hostname: string; path: string } | { ok: false; error: string };

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export function parsePageUrl(
	input: string,
	{ allowLocal = import.meta.env.DEV }: { allowLocal?: boolean } = {}
): ParsedPageUrl {
	const value = input.trim();
	if (!value) return { ok: false, error: t('tracking.urlErrors.empty') };

	const hasProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
	const looksLocal = /^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(value);
	const withProtocol = hasProtocol
		? value
		: `${allowLocal && looksLocal ? 'http' : 'https'}://${value}`;

	let url: URL;
	try {
		url = new URL(withProtocol);
	} catch {
		return { ok: false, error: t('tracking.urlErrors.invalid') };
	}

	if (allowLocal && LOCAL_HOSTS.has(url.hostname) && /^https?:$/.test(url.protocol)) {
		url.hash = '';
		return {
			ok: true,
			url: url.toString(),
			hostname: url.hostname,
			path: `${url.port ? `:${url.port}` : ''}${url.pathname}${url.search}`
		};
	}

	if (url.protocol !== 'https:') {
		return {
			ok: false,
			error: t('tracking.urlErrors.insecure')
		};
	}
	if (!url.hostname.includes('.') || url.hostname === 'localhost') {
		return { ok: false, error: t('tracking.urlErrors.notPublic') };
	}

	url.hash = '';

	return {
		ok: true,
		url: url.toString(),
		hostname: url.hostname.replace(/^www\./, ''),
		path: `${url.pathname}${url.search}`
	};
}

export function isAllowedDomain(hostname: string, allowed: string[]): boolean {
	return allowed.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}
