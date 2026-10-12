import type { FacebookConnectionStatus } from '#lib/types.js';

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'danger';

export const FACEBOOK_STATUS: Record<
	FacebookConnectionStatus,
	{ label: string; variant: BadgeVariant }
> = {
	connected: { label: 'Conectada', variant: 'success' },
	expired: { label: 'Conexão expirada', variant: 'warning' },
	disconnected: { label: 'Não conectada', variant: 'neutral' }
};
