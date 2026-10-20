import { PUBLIC_API_URL } from '$app/env/public';
import type { IconName } from '#lib/components/ui/Icon.svelte';
import type { InstagramMediaChild, InstagramPost } from '#lib/types.js';

export type MediaKind = 'reel' | 'photo' | 'carousel' | 'video';

export const MEDIA_KIND: Record<MediaKind, { label: string; icon: IconName }> = {
	reel: { label: 'Reel', icon: 'video' },
	photo: { label: 'Foto', icon: 'image' },
	carousel: { label: 'Carrossel', icon: 'layers' },
	video: { label: 'Vídeo', icon: 'video' }
};

/** Tipo como o Instagram mostra: Reel vem de `media_product_type`, o resto de `media_type`. */
export function mediaKind(post: InstagramPost): MediaKind {
	if (post.mediaProductType === 'REELS') return 'reel';
	if (post.mediaType === 'CAROUSEL_ALBUM') return 'carousel';
	if (post.mediaType === 'VIDEO') return 'video';
	return 'photo';
}

/** A API entrega a mídia pelo próprio proxy (`/meta/media?...`), relativo a ela. */
function resolve(url: string | undefined): string | null {
	if (!url) return null;
	return url.startsWith('/') ? `${PUBLIC_API_URL}${url}` : url;
}

/**
 * Imagem de capa. Vídeos e Reels usam a miniatura: o `media_url` deles é o
 * próprio vídeo, que não abre como imagem.
 */
export function coverUrl(post: InstagramPost): string | null {
	const kind = mediaKind(post);
	if (kind === 'reel' || kind === 'video') return resolve(post.thumbnailUrl);
	return resolve(post.thumbnailUrl ?? post.mediaUrl);
}

export type MediaSlide =
	| { id: string; type: 'image'; src: string }
	| { id: string; type: 'video'; src: string; poster: string | null };

const toSlide = (item: InstagramMediaChild | InstagramPost): MediaSlide | null => {
	const src = resolve(item.mediaUrl);
	if (!src) return null;
	return item.mediaType === 'VIDEO'
		? { id: item.id, type: 'video', src, poster: resolve(item.thumbnailUrl) }
		: { id: item.id, type: 'image', src };
};

/** O que a publicação mostra: a foto, o vídeo ou cada item do carrossel. */
export function slidesOf(post: InstagramPost): MediaSlide[] {
	const items = mediaKind(post) === 'carousel' && post.children?.length ? post.children : [post];
	return items.map(toSlide).filter((slide): slide is MediaSlide => slide !== null);
}
