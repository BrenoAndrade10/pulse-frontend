import { getTrackingPixel } from '#lib/services/tracking.js';
import type { TrackingPixel } from '#lib/types.js';
import type { PageLoad } from './$types';

export type NewAutomationData = {
	pixel: TrackingPixel | null;
};

export const load: PageLoad = async ({ parent }) => {
	const { experts, launches, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const editor: Promise<NewAutomationData | null> = expert
		? getTrackingPixel(expert.id)
				.then((pixel) => ({ pixel }))
				.catch(() => ({ pixel: null }))
		: Promise.resolve(null);
	return { expert, launches, editor };
};
