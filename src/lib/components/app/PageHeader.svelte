<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '#lib/components/ui/Icon.svelte';

	type Props = {
		title: string;
		description?: string;
		back?: { href: string; label: string };
		actions?: Snippet;
	};

	let { title, description, back, actions }: Props = $props();
</script>

<header class="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
	<div>
		{#if back}
			<a
				class="mb-2.5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg-muted hover:text-fg hover:no-underline"
				href={back.href}><Icon name="arrow-left" size={16} />{back.label}</a
			>
		{/if}
		<h1 class="text-[26px] font-extrabold tracking-[-0.03em]">{title}</h1>
		{#if description}<p class="mt-1.5 text-fg-muted">{description}</p>{/if}
	</div>
	{#if actions}<div class="flex flex-wrap items-center gap-2.5">{@render actions()}</div>{/if}
</header>
