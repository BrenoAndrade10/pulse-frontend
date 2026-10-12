<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon, { type IconName } from './Icon.svelte';

	type Props = {
		icon: IconName;
		title: string;
		description?: string;
		compact?: boolean;
		action?: Snippet;
	};

	let { icon, title, description, compact = false, action }: Props = $props();
</script>

<div
	class={[
		'flex flex-col items-center justify-center text-center',
		compact ? 'px-4 py-8' : 'px-6 py-14'
	]}
>
	<div
		class={[
			'grid place-items-center border border-primary/25 bg-primary/10 text-primary-hover',
			compact ? 'mb-3 size-10.5 rounded-md' : 'mb-4 size-13 rounded-[14px]'
		]}
	>
		<Icon name={icon} size={compact ? 20 : 24} />
	</div>
	<p class="text-[15px] font-bold">{title}</p>
	{#if description}
		<p class="mt-1.5 max-w-[380px] text-[13.5px] text-fg-muted">{description}</p>
	{/if}
	{#if action}
		<div class="mt-5">{@render action()}</div>
	{/if}
</div>
