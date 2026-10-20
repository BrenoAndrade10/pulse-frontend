import { apiRequest } from '#lib/api/client.js';
import type { InstagramPostsPage } from '#lib/types.js';

/** Fotos, carrosséis, vídeos e Reels do Instagram do expert, uma página por vez. */
export function listInstagramMedia(
	expertId: string,
	options: { after?: string; limit?: number } = {}
): Promise<InstagramPostsPage> {
	const params = new URLSearchParams({ limit: String(options.limit ?? 24) });
	if (options.after) params.set('after', options.after);

	return apiRequest<InstagramPostsPage>(
		`/experts/${encodeURIComponent(expertId)}/instagram/posts?${params}`
	);
}
