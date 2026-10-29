import type { PageLoad } from './$types';

export const ssr = false;

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{20,512}$/;

export const load: PageLoad = () => {
	const params = new URLSearchParams(window.location.hash.slice(1));
	const value = params.get('token') ?? '';
	window.history.replaceState(
		window.history.state,
		'',
		`${window.location.pathname}${window.location.search}`
	);
	return { token: TOKEN_PATTERN.test(value) ? value : null };
};
