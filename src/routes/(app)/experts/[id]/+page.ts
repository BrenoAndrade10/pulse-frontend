import { error } from '@sveltejs/kit';
import { t } from '#lib/i18n/index.svelte.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { experts, expertsBackendUnavailable } = await parent();
	if (expertsBackendUnavailable) error(503, t('experts.errors.loadFailed'));

	const expert = experts.find((item) => item.id === params.id);
	if (!expert) error(404, t('experts.errors.notFound'));
	return { expert };
};
