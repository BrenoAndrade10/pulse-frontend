export const DEFAULT_AUTHENTICATED_ROUTE = '/dashboard';

/**
 * Valida o destino pós-login vindo da URL (?redirectTo=...). Só aceita
 * caminhos internos, evitando open redirect para sites externos
 * (ex.: `//evil.com`, `/\evil.com`, `https://evil.com`).
 */
export function safeRedirectPath(target: string | null | undefined, origin: string): string {
	if (!target || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) {
		return DEFAULT_AUTHENTICATED_ROUTE;
	}

	try {
		const url = new URL(target, origin);

		if (url.origin !== origin) return DEFAULT_AUTHENTICATED_ROUTE;

		return `${url.pathname}${url.search}${url.hash}`;
	} catch {
		return DEFAULT_AUTHENTICATED_ROUTE;
	}
}

export function loginPathFor(returnTo: string): string {
	return `/login?redirectTo=${encodeURIComponent(returnTo)}`;
}
