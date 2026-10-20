import type { ClientInit } from '@sveltejs/kit/hooks';
import {
	INSTAGRAM_OAUTH_CHANNEL,
	INSTAGRAM_OAUTH_MESSAGE,
	INSTAGRAM_OAUTH_POPUP_FLAG,
	type InstagramOAuthResult
} from '#lib/services/experts.js';

export const init: ClientInit = () => {
	const url = new URL(window.location.href);
	const status = url.searchParams.get('instagram');
	const isOAuthPopup =
		window.name === INSTAGRAM_OAUTH_CHANNEL ||
		sessionStorage.getItem(INSTAGRAM_OAUTH_POPUP_FLAG) === '1';

	if (!isOAuthPopup || (status !== 'connected' && status !== 'error')) return;

	const result: InstagramOAuthResult = {
		type: INSTAGRAM_OAUTH_MESSAGE,
		status,
		reason: url.searchParams.get('reason') ?? undefined
	};
	const channel = new BroadcastChannel(INSTAGRAM_OAUTH_CHANNEL);

	channel.postMessage(result);
	channel.close();
	sessionStorage.removeItem(INSTAGRAM_OAUTH_POPUP_FLAG);
	window.close();
};
