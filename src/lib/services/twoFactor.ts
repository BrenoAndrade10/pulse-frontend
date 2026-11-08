import { ApiError, httpRequest } from '#lib/api/http.js';
import { apiRequest } from '#lib/api/client.js';
import { completeLogin } from '#lib/auth/session.svelte.js';
import type { AuthResponse } from '#lib/auth/types.js';
import { t } from '#lib/i18n/index.svelte.js';
import { AuthError, toAuthError } from '#lib/services/auth.js';

export type TwoFactorSetup = { otpauthUri: string; secret: string; expiresAt: string };
export type TwoFactorStatus = {
	enabled: boolean;
	confirmedAt: string | null;
	recoveryCodesRemaining: number;
};
export type TrustedDevice = {
	id: string;
	label: string;
	createdAt: string;
	lastUsedAt: string;
	expiresAt: string;
	current: boolean;
};
type ChallengeResult = AuthResponse & {
	recoveryCodesRemaining?: number;
};

const messages = (): Record<string, string> => ({
	AUTH_CHALLENGE_INVALID: t('auth.errors.challengeExpired'),
	TWO_FACTOR_CODE_INVALID: t('auth.errors.codeInvalid'),
	EMAIL_CODE_INVALID: t('auth.errors.codeInvalid'),
	EMAIL_LOGIN_CODE_INVALID: t('auth.errors.codeInvalid')
});

function challengeError(error: unknown): Error {
	return toAuthError(error, messages(), t('auth.errors.verifyFailed'));
}

export async function verifyEmailChallenge(
	challengeToken: string,
	code: string,
	trustDevice: boolean
): Promise<void> {
	try {
		const response = await httpRequest<AuthResponse>('/auth/challenge/email/verify', {
			method: 'POST',
			body: { challengeToken, code, trustDevice },
			withCredentials: true
		});
		completeLogin(response);
	} catch (error) {
		throw challengeError(error);
	}
}

export async function resendEmailChallenge(challengeToken: string): Promise<void> {
	try {
		await httpRequest<void>('/auth/challenge/email/resend', {
			method: 'POST',
			body: { challengeToken },
			withCredentials: true
		});
	} catch (error) {
		throw challengeError(error);
	}
}

export async function verifyChallenge(
	challengeToken: string,
	input: { code?: string; recoveryCode?: string; trustDevice: boolean }
): Promise<number | undefined> {
	try {
		const response = await httpRequest<ChallengeResult>('/auth/challenge/2fa/verify', {
			method: 'POST',
			body: { challengeToken, ...input },
			withCredentials: true
		});
		completeLogin(response);
		return response.recoveryCodesRemaining;
	} catch (error) {
		throw challengeError(error);
	}
}

export function getTwoFactorStatus(): Promise<TwoFactorStatus> {
	return apiRequest<TwoFactorStatus>('/auth/2fa', { withCredentials: true });
}

export async function setupTwoFactor(): Promise<TwoFactorSetup> {
	try {
		return await apiRequest<TwoFactorSetup>('/auth/2fa/setup', {
			method: 'POST',
			withCredentials: true
		});
	} catch (error) {
		throw toAuthError(error, messages(), t('auth.errors.setupFailed'));
	}
}

export async function confirmTwoFactor(code: string): Promise<string[]> {
	try {
		const response = await apiRequest<{ recoveryCodes: string[] }>('/auth/2fa/confirm', {
			method: 'POST',
			body: { code },
			withCredentials: true
		});
		return response.recoveryCodes;
	} catch (error) {
		throw toAuthError(error, messages(), t('auth.errors.activateFailed'));
	}
}

export async function regenerateRecoveryCodes(code: string): Promise<string[]> {
	try {
		const response = await apiRequest<{ recoveryCodes: string[] }>('/auth/2fa/recovery-codes', {
			method: 'POST',
			body: { code },
			withCredentials: true
		});
		return response.recoveryCodes;
	} catch (error) {
		if (error instanceof ApiError) {
			throw toAuthError(error, messages(), t('auth.errors.regenerateFailed'));
		}
		throw new AuthError(t('auth.errors.regenerateFailed'));
	}
}

export function listTrustedDevices(): Promise<TrustedDevice[]> {
	return apiRequest<TrustedDevice[]>('/auth/2fa/devices', { withCredentials: true });
}

export function revokeTrustedDevice(id: string): Promise<void> {
	return apiRequest<void>(`/auth/2fa/devices/${id}`, {
		method: 'DELETE',
		withCredentials: true
	});
}
