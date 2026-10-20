import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const { experts } = await parent();
	return { experts };
};
