import type { MessageKey } from '#lib/i18n/index.svelte.js';
import type { CommentAutomation, InstagramPost } from '#lib/types.js';
import { mediaKind, type MediaKind } from './instagramMedia.js';

export type DmFilter = 'all' | 'active' | 'paused' | 'none';
export type KindFilter = 'all' | MediaKind;
export type MediaSort = 'recent' | 'comments' | 'likes';

export const KIND_FILTER_OPTIONS: { value: KindFilter; labelKey: MessageKey }[] = [
	{ value: 'all', labelKey: 'reels.filters.kind.all' },
	{ value: 'reel', labelKey: 'reels.filters.kind.reel' },
	{ value: 'photo', labelKey: 'reels.filters.kind.photo' },
	{ value: 'carousel', labelKey: 'reels.filters.kind.carousel' },
	{ value: 'video', labelKey: 'reels.filters.kind.video' }
];

export const DM_FILTER_OPTIONS: { value: DmFilter; labelKey: MessageKey }[] = [
	{ value: 'all', labelKey: 'reels.filters.dm.all' },
	{ value: 'active', labelKey: 'reels.filters.dm.active' },
	{ value: 'paused', labelKey: 'reels.filters.dm.paused' },
	{ value: 'none', labelKey: 'reels.filters.dm.none' }
];

export const MEDIA_SORT_OPTIONS: { value: MediaSort; labelKey: MessageKey }[] = [
	{ value: 'recent', labelKey: 'reels.filters.sort.recent' },
	{ value: 'comments', labelKey: 'reels.filters.sort.comments' },
	{ value: 'likes', labelKey: 'reels.filters.sort.likes' }
];

const normalize = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

const shortcodeOf = (value: string) => /\/(?:reels?|p|tv)\/([\w-]+)/i.exec(value)?.[1] ?? null;

export function matchesQuery(post: InstagramPost, query: string): boolean {
	const trimmed = query.trim();
	if (!trimmed) return true;

	const shortcode = shortcodeOf(trimmed);
	if (shortcode) return Boolean(post.permalink && shortcodeOf(post.permalink) === shortcode);

	const caption = normalize(post.caption ?? '');
	return normalize(trimmed)
		.split(/\s+/)
		.every((word) => caption.includes(word));
}

export function matchesKind(post: InstagramPost, filter: KindFilter): boolean {
	return filter === 'all' || mediaKind(post) === filter;
}

export function matchesDmFilter(automation: CommentAutomation | undefined, filter: DmFilter) {
	switch (filter) {
		case 'active':
			return automation?.isActive === true;
		case 'paused':
			return automation?.isActive === false;
		case 'none':
			return !automation;
		default:
			return true;
	}
}

const time = (post: InstagramPost) => (post.timestamp ? Date.parse(post.timestamp) : 0);

export function sortMedia(posts: InstagramPost[], sort: MediaSort): InstagramPost[] {
	const by: Record<MediaSort, (a: InstagramPost, b: InstagramPost) => number> = {
		recent: (a, b) => time(b) - time(a),
		comments: (a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0) || time(b) - time(a),
		likes: (a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0) || time(b) - time(a)
	};

	return [...posts].sort(by[sort]);
}
