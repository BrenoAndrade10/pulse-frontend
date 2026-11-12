import { ApiError } from '#lib/api/http.js';
import { listLinks } from '#lib/services/links.js';
import type { LinkPage } from '#lib/types.js';
import type { PageLoad } from './$types';

export type LinksState = { status: 'ready'; page: LinkPage } | { status: 'error'; reason: string };

export const load: PageLoad = async ({ parent, url }) => {
	const { experts, launches, selectedExpertId, selectedLaunchId } = await parent();
	const search = url.searchParams.get('q') ?? '';
	const channel = url.searchParams.get('channel') ?? '';
	const status = url.searchParams.get('status') ?? '';
	const params = {
		expertId: selectedExpertId ?? undefined,
		launchId: selectedLaunchId ?? undefined,
		search: search || undefined,
		channel: channel || undefined,
		status: status || undefined
	} as import('#lib/types.js').LinkListParams;
	const links: Promise<LinksState> = listLinks(params).then(
		(page): LinksState => ({ status: 'ready', page }),
		(error): LinksState => ({
			status: 'error',
			reason: error instanceof ApiError ? error.reason : 'UNEXPECTED_ERROR'
		})
	);
	return { experts, launches, selectedExpertId, selectedLaunchId, search, channel, status, links };
};
