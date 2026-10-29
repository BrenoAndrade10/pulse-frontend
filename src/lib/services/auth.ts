import { ApiError, httpRequest } from '#lib/api/http.js';
import * as session from '#lib/auth/session.svelte.js';

export type LoginPayload = { email: string; password: string; remember: boolean };
export type RegisterPayload = { name: string; email: string; company: string; password: string };
export const PASSWORD_RESET_EMAIL_STORAGE_KEY = 'pulse:password-reset-email';

/** Erro com mensagem pronta para exibir ao usuário. */
export class AuthError extends Error {
	constructor(
		message: string,
		readonly retryAfterSeconds?: number,
		readonly reason?: string
	) {
		super(message);
		this.name = 'AuthError';
	}
}

const NETWORK_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão.';

function tooManyAttemptsMessage(seconds: number): string {
	const minutes = Math.max(1, Math.ceil(seconds / 60));
	return `Muitas tentativas. Tente novamente em ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}.`;
}

export function toAuthError(
	error: unknown,
	messages: Record<string, string>,
	fallback: string
): Error {
	if (!(error instanceof ApiError)) return error instanceof Error ? error : new Error(fallback);
	if (error.status === 0) return new AuthError(NETWORK_MESSAGE, undefined, error.reason);
	if (error.status === 429) {
		const retryAfterSeconds = error.retryAfterSeconds ?? 60;
		return new AuthError(
			tooManyAttemptsMessage(retryAfterSeconds),
			retryAfterSeconds,
			error.reason
		);
	}

	const known = messages[error.reason];
	if (known) return new AuthError(known, undefined, error.reason);

	// Mensagens de validação da API já vêm em português.
	const [validationMessage] = error.validationMessages;
	if (validationMessage) return new AuthError(validationMessage, undefined, error.reason);

	return new AuthError(fallback, undefined, error.reason);
}

export async function login(payload: LoginPayload) {
	try {
		return await session.login({
			email: payload.email,
			password: payload.password,
			rememberMe: payload.remember
		});
	} catch (error) {
		throw toAuthError(
			error,
			{
				// A API não diferencia e-mail inexistente de senha errada, de propósito.
				INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
				TENANT_ACCESS_DENIED: 'Você não tem acesso a esta empresa.'
			},
			'Não foi possível entrar. Tente novamente.'
		);
	}
}

export async function register(payload: RegisterPayload): Promise<void> {
	const [firstName, ...lastNameParts] = payload.name.trim().split(/\s+/);
	const lastName = lastNameParts.join(' ');
	const company = payload.company.trim();

	try {
		await httpRequest('/users', {
			method: 'POST',
			body: {
				firstName,
				...(lastName && { lastName }),
				email: payload.email.trim(),
				password: payload.password,
				// Com empresa informada, a conta nasce como admin de um tenant novo.
				...(company && { tenantName: company })
			}
		});
	} catch (error) {
		throw toAuthError(
			error,
			{
				USER_ALREADY_EXISTS: 'Já existe uma conta com este e-mail. Tente entrar.',
				TENANT_ALREADY_EXISTS:
					'Já existe uma empresa com este nome. Use outro nome ou peça um convite ao administrador.'
			},
			'Não foi possível criar sua conta. Tente novamente.'
		);
	}
}

export async function requestPasswordReset(email: string): Promise<void> {
	try {
		await httpRequest<{ message: string }>('/auth/password/forgot', {
			method: 'POST',
			body: { email: email.trim() }
		});
	} catch (error) {
		if (error instanceof ApiError && error.status !== 0 && error.status !== 429) return;
		throw toAuthError(error, {}, 'Não foi possível solicitar a redefinição. Tente novamente.');
	}
}

export async function resetPassword(token: string, password: string): Promise<void> {
	try {
		await httpRequest<void>('/auth/password/reset', {
			method: 'POST',
			body: { token, password }
		});
	} catch (error) {
		throw toAuthError(
			error,
			{ PASSWORD_RESET_TOKEN_INVALID: 'Link inválido ou expirado.' },
			'Não foi possível alterar sua senha. Tente novamente.'
		);
	}
}

export const logout = session.logout;
