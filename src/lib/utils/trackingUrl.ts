export type ParsedPageUrl =
	{ ok: true; url: string; hostname: string; path: string } | { ok: false; error: string };

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

export function parsePageUrl(
	input: string,
	{ allowLocal = import.meta.env.DEV }: { allowLocal?: boolean } = {}
): ParsedPageUrl {
	const value = input.trim();
	if (!value) return { ok: false, error: 'Cole o link da página.' };

	const hasProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
	const looksLocal = /^(localhost|127\.0\.0\.1)(:|\/|$)/i.test(value);
	const withProtocol = hasProtocol
		? value
		: `${allowLocal && looksLocal ? 'http' : 'https'}://${value}`;

	let url: URL;
	try {
		url = new URL(withProtocol);
	} catch {
		return { ok: false, error: 'Esse link não parece válido. Ex.: https://meusite.com.br/pagina' };
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
			error: 'Use uma página com https://. O pixel só funciona em sites seguros.'
		};
	}
	if (!url.hostname.includes('.') || url.hostname === 'localhost') {
		return { ok: false, error: 'Use o endereço público da página, como meusite.com.br.' };
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
