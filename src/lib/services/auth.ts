import { ApiError, httpRequest } from '#lib/api/http.js';
import * as session from '#lib/auth/session.svelte.js';

export type LoginPayload = { email: string; password: string; remember: boolean };
export type RegisterPayload = { name: string; email: string; company: string; password: string };

/** Erro com mensagem pronta para exibir ao usuário. */
export class AuthError extends Error {}

const NETWORK_MESSAGE = 'Não foi possível conectar ao servidor. Verifique sua conexão.';

function toAuthError(error: unknown, messages: Record<string, string>, fallback: string): Error {
	if (!(error instanceof ApiError)) return error instanceof Error ? error : new Error(fallback);
	if (error.status === 0) return new AuthError(NETWORK_MESSAGE);
	if (error.status === 429)
		return new AuthError('Muitas tentativas. Aguarde um pouco e tente de novo.');

	const known = messages[error.reason];
	if (known) return new AuthError(known);

	// Mensagens de validação da API já vêm em português.
	const [validationMessage] = error.validationMessages;
	if (validationMessage) return new AuthError(validationMessage);

	return new AuthError(fallback);
}

export async function login(payload: LoginPayload): Promise<void> {
	try {
		await session.login({
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

export const logout = session.logout;
