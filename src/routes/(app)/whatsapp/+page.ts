import { listWhatsAppAutomations } from '#lib/services/whatsappAutomations.js';
import type { WhatsAppAutomation } from '#lib/types.js';
import type { PageLoad } from './$types';

export type AutomationsState =
	{ status: 'ready'; automations: WhatsAppAutomation[] } | { status: 'error' };

export const load: PageLoad = async ({ parent }) => {
	const { experts, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const automations: Promise<AutomationsState> = expert
		? listWhatsAppAutomations(expert.id).then(
				(items): AutomationsState => ({ status: 'ready', automations: items }),
				(): AutomationsState => ({ status: 'error' })
			)
		: Promise.resolve({ status: 'ready', automations: [] });

	return { expert, automations };
};
