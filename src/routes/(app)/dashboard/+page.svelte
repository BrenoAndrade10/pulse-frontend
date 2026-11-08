<script lang="ts">
	import { untrack } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import AreaChart from '#lib/components/dashboard/AreaChart.svelte';
	import KpiCard from '#lib/components/dashboard/KpiCard.svelte';
	import OnboardingChecklist from '#lib/components/dashboard/OnboardingChecklist.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import type { IconName } from '#lib/components/ui/Icon.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import { auth } from '#lib/auth/session.svelte.js';
	import { APP_NAME } from '#lib/config.js';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import { contextScope } from '#lib/context/selection.js';
	import { onboardingPreference } from '#lib/onboarding/preference.svelte.js';
	import { loadOnboardingSignals, whatsappOnboardingAvailable } from '#lib/onboarding/signals.js';
	import {
		buildOnboardingSteps,
		onboardingScope,
		type OnboardingSignals
	} from '#lib/onboarding/steps.js';
	import { PERIODS } from '#lib/services/dashboard.js';
	import type { LaunchStatus, LaunchType, MetricKey } from '#lib/types.js';
	import {
		formatCurrency,
		formatCurrencyCompact,
		formatNumber,
		formatRoas,
		formatShortDate
	} from '#lib/utils/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const kpis: {
		key: MetricKey;
		label: MessageKey;
		icon: IconName;
		format: (v: number | null) => string;
		invertDelta?: boolean;
	}[] = [
		{ key: 'spend', label: 'dashboard.kpi.spend', icon: 'wallet', format: formatCurrency },
		{ key: 'revenue', label: 'dashboard.kpi.revenue', icon: 'trending-up', format: formatCurrency },
		{ key: 'roas', label: 'dashboard.kpi.roas', icon: 'target', format: formatRoas },
		{ key: 'leads', label: 'dashboard.kpi.leads', icon: 'user-plus', format: formatNumber },
		{
			key: 'cpl',
			label: 'dashboard.kpi.cpl',
			icon: 'tag',
			format: formatCurrency,
			invertDelta: true
		},
		{ key: 'sales', label: 'dashboard.kpi.sales', icon: 'bag', format: formatNumber }
	];

	const launchStatus: Record<
		LaunchStatus,
		{ label: MessageKey; variant: 'neutral' | 'warning' | 'success' | 'danger' }
	> = {
		draft: { label: 'dashboard.launchStatus.draft', variant: 'neutral' },
		planned: { label: 'dashboard.launchStatus.planned', variant: 'warning' },
		in_progress: { label: 'dashboard.launchStatus.in_progress', variant: 'success' },
		completed: { label: 'dashboard.launchStatus.completed', variant: 'neutral' },
		canceled: { label: 'dashboard.launchStatus.canceled', variant: 'danger' },
		archived: { label: 'dashboard.launchStatus.archived', variant: 'neutral' }
	};
	const launchTypeLabel: Record<LaunchType, MessageKey> = {
		internal: 'dashboard.launchType.internal',
		seed: 'dashboard.launchType.seed',
		perpetual: 'dashboard.launchType.perpetual',
		webinar: 'dashboard.launchType.webinar',
		other: 'dashboard.launchType.other'
	};
	const periodKey = (value: string) => `dashboard.periods.${value}` as MessageKey;

	const hasExperts = $derived(data.experts.length > 0);
	const connectedCount = $derived(
		data.experts.filter((e) => e.instagram.status === 'connected').length
	);
	const expiredCount = $derived(
		data.experts.filter((e) => e.instagram.status === 'expired').length
	);

	const launch = $derived(data.launches.find((item) => item.id === data.launchId) ?? null);
	const contextExpert = $derived(
		data.experts.find((expert) => expert.id === (launch?.expertId ?? data.expertId)) ?? null
	);
	const headerTitle = $derived(
		launch?.name ?? contextExpert?.name ?? t('dashboard.header.overview')
	);
	const periodLabel = $derived(
		PERIODS.some((p) => p.value === data.period) ? t(periodKey(data.period)) : ''
	);
	const headerDescription = $derived(
		launch
			? launch.description?.trim() ||
					t('dashboard.header.launchDescription', {
						type: t(launchTypeLabel[launch.type]),
						period: periodLabel
					})
			: contextExpert
				? t('dashboard.header.expertDescription', { name: contextExpert.name, period: periodLabel })
				: t('dashboard.header.allDescription', { period: periodLabel })
	);
	const primaryAction = $derived(
		launch
			? {
					href: `/leads?launch=${encodeURIComponent(launch.id)}`,
					label: t('dashboard.actions.viewLeads')
				}
			: hasExperts
				? {
						href: '/launches',
						label: contextExpert
							? t('dashboard.actions.viewLaunches')
							: t('dashboard.actions.goToLaunches')
					}
				: { href: '/experts/new', label: t('dashboard.actions.registerExpert') }
	);

	onboardingPreference.load(contextScope(auth.user?.id ?? '', auth.activeTenant?.tenantId ?? ''));

	let signals = $state<OnboardingSignals | null>(null);
	let announcement = $state('');

	const scopeExperts = $derived(onboardingScope(data.experts, data.expertId));
	const scopeKey = $derived(scopeExperts.map((expert) => expert.id).join(','));
	const signalsReady = $derived(scopeExperts.length === 0 || signals !== null);
	const onboardingSteps = $derived(
		buildOnboardingSteps({
			experts: data.experts,
			contextExpertId: data.expertId,
			signals: signals ?? { pixelInstalled: false, whatsappConnected: false },
			whatsappAvailable: whatsappOnboardingAvailable
		})
	);
	const showOnboarding = $derived(onboardingPreference.status === 'active' && signalsReady);

	$effect(() => {
		void scopeKey;
		if (onboardingPreference.status !== 'active') return;
		const experts = untrack(() => scopeExperts);
		if (experts.length === 0) {
			signals = null;
			return;
		}

		let cancelled = false;
		signals = null;
		void loadOnboardingSignals(experts).then((result) => {
			if (!cancelled) signals = result;
		});

		return () => {
			cancelled = true;
		};
	});

	function dismissOnboarding() {
		onboardingPreference.dismiss();
		announcement = t('dashboard.announce.dismissed');
	}

	function finishOnboarding() {
		onboardingPreference.complete();
		announcement = t('dashboard.announce.finished');
	}

	function setFilter(key: 'period', value: string) {
		const params = Object.fromEntries(page.url.searchParams);
		if (value) params[key] = value;
		else delete params[key];
		const query = new URLSearchParams(params).toString();
		goto(query ? `?${query}` : page.url.pathname, { replace: true, reset: false });
	}

	// Classes compartilhadas pelas células da tabela de desempenho.
	const cell = 'px-5.5 py-3.5 whitespace-nowrap border-b border-border';
	const headCell = `${cell} text-[12px] font-semibold tracking-[0.05em] text-fg-subtle uppercase`;
	const num = 'text-right tabular-nums';
</script>

<svelte:head>
	<title>{headerTitle} · {APP_NAME}</title>
</svelte:head>

<header class="mb-7 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
	<div class="min-w-0 flex-1 basis-80">
		{#if launch}
			<div class="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-2">
				{#if contextExpert}
					<a
						class="text-[13px] font-semibold text-fg-muted hover:text-fg"
						href="/experts/{contextExpert.id}">{contextExpert.name}</a
					>
				{/if}
				<Badge variant={launchStatus[launch.status].variant}
					>{t(launchStatus[launch.status].label)}</Badge
				>
			</div>
		{:else if contextExpert}
			<p class="mb-2.5 text-[12px] font-bold tracking-[0.05em] text-fg-subtle uppercase">
				{t('dashboard.header.expert')}
			</p>
		{/if}
		<h1 class="text-[26px] leading-tight font-extrabold tracking-[-0.03em] wrap-break-word">
			{headerTitle}
		</h1>
		<p class="mt-1.5 text-fg-muted">{headerDescription}</p>
	</div>
	<div class="flex flex-wrap items-center gap-2.5">
		<div
			class="inline-flex rounded-md border border-border bg-surface p-[3px]"
			role="group"
			aria-label={t('dashboard.header.periodLabel')}
		>
			{#each PERIODS as period (period.value)}
				<button
					class={[
						'h-8.5 cursor-pointer rounded-[9px] px-3.5 text-[13px] font-semibold text-fg-muted hover:text-fg',
						'aria-pressed:bg-surface-hover aria-pressed:text-fg',
						'aria-pressed:shadow-[inset_0_0_0_1px_var(--color-border-strong)]'
					]}
					type="button"
					aria-pressed={data.period === period.value}
					onclick={() => setFilter('period', period.value)}
				>
					{t(periodKey(period.value))}
				</button>
			{/each}
		</div>
		<a class={buttonClass()} href={primaryAction.href}>{primaryAction.label}</a>
	</div>
</header>

<p class="sr-only" role="status">{announcement}</p>

{#if showOnboarding}
	<OnboardingChecklist
		steps={onboardingSteps}
		ondismiss={dismissOnboarding}
		onfinish={finishOnboarding}
	/>
{/if}

<div class="mb-6 grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-[561px]:grid-cols-1">
	{#each kpis as kpi (kpi.key)}
		<KpiCard
			label={t(kpi.label)}
			icon={kpi.icon}
			value={kpi.format(data.dashboard.totals[kpi.key])}
			delta={data.dashboard.deltas[kpi.key]}
			invertDelta={kpi.invertDelta}
		/>
	{/each}
</div>

<div class="mb-6 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 max-xl:grid-cols-1">
	<Card title={t('dashboard.chart.title')} description={t('dashboard.chart.description')}>
		{#if data.dashboard.series.length}
			<AreaChart
				ariaLabel={t('dashboard.chart.ariaLabel')}
				labels={data.dashboard.series.map((p) => formatShortDate(p.date))}
				series={[
					{
						name: t('dashboard.chart.revenue'),
						color: '#ff4d9d',
						values: data.dashboard.series.map((p) => p.revenue)
					},
					{
						name: t('dashboard.chart.spend'),
						color: '#7c5cff',
						values: data.dashboard.series.map((p) => p.spend)
					}
				]}
				formatValue={formatCurrency}
				formatAxis={formatCurrencyCompact}
			/>
		{:else}
			<EmptyState
				icon="bar-chart"
				title={t('dashboard.chart.emptyTitle')}
				description={t('dashboard.chart.emptyDescription')}
			/>
		{/if}
	</Card>

	<Card title={t('dashboard.instagram.title')} description={t('dashboard.instagram.description')}>
		{#if hasExperts}
			<ul class="flex flex-col gap-1">
				<li class="flex items-center justify-between border-b border-border py-3 text-[14px]">
					<span class="inline-flex items-center gap-2.5 text-fg-muted"
						><i class="size-2 rounded-full bg-success"></i>{t(
							'dashboard.instagram.connected'
						)}</span
					>
					<strong class="text-[18px] tabular-nums">{connectedCount}</strong>
				</li>
				<li class="flex items-center justify-between border-b border-border py-3 text-[14px]">
					<span class="inline-flex items-center gap-2.5 text-fg-muted"
						><i class="size-2 rounded-full bg-warning"></i>{t('dashboard.instagram.expired')}</span
					>
					<strong class="text-[18px] tabular-nums">{expiredCount}</strong>
				</li>
				<li class="flex items-center justify-between border-b border-border py-3 text-[14px]">
					<span class="inline-flex items-center gap-2.5 text-fg-muted"
						><i class="size-2 rounded-full bg-fg-subtle"></i>{t(
							'dashboard.instagram.notConnected'
						)}</span
					>
					<strong class="text-[18px] tabular-nums"
						>{data.experts.length - connectedCount - expiredCount}</strong
					>
				</li>
			</ul>
			<a
				class={[buttonClass({ variant: 'secondary', size: 'sm' }), 'mt-4.5 w-full']}
				href="/integrations#instagram">{t('dashboard.instagram.manage')}</a
			>
		{:else}
			<EmptyState
				compact
				icon="instagram"
				title={t('dashboard.instagram.emptyTitle')}
				description={t('dashboard.instagram.emptyDescription')}
			/>
		{/if}
	</Card>
</div>

<Card title={t('dashboard.table.title')} description={t('dashboard.table.description')} flush>
	{#if data.dashboard.byExpert.length}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-[14px]">
				<thead>
					<tr>
						<th class="{headCell} text-left">{t('dashboard.table.expert')}</th>
						<th class="{headCell} {num}">{t('dashboard.table.spend')}</th>
						<th class="{headCell} {num}">{t('dashboard.table.revenue')}</th>
						<th class="{headCell} {num}">{t('dashboard.table.roas')}</th>
						<th class="{headCell} {num}">{t('dashboard.table.leads')}</th>
						<th class="{headCell} {num}">{t('dashboard.table.cpl')}</th>
					</tr>
				</thead>
				<tbody>
					{#each data.dashboard.byExpert as row (row.expertId)}
						<tr class="[&:last-child>td]:border-b-0">
							<td class="{cell} text-left"><a href="/experts/{row.expertId}">{row.name}</a></td>
							<td class="{cell} {num}">{formatCurrency(row.spend)}</td>
							<td class="{cell} {num}">{formatCurrency(row.revenue)}</td>
							<td class="{cell} {num}">{formatRoas(row.roas)}</td>
							<td class="{cell} {num}">{formatNumber(row.leads)}</td>
							<td class="{cell} {num}">{formatCurrency(row.cpl)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else}
		<EmptyState
			icon="users"
			title={t('dashboard.table.emptyTitle')}
			description={t('dashboard.table.emptyDescription')}
		>
			{#snippet action()}
				{#if !hasExperts}
					<a class={buttonClass()} href="/experts/new">{t('dashboard.actions.registerExpert')}</a>
				{/if}
			{/snippet}
		</EmptyState>
	{/if}
</Card>
