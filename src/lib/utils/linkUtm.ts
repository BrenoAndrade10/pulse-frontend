import type { LinkChannel } from '#lib/types.js';

export const linkPlacements: Record<LinkChannel, readonly string[]> = {
	instagram: ['bio', 'stories', 'direct', 'reels', 'feed'],
	whatsapp: ['group', 'private', 'status', 'broadcast'],
	telegram: ['channel', 'group', 'private'],
	email: ['newsletter', 'automation', 'signature'],
	ads: ['feed', 'stories', 'reels', 'search', 'display'],
	other: []
};

const defaults: Record<LinkChannel, { source: string; medium: string }> = {
	instagram: { source: 'instagram', medium: 'social' },
	whatsapp: { source: 'whatsapp', medium: 'message' },
	telegram: { source: 'telegram', medium: 'message' },
	email: { source: 'email', medium: 'email' },
	ads: { source: 'ads', medium: 'paid' },
	other: { source: 'other', medium: 'link' }
};

export function slug(value: string | null | undefined): string | null {
	if (!value) return null;
	const result = value
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9_-]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 120)
		.replace(/-+$/g, '');
	return result || null;
}

export function previewUtm(input: {
	channel: LinkChannel;
	placement?: string | null;
	campaign?: string | null;
	linkName?: string | null;
	launchName?: string | null;
	overrides?: Partial<Record<'source' | 'medium' | 'campaign' | 'content' | 'term', string | null>>;
}) {
	const fallback = defaults[input.channel];
	const overrides = input.overrides ?? {};
	const placement = slug(input.placement);
	const medium =
		placement && linkPlacements[input.channel].includes(placement)
			? placement
			: (placement ?? fallback.medium);
	const override = (value: string | null | undefined, fallbackValue: string | null) =>
		slug(value) ?? fallbackValue;
	return {
		source: override(overrides.source, fallback.source),
		medium: override(overrides.medium, medium),
		campaign: override(overrides.campaign, slug(input.campaign) ?? slug(input.launchName)),
		content: override(overrides.content, slug(input.linkName)),
		term: slug(overrides.term)
	};
}
