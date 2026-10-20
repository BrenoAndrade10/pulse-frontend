import { auth } from '#lib/auth/session.svelte.js';
import { InstagramMediaFeed } from './mediaFeed.svelte.js';

const feeds = new Map<string, InstagramMediaFeed>();
let feedsOwner: string | null = null;

export function mediaFeedFor(expertId: string): InstagramMediaFeed {
	const owner = `${auth.user?.id ?? ''}:${auth.activeTenant?.tenantId ?? ''}`;
	if (owner !== feedsOwner) {
		feeds.clear();
		feedsOwner = owner;
	}

	let feed = feeds.get(expertId);
	if (!feed) {
		feed = new InstagramMediaFeed(expertId);
		feeds.set(expertId, feed);
	}
	return feed;
}
