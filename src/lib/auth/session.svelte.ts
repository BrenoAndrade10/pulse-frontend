import { browser } from '$app/env';
import { ApiError, httpRequest } from '#lib/api/http.js';
import {
	clearAccessToken,
	msUntilRenewal,
	readAccessToken,
	storeAccessToken
} from '#lib/auth/tokenVault.js';
import type { AuthMembership, AuthProfile, AuthResponse, AuthUser } from '#lib/auth/types.js';

/**
 * Estado da sessão no navegador.
 *
 * - O refresh token vive num cookie httpOnly definido pela API: o JavaScript
 *   nunca o lê nem o escreve.
 * - O access token fica só em memória (ver tokenVault.ts), fora do estado
 *   reativo.
 * - Aqui, no estado reativo, ficam apenas dados de exibição (nome, e-mail,
 *   tenant), que não dão acesso a nada sozinhos.
 */

type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

/** Por que a sessão terminou: saída voluntária ou expiração/revogação. */
export type SessionEndReason = 'logout' | 'expired';

const state = $state<{
	status: SessionStatus;
	profile: AuthProfile | null;
	endReason: SessionEndReason | null;
}>({
	status: 'unknown',
	profile: null,
	endReason: null
});

/** Leitura reativa da sessão. Somente leitura: altere via login/logout. */
export const auth = {
	get status(): SessionStatus {
		return state.status;
	},
	get endReason(): SessionEndReason | null {
		return state.endReason;
	},
	get isAuthenticated(): boolean {
		return state.status === 'authenticated';
	},
	get user(): AuthUser | null {
		return state.profile?.user ?? null;
	},
	get activeTenant(): AuthMembership | null {
		return state.profile?.activeTenant ?? null;
	},
	get tenants(): AuthMembership[] {
		return state.profile?.tenants ?? [];
	}
};

export type LoginCredentials = {
	email: string;
	password: string;
	rememberMe: boolean;
};

let refreshInFlight: Promise<boolean> | null = null;
let renewalTimer: ReturnType<typeof setTimeout> | undefined;

// Sincroniza abas do mesmo navegador. As mensagens nunca carregam tokens.
type TabMessage = { type: 'login' } | { type: 'logout' };
const tabChannel = browser && 'BroadcastChannel' in window ? new BroadcastChannel('auth') : null;

function applyAuthResponse(response: AuthResponse): void {
	storeAccessToken(response.accessToken, response.expiresIn);
	state.profile = {
		user: response.user,
		activeTenant: response.activeTenant,
		tenants: response.tenants
	};
	state.status = 'authenticated';
	state.endReason = null;
	scheduleRenewal();
}

function clearSession(reason: SessionEndReason): void {
	const wasAuthenticated = state.status === 'authenticated';

	clearTimeout(renewalTimer);
	clearAccessToken();
	state.profile = null;
	state.status = 'anonymous';
	// Sem sessão anterior (ex.: primeira visita), não há o que avisar.
	state.endReason = wasAuthenticated ? reason : null;
}

/** Renova o access token um pouco antes de ele vencer. */
function scheduleRenewal(): void {
	clearTimeout(renewalTimer);
	renewalTimer = setTimeout(() => {
		refreshSession().catch(() => {
			// Falha de rede: a próxima requisição tenta de novo sob demanda.
		});
	}, msUntilRenewal());
}

/**
 * Serializa o refresh entre abas (Web Locks API). Como o refresh token é
 * rotacionado a cada uso, duas abas renovando juntas poderiam parecer reuso
 * de token e derrubar a sessão; com o lock, uma espera a outra e usa o
 * cookie já atualizado.
 */
function withCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
	if (browser && 'locks' in navigator) {
		return navigator.locks.request('auth:refresh', task);
	}

	return task();
}

/**
 * Troca o refresh token (cookie) por um novo access token. Chamadas
 * simultâneas na mesma aba compartilham uma única requisição.
 *
 * Retorna false quando não há sessão válida. Erros de rede ou do servidor são
 * relançados sem derrubar a sessão: uma instabilidade não deve deslogar.
 */
export function refreshSession(): Promise<boolean> {
	refreshInFlight ??= withCrossTabLock(async () => {
		try {
			applyAuthResponse(
				await httpRequest<AuthResponse>('/auth/refresh', {
					method: 'POST',
					withCredentials: true
				})
			);

			return true;
		} catch (error) {
			if (error instanceof ApiError && error.status === 401) {
				clearSession('expired');
				return false;
			}

			throw error;
		}
	}).finally(() => {
		refreshInFlight = null;
	});

	return refreshInFlight;
}

/**
 * Garante uma sessão válida antes de entrar numa rota protegida. Na primeira
 * carga da página (ou após um F5) restaura a sessão a partir do cookie.
 */
export async function ensureSession(): Promise<boolean> {
	if (state.status === 'anonymous') return false;
	if (state.status === 'authenticated' && readAccessToken()) return true;

	return refreshSession();
}

/** Access token válido para chamadas à API, renovando-o se preciso. */
export async function getAccessToken(): Promise<string> {
	const token = readAccessToken() ?? ((await refreshSession()) ? readAccessToken() : null);

	if (!token) throw new ApiError(401, 'UNAUTHENTICATED');

	return token;
}

export async function login(credentials: LoginCredentials): Promise<void> {
	applyAuthResponse(
		await httpRequest<AuthResponse>('/auth/login', {
			method: 'POST',
			body: credentials,
			withCredentials: true
		})
	);

	tabChannel?.postMessage({ type: 'login' } satisfies TabMessage);
}

/** Encerra a sessão na API e localmente. Nunca falha para quem chama. */
export async function logout(): Promise<void> {
	try {
		await httpRequest<void>('/auth/logout', { method: 'POST', withCredentials: true });
	} catch {
		// Mesmo sem resposta da API, a sessão local é descartada.
	} finally {
		clearSession('logout');
		tabChannel?.postMessage({ type: 'logout' } satisfies TabMessage);
	}
}

if (browser) {
	tabChannel?.addEventListener('message', (event: MessageEvent<TabMessage>) => {
		if (event.data?.type === 'logout') {
			clearSession('logout');
		} else if (event.data?.type === 'login' && state.status !== 'authenticated') {
			// Outra aba entrou: a próxima verificação restaura a sessão pelo cookie.
			state.status = 'unknown';
		}
	});

	// Timers ficam congelados em abas em segundo plano: ao voltar, renova se preciso.
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible' && auth.isAuthenticated && !readAccessToken()) {
			refreshSession().catch(() => {});
		}
	});
}
