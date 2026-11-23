<script lang="ts">
	import LeadHeatDialog from '#lib/components/leads/LeadHeatDialog.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import { getHeatSummary } from '#lib/services/leads.js';
	import type { HeatPriorityLead, HeatSummary } from '#lib/types.js';
	import { formatNumber, formatRelativeTime, initials } from '#lib/utils/format.js';

	type Props = { expertId: string | null; launchId: string | null };

	let { expertId, launchId }: Props = $props();

	const VISIBLE = 3;

	let phase = $state<'loading' | 'ready' | 'error'>('loading');
	let counts = $state<HeatSummary['counts']>({ hot: 0, warm: 0, cold: 0, none: 0, total: 0 });
	let priority = $state<HeatPriorityLead[]>([]);
	let heatOpen = $state(false);
	let heatLead = $state<HeatPriorityLead | null>(null);

	$effect(() => {
		if (!expertId) return;
		const id = expertId;
		const launch = launchId ?? undefined;
		let current = true;
		phase = 'loading';
		getHeatSummary(id, launch).then(
			(summary) => {
				if (!current) return;
				counts = summary.counts;
				priority = summary.priority.slice(0, VISIBLE);
				phase = 'ready';
			},
			() => {
				if (current) phase = 'error';
			}
		);
		return () => {
			current = false;
		};
	});

	const leadsHref = $derived(
		launchId ? `/leads?heat=hot&launch=${encodeURIComponent(launchId)}` : '/leads?heat=hot'
	);

	const leadName = (lead: HeatPriorityLead) =>
		lead.name ?? lead.email ?? t('leads.table.leadFallback');

	function reasonText(lead: HeatPriorityLead): string {
		const recent = lead.recent;
		if (!recent)
			return t('leads.heat.overview.activity', { when: formatRelativeTime(lead.lastSeenAt) });
		const parts: string[] = [];
		const amount = (key: 'clicks' | 'visits' | 'interactions', count: number) =>
			t(`leads.heat.overview.reason.${key}`, { count, formatted: formatNumber(count) });
		if (recent.leads > 0) parts.push(t('leads.heat.overview.reason.form'));
		if (recent.linkClicks > 0) parts.push(amount('clicks', recent.linkClicks));
		if (recent.pageViews > 0) parts.push(amount('visits', recent.pageViews));
		if (recent.interactions > 0) parts.push(amount('interactions', recent.interactions));
		if (parts.length === 0) return t('leads.heat.overview.reason.fallback');
		return parts.join(' · ');
	}

	function openLead(lead: HeatPriorityLead) {
		heatLead = lead;
		heatOpen = true;
	}
</script>

<section
	class="flex min-w-0 flex-col rounded-lg border border-primary/30 bg-[linear-gradient(160deg,rgb(124_92_255/0.22),rgb(192_77_255/0.08)_60%,rgb(255_77_157/0.06))] p-5.5"
>
	<header class="mb-4 flex items-start justify-between gap-3">
		<h2 class="text-[18px] font-bold tracking-[-0.01em]">{t('leads.heat.overview.priority')}</h2>
		<span
			class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/40 bg-accent/12 px-3 py-1 text-[12.5px] font-semibold text-[#ff9bc8]"
		>
			<Icon name="flame" size={14} />
			{t('leads.heat.overview.title')}
		</span>
	</header>

	{#if !expertId}
		<EmptyState compact icon="flame" title={t('leads.heat.overview.selectExpert')} />
	{:else if phase === 'error'}
		<EmptyState compact icon="flame" title={t('leads.heat.overview.error')} />
	{:else if phase === 'loading'}
		<ul class="grid gap-2.5" aria-hidden="true" aria-busy="true">
			{#each { length: VISIBLE }, index (index)}
				<li class="h-14 rounded-md bg-white/6 motion-safe:animate-pulse"></li>
			{/each}
		</ul>
	{:else if priority.length === 0}
		<EmptyState
			compact
			icon="flame"
			title={counts.total === 0 ? t('leads.heat.overview.none') : t('leads.heat.overview.empty')}
		/>
	{:else}
		<ul class="divide-y divide-white/10">
			{#each priority as lead (lead.id)}
				<li>
					<button
						type="button"
						class="flex w-full cursor-pointer items-center gap-3.5 rounded-md py-3 text-left hover:bg-white/5 focus-visible:shadow-focus"
						aria-haspopup="dialog"
						aria-label={t('leads.heat.overview.openAria', { name: leadName(lead) })}
						onclick={() => openLead(lead)}
					>
						<span
							class="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-brand text-[13px] font-extrabold"
							aria-hidden="true">{initials(leadName(lead))}</span
						>
						<span class="min-w-0 flex-1">
							<span class="block truncate text-[15px] font-bold">{leadName(lead)}</span>
							<span class="block truncate text-[13px] text-fg-muted">{reasonText(lead)}</span>
						</span>
						<Icon name="chevron-right" size={16} class="text-fg-subtle" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}

	{#if expertId}
		<a
			class="mt-auto flex h-11 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/6 pt-0 text-[14px] font-semibold text-fg hover:bg-white/10 hover:no-underline"
			href={leadsHref}
		>
			{t('leads.heat.overview.viewPriority')}
			<Icon name="arrow-left" size={16} class="rotate-180" />
		</a>
	{/if}
</section>

{#if expertId}
	<LeadHeatDialog bind:open={heatOpen} {expertId} lead={heatLead} />
{/if}
