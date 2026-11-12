import type { LeadHeatBand } from '#lib/types.js';
import type { BadgeVariant } from '#lib/utils/integrations.js';

export const heatVariants: Record<LeadHeatBand, BadgeVariant> = {
	hot: 'danger',
	warm: 'warning',
	cold: 'neutral'
};
