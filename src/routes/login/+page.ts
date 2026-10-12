import { redirect } from '@sveltejs/kit';
import { ensureSession } from '#lib/auth/session.svelte.js';
import { safeRedirectPath } from '#lib/utils/redirect.js';
import type { PageLoad } from './$types';

// A sessão só existe no navegador (cookie httpOnly da API + memória).
export const ssr = false;

/** Quem já tem sessão válida não precisa ver o login. */
export const load: PageLoad = async ({ url }) => {
	const authenticated = await ensureSession().catch(() => false);

	if (authenticated) {
		redirect(307, safeRedirectPath(url.searchParams.get('redirectTo'), url.origin));
	}
};
