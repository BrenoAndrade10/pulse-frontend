import { redirect } from '@sveltejs/kit';
import { ensureSession } from '#lib/auth/session.svelte.js';
import { DEFAULT_AUTHENTICATED_ROUTE } from '#lib/utils/redirect.js';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async () => {
	const authenticated = await ensureSession().catch(() => false);
	if (authenticated) redirect(307, DEFAULT_AUTHENTICATED_ROUTE);
};
