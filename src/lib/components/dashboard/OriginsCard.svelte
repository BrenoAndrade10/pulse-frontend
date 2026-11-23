<script lang="ts">
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import type { CaptureOverview } from '#lib/types.js';
	import { formatNumber } from '#lib/utils/format.js';

	type Props = {
		phase: 'select' | 'loading' | 'ready' | 'error';
		overview: CaptureOverview | null;
	};

	let { phase, overview }: Props = $props();

	const max = $derived(Math.max(1, ...(overview?.origins.map((origin) => origin.count) ?? [])));

	function label(origin: { source: string; campaign: string }): string {
		const source = origin.source
			? origin.source.charAt(0).toUpperCase() + origin.source.slice(1)
			: '';
		return (
			[source, origin.campaign].filter(Boolean).join(' · ') ||
			t('dashboard.overview.origins.unknown')
		);
	}
</script>

<Card title={t('dashboard.overview.origins.title')}>
	{#if phase === 'select'}
		<EmptyState compact icon="link" title={t('dashboard.overview.selectExpert')} />
	{:else if phase === 'error'}
		<EmptyState compact icon="link" title={t('dashboard.overview.error')} />
	{:else if phase === 'loading' || !overview}
		<ul class="grid gap-3" aria-hidden="true">
			{#each { length: 4 }, index (index)}
				<li class="h-6 rounded bg-surface motion-safe:animate-pulse"></li>
			{/each}
		</ul>
	{:else if overview.origins.length === 0}
		<EmptyState compact icon="link" title={t('dashboard.overview.origins.empty')} />
	{:else}
		<ul class="grid gap-3.5">
			{#each overview.origins as origin (origin.source + origin.campaign)}
				<li
					class="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3rem] items-center gap-4 text-[14px]"
				>
					<span class="truncate text-fg-muted" title={label(origin)}>{label(origin)}</span>
					<span class="h-2.5 overflow-hidden rounded-full bg-surface" aria-hidden="true">
						<span
							class="block h-full rounded-full bg-gradient-brand motion-safe:animate-fade-in"
							style:width="{(origin.count / max) * 100}%"
						></span>
					</span>
					<strong class="text-right tabular-nums">{formatNumber(origin.count)}</strong>
				</li>
			{/each}
		</ul>
		<div class="mt-4 flex items-center justify-between border-t border-border pt-3.5 text-[14px]">
			<span class="font-bold">{t('dashboard.overview.origins.total')}</span>
			<strong class="tabular-nums">{formatNumber(overview.leads.total)}</strong>
		</div>
	{/if}
</Card>
