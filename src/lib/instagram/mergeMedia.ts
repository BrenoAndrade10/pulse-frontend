import type { InstagramPost } from '#lib/types.js';

/** Acrescenta só as mídias que ainda não estão na lista. */
export function appendNewMedia(
	current: InstagramPost[],
	incoming: InstagramPost[]
): InstagramPost[] {
	const known = new Set(current.map((item) => item.id));
	return incoming.filter((item) => !known.has(item.id));
}

/**
 * Junta a primeira página atualizada sem tirar nada da tela: mídias novas
 * entram no topo, as existentes ganham curtidas e comentários atualizados, e
 * o que já tinha sido paginado continua lá.
 */
export function mergeFreshMedia(current: InstagramPost[], fresh: InstagramPost[]): InstagramPost[] {
	const updated = new Map(fresh.map((item) => [item.id, item]));

	return [
		...appendNewMedia(current, fresh),
		...current.map((item) => updated.get(item.id) ?? item)
	];
}
