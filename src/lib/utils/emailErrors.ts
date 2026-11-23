import { ApiError } from '#lib/api/http.js';
import { t, type MessageKey } from '#lib/i18n/index.svelte.js';

const KEYS: Record<string, MessageKey> = {
	EMAIL_DOMAIN_TAKEN: 'email.settings.errors.taken',
	EMAIL_DOMAIN_REQUIRED: 'email.settings.errors.domainRequired',
	EMAIL_DOMAIN_NOT_VERIFIED: 'email.settings.errors.notVerified',
	EMAIL_PROVIDER_UNAVAILABLE: 'email.settings.errors.unavailable',
	EMAIL_DOMAIN_INVALID: 'email.settings.errors.domainInvalid',
	EMAIL_SENDER_INVALID: 'email.settings.errors.senderInvalid',
	EMAIL_PROVIDER_REJECTED: 'email.settings.errors.providerRejected',
	EMAIL_CAMPAIGN_NOT_FOUND: 'email.settings.errors.campaignNotFound',
	EMAIL_CAMPAIGN_LOCKED: 'email.settings.errors.campaignLocked',
	EMAIL_CAMPAIGN_INVALID: 'email.settings.errors.campaignInvalid',
	EMAIL_SCHEDULE_INVALID: 'email.settings.errors.scheduleInvalid'
};

export function emailErrorMessage(error: unknown): string {
	if (!(error instanceof ApiError)) return t('email.settings.errors.generic');
	if (error.validationMessages.length > 0) return error.validationMessages.join(' ');
	return t(KEYS[error.reason] ?? 'email.settings.errors.generic');
}
