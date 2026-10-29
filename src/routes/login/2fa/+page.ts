import { redirect } from '@sveltejs/kit';
import { getTwoFactorChallenge } from '#lib/auth/twoFactorChallenge.js';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = () => {
	if (!getTwoFactorChallenge()) redirect(307, '/login');
};
