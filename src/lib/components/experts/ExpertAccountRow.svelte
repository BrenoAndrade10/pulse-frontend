<script lang="ts">
	import Badge from '#lib/components/ui/Badge.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import { initials } from '#lib/utils/format.js';
	import type { BadgeVariant } from '#lib/utils/integrations.js';

	type Props = {
		name: string;
		subtitle: string;
		badge: { label: string; variant: BadgeVariant };
		actionLabel: string;
		href: string;
	};

	let { name, subtitle, badge, actionLabel, href }: Props = $props();
</script>

<li
	class="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-border px-5.5 py-4 first:border-t-0 max-[701px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[701px]:p-4"
>
	<span
		class="grid size-9.5 place-items-center rounded-full border border-border-strong bg-surface text-[12.5px] font-extrabold"
		aria-hidden="true">{initials(name)}</span
	>
	<div class="flex min-w-0 flex-col">
		<span class="font-bold">{name}</span>
		<span class="truncate text-[13px] text-fg-muted">{subtitle}</span>
	</div>
	<Badge variant={badge.variant}>{badge.label}</Badge>
	<a
		class={[buttonClass({ variant: 'secondary', size: 'sm' }), 'max-[701px]:col-span-full']}
		{href}
	>
		{actionLabel}
	</a>
</li>
