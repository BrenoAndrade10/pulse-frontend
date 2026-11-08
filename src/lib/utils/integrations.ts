import type { IconName } from '#lib/components/ui/Icon.svelte';
import type { MessageKey } from '#lib/i18n/index.svelte.js';
import type { ConnectionStatus, IntegrationChannel } from '#lib/types.js';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

export const CONNECTION_STATUS: Record<
	ConnectionStatus,
	{ label: MessageKey; variant: BadgeVariant }
> = {
	connected: { label: 'integrations.status.connected', variant: 'success' },
	expired: { label: 'integrations.status.expired', variant: 'warning' },
	disconnected: { label: 'integrations.status.disconnected', variant: 'neutral' }
};

export type IntegrationState =
	'not_connected' | 'connected' | 'pending_setup' | 'attention' | 'coming_soon';

export const INTEGRATION_STATE: Record<
	IntegrationState,
	{ label: MessageKey; variant: BadgeVariant }
> = {
	not_connected: { label: 'integrations.states.notConnected', variant: 'neutral' },
	connected: { label: 'integrations.states.connected', variant: 'success' },
	pending_setup: { label: 'integrations.states.pendingSetup', variant: 'neutral' },
	attention: { label: 'integrations.states.attention', variant: 'warning' },
	coming_soon: { label: 'integrations.states.comingSoon', variant: 'neutral' }
};

export const connectionState = (status: ConnectionStatus): IntegrationState =>
	status === 'connected' ? 'connected' : status === 'expired' ? 'attention' : 'not_connected';

export type IntegrationScope = 'expert' | 'tenant';

export type UpcomingIntegration = {
	id: string;
	name: string;
	description: MessageKey;
	icon: IconName;
	scope: IntegrationScope;
};

export type MetaIntegration = {
	channel: IntegrationChannel;
	name: string;
	description: MessageKey;
	asset: MessageKey;
	authorization: MessageKey;
	connectLabel: MessageKey;
	icon: IconName;
	tone: string;
	available: boolean;
};

export const META_INTEGRATIONS: MetaIntegration[] = [
	{
		channel: 'instagram',
		name: 'Instagram',
		description: 'integrations.meta.instagram.description',
		asset: 'integrations.meta.instagram.asset',
		authorization: 'integrations.meta.instagram.authorization',
		connectLabel: 'integrations.meta.instagram.connect',
		icon: 'instagram',
		tone: 'bg-[rgb(225_48_108/0.14)] text-[#ff5c93]',
		available: true
	},
	{
		channel: 'meta-ads',
		name: 'Meta Ads',
		description: 'integrations.meta.metaAds.description',
		asset: 'integrations.meta.metaAds.asset',
		authorization: 'integrations.meta.metaAds.authorization',
		connectLabel: 'integrations.meta.metaAds.connect',
		icon: 'meta',
		tone: 'bg-[rgb(24_119_242/0.14)] text-[#4c9aff]',
		available: false
	},
	{
		channel: 'whatsapp',
		name: 'WhatsApp Business',
		description: 'integrations.meta.whatsapp.description',
		asset: 'integrations.meta.whatsapp.asset',
		authorization: 'integrations.meta.whatsapp.authorization',
		connectLabel: 'integrations.meta.whatsapp.connect',
		icon: 'whatsapp',
		tone: 'bg-[rgb(37_211_102/0.14)] text-[#3ddc84]',
		available: true
	}
];

export const UPCOMING_INTEGRATIONS: UpcomingIntegration[] = [
	...META_INTEGRATIONS.filter((integration) => !integration.available).map(
		(integration): UpcomingIntegration => ({
			id: integration.channel,
			name: integration.name,
			description: integration.description,
			icon: integration.icon,
			scope: 'expert'
		})
	),
	{
		id: 'telegram',
		name: 'Telegram',
		description: 'integrations.catalog.telegram',
		icon: 'send',
		scope: 'expert'
	},
	{
		id: 'hotmart',
		name: 'Hotmart',
		description: 'integrations.catalog.hotmart',
		icon: 'flame',
		scope: 'tenant'
	},
	{
		id: 'kiwify',
		name: 'Kiwify',
		description: 'integrations.catalog.kiwify',
		icon: 'shopping-bag',
		scope: 'tenant'
	}
];

export const metaIntegration = (channel: IntegrationChannel): MetaIntegration =>
	META_INTEGRATIONS.find((integration) => integration.channel === channel)!;
