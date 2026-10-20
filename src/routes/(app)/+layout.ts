import { error, redirect } from '@sveltejs/kit';
import { ApiError } from '#lib/api/http.js';
import { ensureSession } from '#lib/auth/session.svelte.js';
import { getContextSelection, reconcileContextSelection } from '#lib/context/selection.js';
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
			error(503, 'Não foi possível conectar ao servidor.');
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
	const selection = getContextSelection();
	const requestedExpertId = selection.expertId;
	const selectedExpert =
		experts.find((expert) => expert.id === requestedExpertId) ?? experts[0] ?? null;
	let launches: Launch[] = [];
	let launchesBackendUnavailable = false;

	if (selectedExpert) {
		try {
			launches = await listLaunches(selectedExpert.id);
		} catch (err) {
			// Launches is an optional module for the rest of the app. A backend that
			// has not received its launches migration yet can answer 5xx here; do not
			// let that shared request take every authenticated route down with it.
			if (
				err instanceof ApiError &&
				(err.status === 0 || err.status === 404 || err.status >= 500)
			) {
				launchesBackendUnavailable = true;
			} else throw err;
		}
	}

	const requestedLaunchId = selection.launchId;
	const selectedLaunch =
		launches.find((launch) => launch.id === requestedLaunchId) ?? launches[0] ?? null;

	reconcileContextSelection(selectedExpert?.id ?? null, selectedLaunch?.id ?? null);

	return {
		experts,
		expertsBackendUnavailable,
		launches,
		launchesBackendUnavailable,
		selectedExpertId: selectedExpert?.id ?? null,
		selectedLaunchId: selectedLaunch?.id ?? null
	};
};
