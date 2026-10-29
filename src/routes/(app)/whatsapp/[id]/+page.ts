import { error } from '@sveltejs/kit';
import { getTrackingPixel } from '#lib/services/tracking.js';
import { getWhatsAppAutomation } from '#lib/services/whatsappAutomations.js';
import type { TrackingPixel, WhatsAppAutomation } from '#lib/types.js';
import type { PageLoad } from './$types';

export type EditAutomationData = {
	automation: WhatsAppAutomation;
	pixel: TrackingPixel | null;
};

export const load: PageLoad = async ({ parent, params }) => {
	const { experts, launches, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const editor: Promise<EditAutomationData | null> = expert
		? Promise.all([
				getWhatsAppAutomation(expert.id, params.id),
				getTrackingPixel(expert.id).catch(() => null)
			]).then(([automation, pixel]) => {
				if (!automation) error(404, 'Automação não encontrada.');
				return { automation, pixel };
			})
		: Promise.resolve(null);
	return { expert, launches, editor };
};
