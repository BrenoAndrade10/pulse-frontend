import { error } from '@sveltejs/kit';
import { getExpert } from '#lib/services/experts.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	const expert = await getExpert(params.id);
	if (!expert) error(404, 'Expert não encontrado.');
	return { expert };
};
