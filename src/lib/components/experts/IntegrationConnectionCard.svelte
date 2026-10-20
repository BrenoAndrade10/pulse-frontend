<script lang="ts">
	import type { Snippet } from 'svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { BadgeVariant, MetaIntegration } from '#lib/utils/integrations.js';

	type Props = {
		integration: MetaIntegration;
		badge: { label: string; variant: BadgeVariant };
		/** Conta autorizada; sem ela, mostra o ativo que será vinculado. */
		accountName?: string | null;
		detail: string;
		actions: Snippet;
		children?: Snippet;
	};

	let { integration, badge, accountName = null, detail, actions, children }: Props = $props();
</script>

<article
	id={integration.channel}
	class={[
		'flex scroll-mt-6 flex-col gap-4 rounded-md border border-border bg-surface p-4.5',
		!integration.available && 'opacity-75'
	]}
	aria-labelledby="{integration.channel}-title"
>
	<div class="flex items-start gap-3.5 max-[561px]:flex-wrap">
		<span
			class={['grid size-10.5 shrink-0 place-items-center rounded-[12px]', integration.tone]}
			aria-hidden="true"><Icon name={integration.icon} size={20} /></span
		>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-x-2 gap-y-1">
				<h3 id="{integration.channel}-title" class="font-bold">{integration.name}</h3>
				<span class="text-[12px] text-fg-subtle">{integration.authorization}</span>
			</div>
			<p class="mt-0.5 truncate text-[13.5px]">{accountName ?? integration.asset}</p>
			<p class="mt-0.5 text-[13px] text-fg-muted">{detail}</p>
		</div>
		<Badge variant={badge.variant}>{badge.label}</Badge>
	</div>

	<div class="flex flex-wrap gap-2">
		{@render actions()}
	</div>

	{@render children?.()}
</article>
