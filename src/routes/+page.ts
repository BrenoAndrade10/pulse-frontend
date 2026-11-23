import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		seo: {
			title: 'Pulse Lead — Gestão de lançamentos digitais',
			description: 'Acompanhe o funil do seu lançamento e descubra quais leads precisam de atenção.'
		}
	};
};
