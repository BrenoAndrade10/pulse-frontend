import { ApiError } from '#lib/api/http.js';
import { listLeads } from '#lib/services/leads.js';
import type { LeadsPage } from '#lib/types.js';
import type { PageLoad } from './$types';

export type LeadsState = { status: 'ready'; page: LeadsPage } | { status: 'error'; reason: string };

/** Filtros na URL (?launch=&q=); a primeira página chega como promise, com skeleton. */
export const load: PageLoad = async ({ parent, url }) => {
	const { experts, launches, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const launchId = url.searchParams.get('launch') ?? '';
	const search = url.searchParams.get('q') ?? '';

	const leads: Promise<LeadsState> = expert
		? listLeads(expert.id, { launchId: launchId || undefined, search: search || undefined }).then(
				(page): LeadsState => ({ status: 'ready', page }),
				(error): LeadsState => ({
					status: 'error',
					reason: error instanceof ApiError ? error.reason : 'UNEXPECTED_ERROR'
				})
			)
		: Promise.resolve({ status: 'ready', page: { data: [], total: 0, nextCursor: null } });

	return { expert, launches, launchId, search, leads };
};
