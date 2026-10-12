/**
 * Guarda o access token SOMENTE em memória, numa variável privada deste
 * módulo: não vai para localStorage, sessionStorage, cookie, URL, estado
 * reativo (visível em devtools) nem objeto global. Some ao recarregar a
 * página — o app recupera um novo via POST /auth/refresh, usando o refresh
 * token que fica num cookie httpOnly inacessível ao JavaScript.
 *
 * Use apenas a partir de `#lib/auth/session.svelte.ts` e `#lib/api/client.ts`.
 */

/** Margem para renovar antes do vencimento real (relógio e latência). */
const EXPIRY_SKEW_MS = 30_000;

let accessToken: string | null = null;
let expiresAt = 0;

export function storeAccessToken(token: string, expiresInSeconds: number): void {
	accessToken = token;
	expiresAt = Date.now() + expiresInSeconds * 1000;
}

/** Retorna o token apenas se ainda estiver válido (com margem de segurança). */
export function readAccessToken(): string | null {
	if (!accessToken || Date.now() >= expiresAt - EXPIRY_SKEW_MS) return null;

	return accessToken;
}

/** Milissegundos até o token precisar ser renovado. */
export function msUntilRenewal(): number {
	return Math.max(0, expiresAt - EXPIRY_SKEW_MS - Date.now());
}

export function clearAccessToken(): void {
	accessToken = null;
	expiresAt = 0;
}
