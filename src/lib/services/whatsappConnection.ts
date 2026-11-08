import { ApiError } from '#lib/api/http.js';
import { apiRequest } from '#lib/api/client.js';
import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
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

const ERROR_MESSAGES: Record<string, MessageKey> = {
	WHATSAPP_NOT_CONFIGURED: 'integrations.whatsapp.errors.notConfigured',
	WHATSAPP_ACCOUNT_NOT_AUTHORIZED: 'integrations.whatsapp.errors.notAuthorized',
	WHATSAPP_NUMBER_ALREADY_CONNECTED: 'integrations.whatsapp.errors.numberAlreadyConnected'
};

export function whatsappConnectionErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		const key = ERROR_MESSAGES[error.reason];
		if (key) return t(key);

		return t(
			error.status === 0
				? 'integrations.whatsapp.errors.network'
				: 'integrations.whatsapp.errors.generic'
		);
	}

	return t('integrations.whatsapp.errors.generic');
}
