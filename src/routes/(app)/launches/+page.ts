import { ApiError } from '#lib/api/http.js';
import { listLaunches } from '#lib/services/launches.js';
import type { Launch } from '#lib/types.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
	const {
		experts,
		launches,
		launchesBackendUnavailable,
		selectedExpertId: expertId
	} = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;

	if (expert) {
		return { expert, experts, launches, backendUnavailable: launchesBackendUnavailable };
	}

	try {
		const byExpert = await Promise.all(experts.map((item) => listLaunches(item.id)));
		const all: Launch[] = byExpert.flat();

		return { expert, experts, launches: all, backendUnavailable: false };
	} catch (err) {
		if (err instanceof ApiError && (err.status === 0 || err.status === 404 || err.status >= 500)) {
			return { expert, experts, launches: [] as Launch[], backendUnavailable: true };
		}

		throw err;
	}
};
