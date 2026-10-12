import { error, redirect } from '@sveltejs/kit';
import { ApiError } from '#lib/api/http.js';
import { ensureSession } from '#lib/auth/session.svelte.js';
import { loginPathFor } from '#lib/utils/redirect.js';
import type { LayoutLoad } from './$types';

// Área logada renderizada apenas no cliente (painel/SPA).
export const ssr = false;

/**
 * Porta de entrada da área logada: sem sessão válida, vai para o login e volta
 * para cá depois. A sessão perdida durante o uso é tratada no +layout.svelte.
 */
export const load: LayoutLoad = async ({ url, untrack }) => {
	let authenticated: boolean;

	try {
		authenticated = await ensureSession();
	} catch (err) {
		if (err instanceof ApiError && err.status === 0) {
			error(503, 'Não foi possível conectar ao servidor.');
		}

		throw err;
	}

	if (!authenticated) {
		redirect(307, loginPathFor(untrack(() => `${url.pathname}${url.search}`)));
	}
};
