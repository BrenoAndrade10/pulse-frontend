import { browser } from '$app/env';

export type ContextSelection = { expertId: string | null; launchId: string | null };

const STORAGE_PREFIX = 'pulse:context:';

let activeScope: string | null = null;
let current: ContextSelection = { expertId: null, launchId: null };

function readStored(scope: string): ContextSelection {
	if (!browser) return { expertId: null, launchId: null };

	try {
		const raw = localStorage.getItem(`${STORAGE_PREFIX}${scope}`);
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		if (typeof parsed !== 'object' || parsed === null) return { expertId: null, launchId: null };
		const { expertId, launchId } = parsed as Record<string, unknown>;
		const expert = typeof expertId === 'string' && expertId ? expertId : null;

		return {
			expertId: expert,
			launchId: expert && typeof launchId === 'string' && launchId ? launchId : null
		};
	} catch {
		return { expertId: null, launchId: null };
	}
}

function persist(): void {
	if (!browser || !activeScope) return;

	try {
		localStorage.setItem(`${STORAGE_PREFIX}${activeScope}`, JSON.stringify(current));
	} catch {
		return;
	}
}

/** O contexto pertence a um usuário numa empresa; trocar de conta não herda a seleção anterior. */
export function contextScope(userId: string, tenantId: string): string {
	return `${tenantId}:${userId}`;
}

export function getContextSelection(scope: string): ContextSelection {
	if (scope !== activeScope) {
		activeScope = scope;
		current = readStored(scope);
	}

	return { ...current };
}

export function selectExpert(id: string | null): void {
	if (id === current.expertId) return;
	current = { expertId: id, launchId: null };
	persist();
}

export function selectLaunch(id: string | null): void {
	current = { expertId: current.expertId, launchId: current.expertId ? id : null };
	persist();
}

/**
 * Aplica ao contexto só IDs que existem na lista autorizada da empresa: o expert
 * precisa estar entre os experts e o lançamento, entre os do expert escolhido.
 */
export function resolveContextSelection(
	requested: ContextSelection,
	experts: { id: string }[],
	launches: { id: string }[]
): ContextSelection {
	const expertId = experts.some((expert) => expert.id === requested.expertId)
		? requested.expertId
		: null;
	const launchId =
		expertId && launches.some((launch) => launch.id === requested.launchId)
			? requested.launchId
			: null;

	return { expertId, launchId };
}

export function reconcileContextSelection(next: ContextSelection): void {
	current = { ...next };
	persist();
}
