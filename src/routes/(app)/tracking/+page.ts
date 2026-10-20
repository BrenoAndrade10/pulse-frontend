import { ApiError } from '#lib/api/http.js';
import { getTrackingPixel } from '#lib/services/tracking.js';
import type { TrackingPixel } from '#lib/types.js';
import type { PageLoad } from './$types';

export type PixelState =
	| { status: 'ready'; pixel: TrackingPixel | null }
	| { status: 'unavailable' }
	| { status: 'error' };

/** O pixel chega como promise: a tela abre na hora, com skeleton. */
export const load: PageLoad = async ({ parent }) => {
	const { experts, launches, selectedExpertId: expertId } = await parent();
	const expert = experts.find((item) => item.id === expertId) ?? null;

	const pixel: Promise<PixelState> = expert
		? getTrackingPixel(expert.id).then(
				(pixel): PixelState => ({ status: 'ready', pixel }),
				(error): PixelState =>
					// Rota ainda não publicada no backend.
					error instanceof ApiError && (error.status === 404 || error.status === 501)
						? { status: 'unavailable' }
						: { status: 'error' }
			)
		: Promise.resolve({ status: 'ready', pixel: null });

	return { expert, pixel, launches };
};
