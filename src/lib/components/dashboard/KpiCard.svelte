<script lang="ts">
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { formatDelta } from '#lib/utils/format.js';

	type Props = {
		label: string;
		value: string;
		icon: IconName;
		delta: number | null;
		invertDelta?: boolean;
	};

	let { label, value, icon, delta, invertDelta = false }: Props = $props();

	const trend = $derived.by(() => {
		if (delta == null || delta === 0) return 'neutral';
		const improved = invertDelta ? delta < 0 : delta > 0;
		return improved ? 'up' : 'down';
	});
</script>

<article class="min-w-0 rounded-lg border border-border bg-bg-elevated px-5 py-4.5">
	<div class="flex items-center justify-between">
		<span class="text-[13px] font-semibold text-fg-muted">{label}</span>
		<span
			class="grid size-7.5 place-items-center rounded-[9px] bg-[rgb(124_92_255/0.1)] text-primary-hover"
		>
			<Icon name={icon} size={16} />
		</span>
	</div>
	<p class="mt-2.5 mb-1 truncate text-[26px] font-extrabold tracking-[-0.03em] tabular-nums">
		{value}
	</p>
	{#if delta == null}
		<p class="text-[12.5px] font-semibold text-fg-subtle">Sem dados no período</p>
	{:else}
		<p
			class={[
				'text-[12.5px] font-semibold',
				trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-fg-subtle'
			]}
		>
			{delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}
			{formatDelta(delta)} <span class="font-medium text-fg-subtle">vs. período anterior</span>
		</p>
	{/if}
</article>
