import { PUBLIC_API_URL } from '$app/env/public';

const REQUEST_TIMEOUT_MS = 15_000;

/** Erro padronizado da API: `{ result: 'ERROR', reason, data }`. */
export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly reason: string,
		readonly data: unknown = null
	) {
		super(reason);
		this.name = 'ApiError';
	}

	/** Mensagens de validação (yup) devolvidas pela API, quando houver. */
	get validationMessages(): string[] {
		const errors = (this.data as { errors?: unknown } | null)?.errors;

		return Array.isArray(errors) ? errors.filter((e): e is string => typeof e === 'string') : [];
	}
}

export type HttpRequest = {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
	/**
	 * Só as rotas /auth/* precisam enviar e receber o cookie do refresh token.
	 * Todo o resto usa apenas o header Authorization.
	 */
	withCredentials?: boolean;
};

/** Chamada HTTP crua à API, sem lógica de autenticação. */
export async function httpRequest<T>(path: string, request: HttpRequest = {}): Promise<T> {
	const headers: Record<string, string> = { Accept: 'application/json', ...request.headers };

	if (request.body !== undefined) headers['Content-Type'] = 'application/json';

	let response: Response;

	try {
		response = await fetch(`${PUBLIC_API_URL}${path}`, {
			method: request.method ?? 'GET',
			headers,
			body: request.body === undefined ? undefined : JSON.stringify(request.body),
			credentials: request.withCredentials ? 'include' : 'omit',
			cache: 'no-store',
			// Não envia a URL da página atual para a API.
			referrerPolicy: 'no-referrer',
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
	} catch {
		throw new ApiError(0, 'NETWORK_ERROR');
	}

	if (response.status === 204) return undefined as T;

	const payload: unknown = await response.json().catch(() => null);

	if (!response.ok) {
		const { reason, data } = (payload ?? {}) as { reason?: unknown; data?: unknown };

		throw new ApiError(
			response.status,
			typeof reason === 'string' ? reason : 'UNEXPECTED_ERROR',
			data ?? null
		);
	}

	return payload as T;
}
