import { getDashboard, parsePeriod } from '#lib/services/dashboard.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, parent }) => {
	const period = parsePeriod(url.searchParams.get('period'));
	const { experts, selectedExpertId: expertId, selectedLaunchId: launchId } = await parent();

	const dashboard = await getDashboard({ period, expertId, launchId });

	return { experts, dashboard, period, expertId, launchId };
};
