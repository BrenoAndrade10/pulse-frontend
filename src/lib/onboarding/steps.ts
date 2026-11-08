import { t } from '#lib/i18n/index.svelte.js';
import type { Expert } from '#lib/types.js';

export type OnboardingSignals = { pixelInstalled: boolean; whatsappConnected: boolean };

export type OnboardingStepId = 'expert' | 'instagram' | 'pixel' | 'whatsapp';

export type OnboardingStep = {
	id: OnboardingStepId;
	title: string;
	description: string;
	href: string;
	cta: string;
	done: boolean;
};

export type OnboardingInput = {
	experts: Expert[];
	contextExpertId: string | null;
	signals: OnboardingSignals;
	whatsappAvailable: boolean;
};

export function onboardingScope(experts: Expert[], contextExpertId: string | null): Expert[] {
	if (!contextExpertId) return experts;
	const expert = experts.find((item) => item.id === contextExpertId);

	return expert ? [expert] : experts;
}

export function buildOnboardingSteps(input: OnboardingInput): OnboardingStep[] {
	const scope = onboardingScope(input.experts, input.contextExpertId);
	const single = scope.length === 1 && input.contextExpertId ? scope[0] : null;
	const steps: OnboardingStep[] = [];

	if (!single) {
		steps.push({
			id: 'expert',
			title: t('dashboard.onboarding.expert.title'),
			description: t('dashboard.onboarding.expert.description'),
			href: '/experts/new',
			cta: t('dashboard.onboarding.expert.cta'),
			done: input.experts.length > 0
		});
	}

	if (scope.length === 0) return steps;

	const subject = single ? single.name : t('dashboard.onboarding.subjectAll');
	const connected = scope.some((expert) => expert.instagram.status === 'connected');
	const expired = scope.some((expert) => expert.instagram.status === 'expired');

	steps.push({
		id: 'instagram',
		title: single
			? t('dashboard.onboarding.instagram.titleSingle', { name: single.name })
			: t('dashboard.onboarding.instagram.title'),
		description:
			expired && !connected
				? t('dashboard.onboarding.instagram.descriptionExpired')
				: t('dashboard.onboarding.instagram.description'),
		href: '/integrations#instagram',
		cta:
			expired && !connected
				? t('dashboard.onboarding.instagram.ctaReconnect')
				: t('dashboard.onboarding.instagram.cta'),
		done: connected
	});

	steps.push({
		id: 'pixel',
		title: t('dashboard.onboarding.pixel.title'),
		description: t('dashboard.onboarding.pixel.description', { subject }),
		href: '/tracking',
		cta: t('dashboard.onboarding.pixel.cta'),
		done: input.signals.pixelInstalled
	});

	if (input.whatsappAvailable) {
		steps.push({
			id: 'whatsapp',
			title: t('dashboard.onboarding.whatsapp.title'),
			description: t('dashboard.onboarding.whatsapp.description', { subject }),
			href: '/integrations#whatsapp',
			cta: t('dashboard.onboarding.whatsapp.cta'),
			done: input.signals.whatsappConnected
		});
	}

	return steps;
}
