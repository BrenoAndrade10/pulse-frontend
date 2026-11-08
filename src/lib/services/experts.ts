import { apiRequest } from '#lib/api/client.js';
import { i18n, t, type MessageKey } from '#lib/i18n/index.svelte.js';
import type { Expert, ExpertInput, ExpertStatus } from '#lib/types.js';

export class IntegrationUnavailableError extends Error {}

export const INSTAGRAM_OAUTH_MESSAGE = 'instagram-oauth-complete';
export const INSTAGRAM_OAUTH_CHANNEL = 'instagram-oauth';
export const INSTAGRAM_OAUTH_POPUP_FLAG = 'instagram-oauth-popup';

export type InstagramOAuthResult = {
	type: typeof INSTAGRAM_OAUTH_MESSAGE;
	status: 'connected' | 'error';
	reason?: string;
};

const INSTAGRAM_OAUTH_ERRORS: Record<string, MessageKey> = {
	denied: 'integrations.instagram.oauthErrors.denied',
	invalid_state: 'integrations.instagram.oauthErrors.invalidState',
	expert_not_found: 'integrations.instagram.oauthErrors.expertNotFound',
	exchange_failed: 'integrations.instagram.oauthErrors.exchangeFailed',
	missing_permissions: 'integrations.instagram.oauthErrors.missingPermissions',
	no_instagram_account: 'integrations.instagram.oauthErrors.noInstagramAccount',
	multiple_instagram_accounts: 'integrations.instagram.oauthErrors.multipleInstagramAccounts',
	account_already_connected: 'integrations.instagram.oauthErrors.accountAlreadyConnected'
};

export function isInstagramOAuthResult(value: unknown): value is InstagramOAuthResult {
	return (
		typeof value === 'object' &&
		value !== null &&
		(value as InstagramOAuthResult).type === INSTAGRAM_OAUTH_MESSAGE &&
		['connected', 'error'].includes((value as InstagramOAuthResult).status)
	);
}

export function instagramOAuthErrorMessage(reason?: string | null): string {
	const key = reason ? INSTAGRAM_OAUTH_ERRORS[reason] : undefined;

	return t(key ?? 'integrations.instagram.oauthErrors.generic');
}

type ExpertApiResponse = {
	id: string;
	name: string;
	commercialName: string | null;
	email: string;
	status: ExpertStatus;
	createdAt: string;
	updatedAt: string;
};

type InstagramConnectionApiResponse = {
	expertId: string;
	status: 'connected' | 'expired';
	username: string | null;
	connectedAt: string;
	expiresAt: string | null;
};

const disconnectedInstagram = (): Expert['instagram'] => ({
	status: 'disconnected',
	accountName: null,
	connectedAt: null
});

async function listInstagramConnections(): Promise<Map<string, Expert['instagram']>> {
	const response = await apiRequest<InstagramConnectionApiResponse[]>(
		'/meta/instagram/connections'
	);

	return new Map(
		response.map((connection) => [
			connection.expertId,
			{
				status: connection.status,
				accountName: connection.username,
				connectedAt: connection.connectedAt
			}
		])
	);
}

function toExpert(
	response: ExpertApiResponse,
	instagram: Expert['instagram'] = disconnectedInstagram()
): Expert {
	return {
		...response,
		instagram
	};
}

export async function listExperts(): Promise<Expert[]> {
	const [response, connections] = await Promise.all([
		apiRequest<ExpertApiResponse[]>('/experts'),
		listInstagramConnections()
	]);
	const experts = response.map((expert) => toExpert(expert, connections.get(expert.id)));

	return experts.sort((a, b) => a.name.localeCompare(b.name, i18n.intl));
}

export async function getExpert(id: string): Promise<Expert | null> {
	return (await listExperts()).find((expert) => expert.id === id) ?? null;
}

export async function createExpert(input: ExpertInput): Promise<Expert> {
	return toExpert(
		await apiRequest<ExpertApiResponse>('/experts', {
			method: 'POST',
			body: input
		})
	);
}

export async function updateExpert(id: string, input: ExpertInput): Promise<Expert> {
	return toExpert(
		await apiRequest<ExpertApiResponse>(`/experts/${encodeURIComponent(id)}`, {
			method: 'PATCH',
			body: input
		})
	);
}

export async function deleteExpert(id: string): Promise<void> {
	await apiRequest<void>(`/experts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function connectInstagram(expertId: string): Promise<void> {
	const width = 520;
	const height = 720;
	const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
	const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
	const popup = window.open(
		'about:blank',
		INSTAGRAM_OAUTH_CHANNEL,
		`popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`
	);

	if (!popup) {
		throw new IntegrationUnavailableError(t('integrations.instagram.popupBlocked'));
	}

	popup.sessionStorage.setItem(INSTAGRAM_OAUTH_POPUP_FLAG, '1');

	let response:
		| string
		| {
				url?: string;
				redirectUrl?: string;
				authorizationUrl?: string;
		  };

	try {
		response = await apiRequest('/meta/instagram/authorizations', {
			method: 'POST',
			body: { expertId }
		});
	} catch (error) {
		popup.close();
		throw error;
	}

	const redirectUrl =
		typeof response === 'string'
			? response
			: (response.redirectUrl ?? response.authorizationUrl ?? response.url);

	if (!redirectUrl) {
		popup.close();
		throw new IntegrationUnavailableError(t('integrations.instagram.missingAuthorizationUrl'));
	}

	popup.location.replace(redirectUrl);
	popup.focus();
}

export async function disconnectInstagram(expertId: string): Promise<void> {
	await apiRequest<void>(`/meta/instagram/connections/${encodeURIComponent(expertId)}`, {
		method: 'DELETE'
	});
}
