import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const {
		experts,
		launches,
		launchesBackendUnavailable,
		selectedExpertId: expertId
	} = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;

	return { expert, launches, backendUnavailable: launchesBackendUnavailable };
};
