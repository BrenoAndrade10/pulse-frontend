import { isWhatsAppEmbeddedSignupConfigured } from '#lib/meta/embeddedSignup.js';
import { getTrackingPixel } from '#lib/services/tracking.js';
import { getWhatsAppConnection } from '#lib/services/whatsappConnection.js';
import type { Expert } from '#lib/types.js';
import type { OnboardingSignals } from './steps.js';

export const whatsappOnboardingAvailable = isWhatsAppEmbeddedSignupConfigured;

export async function loadOnboardingSignals(experts: Expert[]): Promise<OnboardingSignals> {
	const [pixels, connections] = await Promise.all([
		Promise.allSettled(experts.map((expert) => getTrackingPixel(expert.id))),
		whatsappOnboardingAvailable
			? Promise.allSettled(experts.map((expert) => getWhatsAppConnection(expert.id)))
			: Promise.resolve([])
	]);

	return {
		pixelInstalled: pixels.some(
			(result) => result.status === 'fulfilled' && result.value?.installation.status === 'installed'
		),
		whatsappConnected: connections.some(
			(result) => result.status === 'fulfilled' && result.value.status === 'connected'
		)
	};
}
