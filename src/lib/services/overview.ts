import { apiRequest } from '#lib/api/client.js';
import type { CaptureOverview, Period } from '#lib/types.js';

export function getCaptureOverview(
	expertId: string,
	period: Period,
	launchId?: string
): Promise<CaptureOverview> {
	const params = new URLSearchParams({ period });
	if (launchId) params.set('launchId', launchId);
	return apiRequest<CaptureOverview>(`/experts/${encodeURIComponent(expertId)}/overview?${params}`);
}
