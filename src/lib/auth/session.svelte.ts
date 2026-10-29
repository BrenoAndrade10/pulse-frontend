import { browser } from '$app/env';
import { ApiError, httpRequest } from '#lib/api/http.js';
import {
	clearAccessToken,
	msUntilRenewal,
	readAccessToken,
	storeAccessToken
} from '#lib/auth/tokenVault.js';
import type {
	AuthMembership,
	AuthProfile,
	AuthResponse,
	AuthUser,
	LoginResponse,
	TwoFactorChallenge
} from '#lib/auth/types.js';

type SessionStatus = 'unknown' | 'authenticated' | 'anonymous';

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

export function completeLogin(response: AuthResponse): void {
	applyAuthResponse(response);
	tabChannel?.postMessage({ type: 'login' } satisfies TabMessage);
}

function clearSession(reason: SessionEndReason): void {
	const wasAuthenticated = state.status === 'authenticated';

	clearTimeout(renewalTimer);
	clearAccessToken();
	state.profile = null;
	state.status = 'anonymous';
	state.endReason = wasAuthenticated ? reason : null;
}

function scheduleRenewal(): void {
	clearTimeout(renewalTimer);
	renewalTimer = setTimeout(() => {
		refreshSession().catch(() => {});
	}, msUntilRenewal());
}

function withCrossTabLock<T>(task: () => Promise<T>): Promise<T> {
	if (browser && 'locks' in navigator) {
		return navigator.locks.request('auth:refresh', task);
	}

	return task();
}

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

export async function ensureSession(): Promise<boolean> {
	if (state.status === 'anonymous') return false;
	if (state.status === 'authenticated' && readAccessToken()) return true;

	return refreshSession();
}

export async function getAccessToken(): Promise<string> {
	const token = readAccessToken() ?? ((await refreshSession()) ? readAccessToken() : null);

	if (!token) throw new ApiError(401, 'UNAUTHENTICATED');

	return token;
}

export async function login(credentials: LoginCredentials): Promise<TwoFactorChallenge | null> {
	const response = await httpRequest<LoginResponse>('/auth/login', {
		method: 'POST',
		body: credentials,
		withCredentials: true
	});
	if ('status' in response) return response;
	completeLogin(response);
	return null;
}

export async function logout(): Promise<void> {
	try {
		await httpRequest<void>('/auth/logout', { method: 'POST', withCredentials: true });
	} catch {
		// Ignore errors from the API request.
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
			state.status = 'unknown';
		}
	});

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible' && auth.isAuthenticated && !readAccessToken()) {
			refreshSession().catch(() => {});
		}
	});
}
