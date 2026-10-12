import { getDashboard, parsePeriod } from '#lib/services/dashboard.js';
import { listExperts } from '#lib/services/experts.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url }) => {
	const period = parsePeriod(url.searchParams.get('period'));
	const expertId = url.searchParams.get('expert');

	const [experts, dashboard] = await Promise.all([
		listExperts(),
		getDashboard({ period, expertId })
	]);

	return { experts, dashboard, period, expertId };
};
