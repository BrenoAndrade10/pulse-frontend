import { apiRequest } from '#lib/api/client.js';
import type { Launch, LaunchInput } from '#lib/types.js';

const basePath = '/launches';

export function listLaunches(expertId: string): Promise<Launch[]> {
	return apiRequest<Launch[]>(`${basePath}?expertId=${encodeURIComponent(expertId)}`);
}

export function createLaunch(input: LaunchInput): Promise<Launch> {
	return apiRequest<Launch>(basePath, {
		method: 'POST',
		body: input
	});
}

export function updateLaunch(
	launchId: string,
	input: Omit<LaunchInput, 'expertId'> & { expertId?: string }
): Promise<Launch> {
	return apiRequest<Launch>(`${basePath}/${encodeURIComponent(launchId)}`, {
		method: 'PATCH',
		body: input
	});
}

export function getLaunch(launchId: string): Promise<Launch> {
	return apiRequest<Launch>(`${basePath}/${encodeURIComponent(launchId)}`);
}

export async function deleteLaunch(launchId: string): Promise<void> {
	await apiRequest<void>(`${basePath}/${encodeURIComponent(launchId)}`, { method: 'DELETE' });
}
