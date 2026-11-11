import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { experts, launches, selectedExpertId, selectedLaunchId } = await parent();
	return { experts, launches, selectedExpertId, selectedLaunchId };
};
