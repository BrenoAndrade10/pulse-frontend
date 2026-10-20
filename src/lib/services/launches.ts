import { apiRequest } from '#lib/api/client.js';
import type { Launch, LaunchInput } from '#lib/types.js';

const basePath = '/launches';

export function listLaunches(expertId: string): Promise<Launch[]> {
	return apiRequest<Launch[]>(`${basePath}?expertId=${encodeURIComponent(expertId)}`);
}

export function createLaunch(expertId: string, input: LaunchInput): Promise<Launch> {
	return apiRequest<Launch>(basePath, {
		method: 'POST',
		body: { ...input, expertId }
	});
}

export function updateLaunch(
	expertId: string,
	launchId: string,
	input: LaunchInput
): Promise<Launch> {
	void expertId;
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
