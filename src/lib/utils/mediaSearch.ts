import type { CommentAutomation, InstagramPost } from '#lib/types.js';
import { mediaKind, type MediaKind } from './instagramMedia.js';

export type DmFilter = 'all' | 'active' | 'paused' | 'none';
export type KindFilter = 'all' | MediaKind;
export type MediaSort = 'recent' | 'comments' | 'likes';

export const KIND_FILTER_OPTIONS: { value: KindFilter; label: string }[] = [
	{ value: 'all', label: 'Todos os tipos' },
	{ value: 'reel', label: 'Reels' },
	{ value: 'photo', label: 'Fotos' },
	{ value: 'carousel', label: 'Carrosséis' },
	{ value: 'video', label: 'Vídeos' }
];

export const DM_FILTER_OPTIONS: { value: DmFilter; label: string }[] = [
	{ value: 'all', label: 'Com ou sem DM' },
	{ value: 'active', label: 'Com DM ativa' },
	{ value: 'paused', label: 'Com DM pausada' },
	{ value: 'none', label: 'Sem DM automática' }
];

export const MEDIA_SORT_OPTIONS: { value: MediaSort; label: string }[] = [
	{ value: 'recent', label: 'Mais recentes' },
	{ value: 'comments', label: 'Mais comentados' },
	{ value: 'likes', label: 'Mais curtidos' }
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
