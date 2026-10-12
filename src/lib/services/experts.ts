import type { Expert, ExpertInput } from '#lib/types.js';

// TODO: substituir pelo client da API. Enquanto não há backend, os experts ficam
// em memória no navegador e são perdidos ao recarregar a página.
const store = new Map<string, Expert>();

export class IntegrationUnavailableError extends Error {}

const clone = <T>(value: T): T => structuredClone(value);

export async function listExperts(): Promise<Expert[]> {
	return [...store.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(clone);
}

export async function getExpert(id: string): Promise<Expert | null> {
	const expert = store.get(id);
	return expert ? clone(expert) : null;
}

export async function createExpert(input: ExpertInput): Promise<Expert> {
	const expert: Expert = {
		...clone(input),
		id: crypto.randomUUID(),
		createdAt: new Date().toISOString(),
		facebook: { status: 'disconnected', accountName: null, connectedAt: null }
	};
	store.set(expert.id, expert);
	return clone(expert);
}

export async function updateExpert(id: string, input: ExpertInput): Promise<Expert> {
	const current = store.get(id);
	if (!current) throw new Error('Expert não encontrado.');
	const updated = { ...current, ...clone(input) };
	store.set(id, updated);
	return clone(updated);
}

export async function deleteExpert(id: string): Promise<void> {
	store.delete(id);
}

export async function connectFacebook(expertId: string): Promise<void> {
	// TODO: iniciar o fluxo OAuth da Meta pelo backend.
	void expertId;
	throw new IntegrationUnavailableError(
		'A conexão com o Facebook ainda não está disponível. Ela será liberada quando a integração com a API da Meta for configurada.'
	);
}

export async function disconnectFacebook(expertId: string): Promise<void> {
	const current = store.get(expertId);
	if (!current) return;
	current.facebook = { status: 'disconnected', accountName: null, connectedAt: null };
}
