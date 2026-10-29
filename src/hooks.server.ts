import type { Handle } from '@sveltejs/kit/hooks';

/**
 * Headers de segurança para todas as respostas do app. A CSP é configurada no
 * vite.config.ts. HSTS deve ser ativado na hospedagem (HTTPS), não aqui.
 */
const SECURITY_HEADERS: Record<string, string> = {
	'X-Content-Type-Options': 'nosniff',
	'X-Frame-Options': 'DENY',
	'Referrer-Policy': 'strict-origin-when-cross-origin',
	'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
	'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
};

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(name, value);
	}

	return response;
};
