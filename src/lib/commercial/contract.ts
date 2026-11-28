export const EXPERIMENT_VERSION = 'commercial-validation-v1';
export const PAGE_VERSION = '2026-11-commercial-lp-1';

export const EVENT_NAMES = [
	'PageView',
	'EngagedSession',
	'HeroCTAClick',
	'SectionView',
	'ScrollMilestone',
	'FeatureView',
	'FeatureExplore',
	'OperationTypeSelected',
	'DemoPlay',
	'DemoProgress',
	'DemoCompleted',
	'DemoReplay',
	'AutomationDemoInteraction',
	'PricingClick',
	'ViewPricing',
	'PlanInterest',
	'SignupOpen',
	'SignupStart',
	'SignupClose',
	'Lead',
	'DemoInterest'
] as const;
export type EventName = (typeof EVENT_NAMES)[number];

export const FEATURE_IDS = [
	'tracking',
	'lead_journey',
	'pulse_heat',
	'automations',
	'scheduled_messages',
	'event_automations',
	'behavioral_automations',
	'whatsapp',
	'email',
	'instagram',
	'integrations',
	'ai'
] as const;
export type FeatureId = (typeof FEATURE_IDS)[number];

export const OPERATION_TYPES = ['paid_launch', 'traditional_launch', 'evergreen'] as const;
export type OperationType = (typeof OPERATION_TYPES)[number];

export const SECTION_IDS = [
	'hero',
	'problem',
	'tracking',
	'pulse_heat',
	'automations',
	'communication',
	'strategies',
	'integrations_ai',
	'pricing',
	'footer'
] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const DEMO_TYPES = [
	'strategy_simulation',
	'automation_builder',
	'heat_evolution',
	'message_personalization',
	'problem_comparison',
	'dispatch_agenda',
	'instagram_automation',
	'email_sequence',
	'multichannel_automation',
	'multichannel_journey'
] as const;
export type DemoType = (typeof DEMO_TYPES)[number];

export const SCENARIO_IDS = [
	'checkout_recovery',
	'personalized_messaging',
	'private_whatsapp',
	'scheduled_messages',
	'behavioral_automations',
	'pulse_heat',
	'lead_journey',
	'problem_comparison',
	'strategy_paid_launch',
	'strategy_traditional_launch',
	'strategy_evergreen',
	'intermediate_cta',
	'instagram_automation',
	'instagram_keyword',
	'email_campaigns',
	'email_sequences',
	'email_personalization',
	'whatsapp_personalization',
	'multichannel_automation',
	'multichannel_journey'
] as const;
export type ScenarioId = (typeof SCENARIO_IDS)[number];

export type EventProps = {
	featureId?: FeatureId;
	sectionId?: SectionId;
	operationType?: OperationType;
	planId?: string;
	displayedPrice?: number;
	currency?: string;
	ctaSource?: string;
	demoType?: DemoType;
	scenario?: ScenarioId;
	step?: number;
	maxStep?: number;
	totalSteps?: number;
	durationMs?: number;
	detail?: string;
	value?: number | string | boolean;
};

export type SignupOpenOptions = {
	source: string;
	planId?: string;
	displayedPrice?: number;
	currency?: string;
};
