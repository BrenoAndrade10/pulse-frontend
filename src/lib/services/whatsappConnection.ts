import { ApiError } from '#lib/api/http.js';
import { apiRequest } from '#lib/api/client.js';
import type { WhatsAppConnection } from '#lib/types.js';

export type WhatsAppConnectionInput = {
	code: string;
	wabaId: string;
	phoneNumberId: string;
};

export function getWhatsAppConnection(expertId: string): Promise<WhatsAppConnection> {
	return apiRequest<WhatsAppConnection>(`/experts/${expertId}/whatsapp/connection`);
}

export function connectWhatsApp(
	expertId: string,
	input: WhatsAppConnectionInput
): Promise<WhatsAppConnection> {
	return apiRequest<WhatsAppConnection>(`/experts/${expertId}/whatsapp/connection`, {
		method: 'POST',
		body: input
	});
}

export function disconnectWhatsApp(expertId: string): Promise<void> {
	return apiRequest<void>(`/experts/${expertId}/whatsapp/connection`, { method: 'DELETE' });
}

const ERROR_MESSAGES: Record<string, string> = {
	WHATSAPP_NOT_CONFIGURED: 'O WhatsApp ainda não foi configurado nesta instalação.',
	WHATSAPP_ACCOUNT_NOT_AUTHORIZED:
		'Esta conta do WhatsApp não está autorizada para esta instalação.',
	WHATSAPP_NUMBER_ALREADY_CONNECTED: 'Este número do WhatsApp já está conectado a outro expert.'
};

export function whatsappConnectionErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		return (
			ERROR_MESSAGES[error.reason] ??
			(error.status === 0
				? 'Não foi possível acessar o servidor. Verifique sua conexão e tente novamente.'
				: 'Não foi possível concluir a operação com o WhatsApp. Tente novamente.')
		);
	}

	return 'Não foi possível concluir a operação com o WhatsApp. Tente novamente.';
}
