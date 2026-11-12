<script lang="ts">
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { ApiError } from '#lib/api/http.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { getLeadHeat } from '#lib/services/leads.js';
	import type { Lead, LeadHeatDay, LeadHeatDetail } from '#lib/types.js';
	import { formatDate, formatNumber } from '#lib/utils/format.js';
	import { heatVariants } from '#lib/utils/lead-heat.js';

	type Props = { open?: boolean; expertId: string; lead: Lead | null };

	let { open = $bindable(false), expertId, lead }: Props = $props();

	let phase = $state<'loading' | 'ready' | 'error' | 'notFound'>('loading');
	let detail = $state<LeadHeatDetail>();
	let attempt = $state(0);

	$effect(() => {
		if (!open || !lead) return;
		void attempt;
		const leadId = lead.id;
		let current = true;
		phase = 'loading';
		detail = undefined;
		getLeadHeat(expertId, leadId).then(
			(result) => {
				if (!current) return;
				detail = result;
				phase = 'ready';
			},
			(error) => {
				if (!current) return;
				phase = error instanceof ApiError && error.status === 404 ? 'notFound' : 'error';
			}
		);
		return () => {
			current = false;
		};
	});

	const name = $derived(lead?.name ?? lead?.email ?? t('leads.table.leadFallback'));
	const days = $derived(
		(detail?.days ?? [])
			.filter((day) => signalsOf(day).length > 0)
			.toSorted((a, b) => b.day.localeCompare(a.day))
	);

	function duration(totalSeconds: number): string {
		const seconds = Math.round(totalSeconds);
		const minutes = Math.floor(seconds / 60);
		const rest = seconds % 60;
		if (!minutes) return t('leads.heat.dialog.duration.seconds', { seconds: rest });
		if (!rest) return t('leads.heat.dialog.duration.minutes', { minutes });
		return t('leads.heat.dialog.duration.minutesSeconds', { minutes, seconds: rest });
	}

	function signalsOf(day: LeadHeatDay): { icon: IconName; label: string; value: string }[] {
		const signals: { icon: IconName; label: string; value: string }[] = [];
		const add = (icon: IconName, label: string, value: string, amount: number) => {
			if (amount > 0) signals.push({ icon, label, value });
		};
		add(
			'globe',
			t('leads.heat.dialog.signals.pageViews'),
			formatNumber(day.pageViews),
			day.pageViews
		);
		add(
			'play',
			t('leads.heat.dialog.signals.engagedSeconds'),
			duration(day.engagedSeconds),
			Math.round(day.engagedSeconds)
		);
		add(
			'layers',
			t('leads.heat.dialog.signals.maxScroll'),
			`${formatNumber(Math.round(day.maxScroll))}%`,
			Math.round(day.maxScroll)
		);
		add(
			'target',
			t('leads.heat.dialog.signals.interactions'),
			formatNumber(day.interactions),
			day.interactions
		);
		add('user-plus', t('leads.heat.dialog.signals.leads'), formatNumber(day.leads), day.leads);
		add(
			'link',
			t('leads.heat.dialog.signals.linkClicks'),
			formatNumber(day.linkClicks),
			day.linkClicks
		);
		return signals;
	}

	const dayLabel = (day: string) => formatDate(`${day}T12:00:00`);
</script>

<Dialog
	bind:open
	size="md"
	title={t('leads.heat.dialog.title', { name })}
	description={t('leads.heat.dialog.description')}
>
	<div aria-live="polite" aria-busy={phase === 'loading'}>
		{#if phase === 'loading'}
			<div class="space-y-3" aria-hidden="true">
				<span class="block h-6 w-40 rounded bg-surface motion-safe:animate-pulse"></span>
				<span class="block h-4 w-56 rounded bg-surface motion-safe:animate-pulse"></span>
				{#each { length: 3 }, index (index)}
					<span class="block h-14 rounded-md bg-surface motion-safe:animate-pulse"></span>
				{/each}
			</div>
			<span class="sr-only">{t('common.status.loading')}</span>
		{:else if phase === 'notFound'}
			<EmptyState compact icon="users" title={t('leads.heat.dialog.notFound')} />
		{:else if phase === 'error'}
			<div class="space-y-3">
				<Alert>{t('leads.heat.dialog.error')}</Alert>
				<Button variant="secondary" size="sm" onclick={() => attempt++}
					>{t('common.actions.retry')}</Button
				>
			</div>
		{:else if detail && !detail.hasIdentity}
			<EmptyState
				compact
				icon="flame"
				title={t('leads.heat.dialog.noIdentityTitle')}
				description={t('leads.heat.dialog.noIdentityDescription')}
			/>
		{:else if detail}
			<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
				<Badge variant={heatVariants[detail.band]}>
					{t('leads.heat.dialog.score', {
						band: t(`leads.heat.bands.${detail.band}`),
						score: formatNumber(detail.score)
					})}
				</Badge>
				<p class="text-[13.5px] text-fg-muted">
					{#if detail.lastActivityDay}
						{t('leads.heat.dialog.lastActivity', { date: dayLabel(detail.lastActivityDay) })}
					{:else}
						{t('leads.heat.dialog.noActivity', { days: detail.windowDays })}
					{/if}
				</p>
			</div>
			<p class="mt-2 text-[12.5px] text-fg-subtle">
				{t('leads.heat.dialog.explain', { days: detail.windowDays })}
			</p>

			<h3 class="mt-5 mb-2 text-[12px] font-semibold tracking-[0.05em] text-fg-subtle uppercase">
				{t('leads.heat.dialog.daysHeading')}
			</h3>
			{#if days.length === 0}
				<p class="text-[13.5px] text-fg-muted">{t('leads.heat.dialog.noSignals')}</p>
			{:else}
				<ol class="space-y-2">
					{#each days as day (day.day)}
						<li class="rounded-md border border-border px-3.5 py-3">
							<p class="mb-2 text-[13.5px] font-semibold">{dayLabel(day.day)}</p>
							<ul class="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-fg-muted">
								{#each signalsOf(day) as signal (signal.label)}
									<li class="inline-flex items-center gap-1.5">
										<Icon name={signal.icon} size={14} class="shrink-0 text-fg-subtle" />
										<span>{signal.label}:</span>
										<span class="font-semibold text-fg">{signal.value}</span>
									</li>
								{/each}
							</ul>
						</li>
					{/each}
				</ol>
			{/if}
		{/if}
	</div>

	{#snippet footer()}
		<Button variant="secondary" onclick={() => (open = false)}>{t('common.actions.close')}</Button>
	{/snippet}
</Dialog>
