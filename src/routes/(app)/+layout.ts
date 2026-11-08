import { error, redirect } from '@sveltejs/kit';
import { ApiError } from '#lib/api/http.js';
import { t } from '#lib/i18n/index.svelte.js';
import { auth, ensureSession } from '#lib/auth/session.svelte.js';
import {
	contextScope,
	getContextSelection,
	reconcileContextSelection,
	resolveContextSelection
} from '#lib/context/selection.js';
import { listExperts } from '#lib/services/experts.js';
import { listLaunches } from '#lib/services/launches.js';
import type { Expert, Launch } from '#lib/types.js';
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
			error(503, t('common.error.serverUnavailable'));
		}

		throw err;
	}

	if (!authenticated) {
		redirect(307, loginPathFor(untrack(() => `${url.pathname}${url.search}`)));
	}

	let experts: Expert[] = [];
	let expertsBackendUnavailable = false;

	try {
		experts = await listExperts();
	} catch (err) {
		if (err instanceof ApiError && (err.status === 0 || err.status === 404 || err.status >= 500)) {
			expertsBackendUnavailable = true;
		} else throw err;
	}
	const scope = contextScope(auth.user?.id ?? '', auth.activeTenant?.tenantId ?? '');
	const requested = getContextSelection(scope);
	const requestedExpert = experts.find((expert) => expert.id === requested.expertId) ?? null;
	let launches: Launch[] = [];
	let launchesBackendUnavailable = false;

	if (requestedExpert) {
		try {
			launches = await listLaunches(requestedExpert.id);
		} catch (err) {
			if (
				err instanceof ApiError &&
				(err.status === 0 || err.status === 404 || err.status >= 500)
			) {
				launchesBackendUnavailable = true;
			} else throw err;
		}
	}

	const selection = resolveContextSelection(requested, experts, launches);

	if (!expertsBackendUnavailable && !launchesBackendUnavailable) {
		reconcileContextSelection(selection);
	}

	return {
		experts,
		expertsBackendUnavailable,
		launches,
		launchesBackendUnavailable,
		selectedExpertId: selection.expertId,
		selectedLaunchId: selection.launchId
	};
};
