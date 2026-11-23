<script lang="ts">
	import AreaChart from '#lib/components/dashboard/AreaChart.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import type { CaptureOverview } from '#lib/types.js';
	import { formatNumber, formatShortDate } from '#lib/utils/format.js';

	type Props = {
		phase: 'select' | 'loading' | 'ready' | 'error';
		overview: CaptureOverview | null;
	};

	let { phase, overview }: Props = $props();
</script>

<Card title={t('dashboard.overview.capture.title')}>
	{#if phase === 'select'}
		<EmptyState compact icon="user-plus" title={t('dashboard.overview.selectExpert')} />
	{:else if phase === 'error'}
		<EmptyState compact icon="user-plus" title={t('dashboard.overview.error')} />
	{:else}
		<div class="flex flex-wrap items-center gap-x-8 gap-y-4" aria-busy={phase === 'loading'}>
			<div class="flex items-center gap-3.5">
				<span
					class="grid size-12 shrink-0 place-items-center rounded-md bg-surface text-primary-hover"
				>
					<Icon name="user-plus" size={22} />
				</span>
				<div>
					<p class="text-[28px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
						{#if overview}{formatNumber(overview.leads.total)}{:else}
							<span class="inline-block h-7 w-16 rounded bg-surface motion-safe:animate-pulse"
							></span>
						{/if}
					</p>
					<p class="mt-1 text-[13px] text-fg-muted">{t('dashboard.overview.capture.leads')}</p>
				</div>
			</div>
			<span class="hidden h-10 w-px bg-border sm:block" aria-hidden="true"></span>
			<div class="flex items-center gap-3.5">
				<span
					class="grid size-12 shrink-0 place-items-center rounded-md bg-surface text-primary-hover"
				>
					<Icon name="link" size={22} />
				</span>
				<div>
					<p class="text-[28px] leading-none font-extrabold tracking-[-0.03em] tabular-nums">
						{#if overview}{formatNumber(overview.linkClicks)}{:else}
							<span class="inline-block h-7 w-16 rounded bg-surface motion-safe:animate-pulse"
							></span>
						{/if}
					</p>
					<p class="mt-1 text-[13px] text-fg-muted">{t('dashboard.overview.capture.clicks')}</p>
				</div>
			</div>
		</div>

		<div class="mt-5">
			{#if overview}
				<AreaChart
					ariaLabel={t('dashboard.overview.capture.chartAria')}
					labels={overview.leads.series.map((point) => formatShortDate(point.date))}
					series={[
						{
							name: t('dashboard.overview.capture.leads'),
							color: '#7c5cff',
							values: overview.leads.series.map((point) => point.count)
						}
					]}
					formatValue={formatNumber}
					height={190}
				/>
			{:else}
				<span class="block h-47.5 rounded-md bg-surface motion-safe:animate-pulse"></span>
			{/if}
		</div>
	{/if}
</Card>
