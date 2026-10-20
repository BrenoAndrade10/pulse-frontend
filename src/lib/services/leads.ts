import { PUBLIC_API_URL } from '$app/env/public';
import { apiRequest } from '#lib/api/client.js';
import type { LeadsPage } from '#lib/types.js';

const basePath = (expertId: string) => `/experts/${encodeURIComponent(expertId)}/leads`;

export type LeadsFilter = { launchId?: string; search?: string };

export function listLeads(
	expertId: string,
	filter: LeadsFilter = {},
	cursor?: string
): Promise<LeadsPage> {
	const params = new URLSearchParams({ limit: '50' });
	if (filter.launchId) params.set('launchId', filter.launchId);
	if (filter.search) params.set('search', filter.search);
	if (cursor) params.set('cursor', cursor);

	return apiRequest<LeadsPage>(`${basePath(expertId)}?${params}`);
}

/**
 * Baixa o CSV do filtro. A API devolve um link assinado de 5 minutos: o
 * navegador baixa direto, em streaming, sem guardar o arquivo na memória da página.
 */
export async function exportLeads(expertId: string, launchId?: string): Promise<void> {
	const { url } = await apiRequest<{ url: string }>(`${basePath(expertId)}/exports`, {
		method: 'POST',
		body: launchId ? { launchId } : {}
	});

	const link = document.createElement('a');
	link.href = `${PUBLIC_API_URL}${url}`;
	link.rel = 'noopener';
	document.body.append(link);
	link.click();
	link.remove();
}

export async function deleteLead(expertId: string, leadId: string): Promise<void> {
	await apiRequest<void>(`${basePath(expertId)}/${encodeURIComponent(leadId)}`, {
		method: 'DELETE'
	});
}
