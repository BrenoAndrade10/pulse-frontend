import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { experts, selectedExpertId } = await parent();
	return { experts, selectedExpertId };
};
