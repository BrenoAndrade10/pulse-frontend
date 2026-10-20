import { mediaFeedFor } from '#lib/instagram/mediaFeedRegistry.js';
import { listCommentAutomations } from '#lib/services/commentAutomations.js';
import type { CommentAutomation } from '#lib/types.js';
import type { PageLoad } from './$types';

/**
 * Não espera a Meta: a busca das mídias já começa aqui, antes do componente
 * montar, e a tela abre direto no skeleton. As regras de DM vêm como promise;
 * `null` quando não carregaram.
 */
export const load: PageLoad = async ({ parent }) => {
	const { experts, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;
	const none = Promise.resolve<CommentAutomation[] | null>([]);

	if (!expert) return { expert: null, connectionError: null, automations: none };

	if (expert.instagram.status !== 'connected') {
		return {
			expert,
			connectionError:
				expert.instagram.status === 'expired'
					? 'INSTAGRAM_ACCESS_TOKEN_EXPIRED'
					: 'INSTAGRAM_NOT_CONNECTED',
			automations: none
		};
	}

	mediaFeedFor(expert.id).start();

	return {
		expert,
		connectionError: null,
		automations: listCommentAutomations(expert.id).catch((): CommentAutomation[] | null => null)
	};
};
