import { getTrackingPixel } from '#lib/services/tracking.js';
import { loadWhatsAppGroups, type WhatsAppGroupsState } from '#lib/services/whatsappAutomations.js';
import type { TrackingPixel } from '#lib/types.js';
import type { PageLoad } from './$types';

export type NewAutomationData = {
	pixel: TrackingPixel | null;
	groups: WhatsAppGroupsState;
};

export const load: PageLoad = async ({ parent }) => {
	const { experts, launches, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const editor: Promise<NewAutomationData | null> = expert
		? Promise.all([
				getTrackingPixel(expert.id).catch(() => null),
				loadWhatsAppGroups(expert.id)
			]).then(([pixel, groups]) => ({ pixel, groups }))
		: Promise.resolve(null);
	return { expert, launches, editor };
};
