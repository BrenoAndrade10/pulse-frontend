import { apiRequest } from '#lib/api/client.js';
import { ApiError } from '#lib/api/http.js';
import type { TrackingPixel } from '#lib/types.js';

export class PopupBlockedError extends Error {}

const basePath = (expertId: string) => `/experts/${encodeURIComponent(expertId)}/tracking`;

export async function getTrackingPixel(expertId: string): Promise<TrackingPixel | null> {
	try {
		return await apiRequest<TrackingPixel>(`${basePath(expertId)}/pixel`);
	} catch (error) {
		if (error instanceof ApiError && error.reason === 'TRACKING_PIXEL_NOT_FOUND') return null;
		throw error;
	}
}

export function createTrackingPixel(expertId: string): Promise<TrackingPixel> {
	return apiRequest<TrackingPixel>(`${basePath(expertId)}/pixel`, { method: 'POST' });
}

export async function openTrackingSetup(expertId: string, url: string): Promise<void> {
	const tab = window.open('about:blank', '_blank');

	if (!tab) {
		throw new PopupBlockedError();
	}

	try {
		const { setupUrl } = await apiRequest<{ setupUrl: string }>(
			`${basePath(expertId)}/setup-sessions`,
			{ method: 'POST', body: { url } }
		);
		tab.opener = null;
		tab.location.replace(setupUrl);
	} catch (error) {
		tab.close();
		throw error;
	}
}

export async function setTrackingPageLaunch(
	expertId: string,
	url: string,
	launchId: string | null
): Promise<void> {
	await apiRequest<void>(`${basePath(expertId)}/pages`, {
		method: 'PUT',
		body: { url, launchId }
	});
}
