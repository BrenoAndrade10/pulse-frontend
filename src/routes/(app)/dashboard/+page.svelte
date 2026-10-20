<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import AreaChart from '#lib/components/dashboard/AreaChart.svelte';
	import KpiCard from '#lib/components/dashboard/KpiCard.svelte';
	import OnboardingChecklist from '#lib/components/dashboard/OnboardingChecklist.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import type { IconName } from '#lib/components/ui/Icon.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import { APP_NAME } from '#lib/config.js';
	import { PERIODS } from '#lib/services/dashboard.js';
	import type { MetricKey } from '#lib/types.js';
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
		label: string;
		icon: IconName;
		format: (v: number | null) => string;
		invertDelta?: boolean;
	}[] = [
		{ key: 'spend', label: 'Investimento', icon: 'wallet', format: formatCurrency },
		{ key: 'revenue', label: 'Receita', icon: 'trending-up', format: formatCurrency },
		{ key: 'roas', label: 'ROAS', icon: 'target', format: formatRoas },
		{ key: 'leads', label: 'Leads', icon: 'user-plus', format: formatNumber },
		{ key: 'cpl', label: 'Custo por lead', icon: 'tag', format: formatCurrency, invertDelta: true },
		{ key: 'sales', label: 'Vendas', icon: 'bag', format: formatNumber }
	];

	const hasExperts = $derived(data.experts.length > 0);
	const connectedCount = $derived(
		data.experts.filter((e) => e.instagram.status === 'connected').length
	);
	const expiredCount = $derived(
		data.experts.filter((e) => e.instagram.status === 'expired').length
	);

	const onboardingSteps = $derived([
		{
			title: 'Cadastre seu primeiro expert',
			description: 'Nome, e-mail e dados básicos de quem você gerencia.',
			href: '/experts/new',
			cta: 'Cadastrar',
			done: hasExperts
		},
		{
			title: 'Conecte o Instagram',
			description:
				'Autorize a conta profissional de cada expert para importar publicações e Reels.',
			href: '/integrations#instagram',
			cta: 'Conectar',
			done: connectedCount > 0
		}
	]);

	const showOnboarding = $derived(onboardingSteps.some((s) => !s.done));

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
	<title>Dashboard · {APP_NAME}</title>
</svelte:head>

<PageHeader title="Dashboard" description="Visão consolidada das campanhas dos seus experts.">
	{#snippet actions()}
		<div
			class="inline-flex rounded-md border border-border bg-surface p-[3px]"
			role="group"
			aria-label="Período"
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
					{period.label}
				</button>
			{/each}
		</div>
	{/snippet}
</PageHeader>

{#if showOnboarding}
	<OnboardingChecklist steps={onboardingSteps} />
{/if}

<div class="mb-6 grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-[561px]:grid-cols-1">
	{#each kpis as kpi (kpi.key)}
		<KpiCard
			label={kpi.label}
			icon={kpi.icon}
			value={kpi.format(data.dashboard.totals[kpi.key])}
			delta={data.dashboard.deltas[kpi.key]}
			invertDelta={kpi.invertDelta}
		/>
	{/each}
</div>

<div class="mb-6 grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-4 max-xl:grid-cols-1">
	<Card title="Investimento x Receita" description="Evolução diária no período selecionado.">
		{#if data.dashboard.series.length}
			<AreaChart
				ariaLabel="Gráfico de investimento e receita por dia"
				labels={data.dashboard.series.map((p) => formatShortDate(p.date))}
				series={[
					{
						name: 'Receita',
						color: '#ff4d9d',
						values: data.dashboard.series.map((p) => p.revenue)
					},
					{
						name: 'Investimento',
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
				title="Nenhum dado para exibir"
				description="Os resultados aparecem aqui assim que houver uma conta de anúncios do Meta Ads conectada com campanhas ativas."
			/>
		{/if}
	</Card>

	<Card title="Instagram" description="Status das conexões dos experts.">
		{#if hasExperts}
			<ul class="flex flex-col gap-1">
				<li class="flex items-center justify-between border-b border-border py-3 text-[14px]">
					<span class="inline-flex items-center gap-2.5 text-fg-muted"
						><i class="size-2 rounded-full bg-success"></i>Conectadas</span
					>
					<strong class="text-[18px] tabular-nums">{connectedCount}</strong>
				</li>
				<li class="flex items-center justify-between border-b border-border py-3 text-[14px]">
					<span class="inline-flex items-center gap-2.5 text-fg-muted"
						><i class="size-2 rounded-full bg-warning"></i>Conexão expirada</span
					>
					<strong class="text-[18px] tabular-nums">{expiredCount}</strong>
				</li>
				<li class="flex items-center justify-between border-b border-border py-3 text-[14px]">
					<span class="inline-flex items-center gap-2.5 text-fg-muted"
						><i class="size-2 rounded-full bg-fg-subtle"></i>Não conectadas</span
					>
					<strong class="text-[18px] tabular-nums"
						>{data.experts.length - connectedCount - expiredCount}</strong
					>
				</li>
			</ul>
			<a
				class={[buttonClass({ variant: 'secondary', size: 'sm' }), 'mt-4.5 w-full']}
				href="/integrations#instagram">Gerenciar conexões</a
			>
		{:else}
			<EmptyState
				compact
				icon="instagram"
				title="Nenhuma conta conectada"
				description="Cadastre um expert para conectar a conta profissional do Instagram dele."
			/>
		{/if}
	</Card>
</div>

<Card title="Desempenho por expert" description="Comparativo de resultados no período." flush>
	{#if data.dashboard.byExpert.length}
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-[14px]">
				<thead>
					<tr>
						<th class="{headCell} text-left">Expert</th>
						<th class="{headCell} {num}">Investimento</th>
						<th class="{headCell} {num}">Receita</th>
						<th class="{headCell} {num}">ROAS</th>
						<th class="{headCell} {num}">Leads</th>
						<th class="{headCell} {num}">CPL</th>
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
			title="Sem desempenho registrado"
			description="Quando seus experts tiverem campanhas rodando, o comparativo aparece aqui."
		>
			{#snippet action()}
				{#if !hasExperts}
					<a class={buttonClass()} href="/experts/new">Cadastrar expert</a>
				{/if}
			{/snippet}
		</EmptyState>
	{/if}
</Card>
