import { t } from '#lib/i18n/index.svelte.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(value: string): string | undefined {
	if (!value.trim()) return t('auth.validation.emailRequired');
	if (!EMAIL_REGEX.test(value.trim())) return t('auth.validation.emailInvalid');
}

export function validateRequired(value: string, message: string): string | undefined {
	if (!value.trim()) return message;
}

export function validatePassword(value: string): string | undefined {
	if (!value) return t('auth.validation.passwordRequired');
	if (value.length < MIN_PASSWORD_LENGTH)
		return t('auth.validation.passwordTooShort', { min: MIN_PASSWORD_LENGTH });
}

export type PasswordStrength = { score: 0 | 1 | 2 | 3 | 4; label: string };

export function getPasswordStrength(value: string): PasswordStrength {
	if (!value) return { score: 0, label: '' };

	let score = 0;
	if (value.length >= MIN_PASSWORD_LENGTH) score++;
	if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
	if (/\d/.test(value)) score++;
	if (/[^A-Za-z0-9]/.test(value)) score++;

	const labels = [
		t('auth.validation.passwordStrength.veryWeak'),
		t('auth.validation.passwordStrength.weak'),
		t('auth.validation.passwordStrength.fair'),
		t('auth.validation.passwordStrength.good'),
		t('auth.validation.passwordStrength.strong')
	];
	return { score: score as PasswordStrength['score'], label: labels[score] };
}
