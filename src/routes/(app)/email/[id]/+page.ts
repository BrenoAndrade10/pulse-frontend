import { getCampaign } from '#lib/services/email.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { selectedExpertId } = await parent();
	if (!selectedExpertId) return { campaign: null, expertId: null };

	try {
		return {
			campaign: await getCampaign(selectedExpertId, params.id),
			expertId: selectedExpertId
		};
	} catch {
		return { campaign: null, expertId: selectedExpertId };
	}
};
