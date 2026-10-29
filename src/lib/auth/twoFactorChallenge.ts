import type { TwoFactorChallenge } from '#lib/auth/types.js';

let challenge: TwoFactorChallenge | null = null;

export function setTwoFactorChallenge(value: TwoFactorChallenge): void {
	challenge = value;
}

export function getTwoFactorChallenge(): TwoFactorChallenge | null {
	if (challenge && new Date(challenge.expiresAt).getTime() > Date.now()) return challenge;
	challenge = null;
	return null;
}

export function clearTwoFactorChallenge(): void {
	challenge = null;
}
