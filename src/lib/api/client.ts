import { ApiError, httpRequest, type HttpRequest } from '#lib/api/http.js';
import { getAccessToken, refreshSession } from '#lib/auth/session.svelte.js';

/** Motivos de 401 que um novo access token pode resolver. */
const RETRYABLE_REASONS = new Set(['UNAUTHENTICATED', 'INVALID_ACCESS_TOKEN']);

/**
 * Chamada autenticada à API. Envia o access token no header Authorization e,
 * se ele for recusado, renova a sessão e tenta mais uma vez.
 *
 * Use este cliente para tudo que não for /auth/*.
 */
export async function apiRequest<T>(path: string, request: HttpRequest = {}): Promise<T> {
	const send = (token: string) =>
		httpRequest<T>(path, {
			...request,
			headers: { ...request.headers, Authorization: `Bearer ${token}` }
		});

	try {
		return await send(await getAccessToken());
	} catch (error) {
		if (
			!(error instanceof ApiError) ||
			error.status !== 401 ||
			!RETRYABLE_REASONS.has(error.reason) ||
			!(await refreshSession())
		) {
			throw error;
		}

		return send(await getAccessToken());
	}
}
