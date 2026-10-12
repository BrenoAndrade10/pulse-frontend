const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateEmail(value: string): string | undefined {
	if (!value.trim()) return 'Informe seu e-mail.';
	if (!EMAIL_REGEX.test(value.trim())) return 'E-mail inválido.';
}

export function validateRequired(value: string, message: string): string | undefined {
	if (!value.trim()) return message;
}

export function validatePassword(value: string): string | undefined {
	if (!value) return 'Informe uma senha.';
	if (value.length < MIN_PASSWORD_LENGTH)
		return `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;
}

export type PasswordStrength = { score: 0 | 1 | 2 | 3 | 4; label: string };

export function getPasswordStrength(value: string): PasswordStrength {
	if (!value) return { score: 0, label: '' };

	let score = 0;
	if (value.length >= MIN_PASSWORD_LENGTH) score++;
	if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
	if (/\d/.test(value)) score++;
	if (/[^A-Za-z0-9]/.test(value)) score++;

	const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'];
	return { score: score as PasswordStrength['score'], label: labels[score] };
}
