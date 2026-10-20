import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
	const { experts, expertsBackendUnavailable } = await parent();
	if (expertsBackendUnavailable) error(503, 'Não foi possível carregar os experts.');

	const expert = experts.find((item) => item.id === params.id);
	if (!expert) error(404, 'Expert não encontrado.');
	return { expert };
};
