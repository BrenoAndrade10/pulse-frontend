import { error } from '@sveltejs/kit';
import { getTrackingPixel } from '#lib/services/tracking.js';
import {
	getWhatsAppAutomation,
	loadWhatsAppGroups,
	type WhatsAppGroupsState
} from '#lib/services/whatsappAutomations.js';
import type { TrackingPixel, WhatsAppAutomation } from '#lib/types.js';
import type { PageLoad } from './$types';

export type EditAutomationData = {
	automation: WhatsAppAutomation;
	pixel: TrackingPixel | null;
	groups: WhatsAppGroupsState;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { experts, launches, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const editor: Promise<EditAutomationData | null> = expert
		? Promise.all([
				getWhatsAppAutomation(expert.id, params.id),
				getTrackingPixel(expert.id).catch(() => null),
				loadWhatsAppGroups(expert.id)
			]).then(([automation, pixel, groups]) => {
				if (!automation) error(404, 'Automação não encontrada.');
				return { automation, pixel, groups };
			})
		: Promise.resolve(null);
	return { expert, launches, editor };
};
