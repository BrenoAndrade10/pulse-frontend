import type { IconName } from '#lib/components/ui/Icon.svelte';
import type { ConnectionStatus, IntegrationChannel } from '#lib/types.js';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

export const CONNECTION_STATUS: Record<ConnectionStatus, { label: string; variant: BadgeVariant }> =
	{
		connected: { label: 'Conectada', variant: 'success' },
		expired: { label: 'Conexão expirada', variant: 'warning' },
		disconnected: { label: 'Não conectada', variant: 'neutral' }
	};

export type MetaIntegration = {
	channel: IntegrationChannel;
	/** Nome do produto como a Meta apresenta. */
	name: string;
	description: string;
	/** Ativo da Meta que fica vinculado ao expert. */
	asset: string;
	/** Fluxo oficial de autorização usado na conexão. */
	authorization: string;
	connectLabel: string;
	icon: IconName;
	/** Classes do selo do ícone, nas cores de cada marca. */
	tone: string;
	available: boolean;
};

// Nomes seguem a documentação da Meta: Business Login for Instagram,
// Facebook Login for Business e WhatsApp Embedded Signup.
export const META_INTEGRATIONS: MetaIntegration[] = [
	{
		channel: 'instagram',
		name: 'Instagram',
		description: 'Publicações, Reels e comentários da conta profissional.',
		asset: 'Conta profissional do Instagram',
		authorization: 'Login empresarial do Instagram',
		connectLabel: 'Conectar com Instagram',
		icon: 'instagram',
		tone: 'bg-[rgb(225_48_108/0.14)] text-[#ff5c93]',
		available: true
	},
	{
		channel: 'meta-ads',
		name: 'Meta Ads',
		description: 'Campanhas, investimento e resultados do Gerenciador de Anúncios.',
		asset: 'Conta de anúncios e Pixel da Meta',
		authorization: 'Login do Facebook para Empresas',
		connectLabel: 'Conectar com Facebook',
		icon: 'meta',
		tone: 'bg-[rgb(24_119_242/0.14)] text-[#4c9aff]',
		available: false
	},
	{
		channel: 'whatsapp',
		name: 'WhatsApp Business',
		description: 'Conversas e atendimentos pela API de Nuvem do WhatsApp.',
		asset: 'Conta do WhatsApp Business (WABA) e número de telefone',
		authorization: 'Cadastro incorporado com o Facebook',
		connectLabel: 'Conectar com Facebook',
		icon: 'whatsapp',
		tone: 'bg-[rgb(37_211_102/0.14)] text-[#3ddc84]',
		available: true
	}
];

export const metaIntegration = (channel: IntegrationChannel): MetaIntegration =>
	META_INTEGRATIONS.find((integration) => integration.channel === channel)!;
