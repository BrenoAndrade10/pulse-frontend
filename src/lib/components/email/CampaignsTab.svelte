<script lang="ts">
	import { page } from '$app/state';
	import Chip from '#lib/components/email/Chip.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import {
		listCampaigns,
		type Campaign,
		type CampaignBand,
		type CampaignStatus
	} from '#lib/services/email.js';
	import { emailErrorMessage } from '#lib/utils/emailErrors.js';
	import { EMPTY_VALUE, formatDateTime, formatNumber, formatPercent } from '#lib/utils/format.js';

	type SegmentKey = 'hot' | 'warm' | 'idle';

	let campaigns = $state<Campaign[]>([]);
	let phase = $state<'select' | 'loading' | 'ready' | 'error'>('loading');
	let error = $state<string>();
	let query = $state('');
	let statusFilter = $state<'all' | CampaignStatus>('all');
	const expertId = $derived<string | null>(page.data.selectedExpertId ?? null);

	$effect(() => {
		const id = expertId;
		if (!id) {
			campaigns = [];
			phase = 'select';
			return;
		}
		let current = true;
		phase = 'loading';
		error = undefined;
		listCampaigns(id).then(
			(list) => {
				if (!current) return;
				campaigns = list;
				phase = 'ready';
			},
			(failure: unknown) => {
				if (!current) return;
				error = emailErrorMessage(failure);
				phase = 'error';
			}
		);
		return () => {
			current = false;
		};
	});

	const statusOptions = $derived([
		{ value: 'all', label: t('email.campaigns.allStatuses') },
		...(['draft', 'scheduled', 'sending', 'sent', 'canceled', 'failed'] as const).map((value) => ({
			value,
			label: t(`email.status.${value}`)
		}))
	]);

	const visible = $derived(
		campaigns.filter(
			(campaign) =>
				(statusFilter === 'all' || campaign.status === statusFilter) &&
				(!query.trim() ||
					campaign.name.toLowerCase().includes(query.trim().toLowerCase()) ||
					campaign.subject.toLowerCase().includes(query.trim().toLowerCase()))
		)
	);

	const totals = $derived({
		sent: campaigns.reduce((sum, campaign) => sum + campaign.sent, 0),
		scheduled: campaigns.filter((campaign) => campaign.status === 'scheduled').length,
		failed: campaigns.reduce((sum, campaign) => sum + campaign.failed, 0)
	});

	const statusTone = {
		draft: 'neutral',
		scheduled: 'primary',
		sending: 'warn',
		sent: 'ok',
		canceled: 'neutral',
		failed: 'danger'
	} as const;

	const SEGMENT_TONE = { hot: 'danger', warm: 'warn', idle: 'neutral' } as const;

	function segmentsOf(bands: CampaignBand[]): SegmentKey[] {
		const keys: SegmentKey[] = [];
		if (bands.includes('hot')) keys.push('hot');
		if (bands.includes('warm')) keys.push('warm');
		if (bands.includes('cold') || bands.includes('none')) keys.push('idle');
		return keys;
	}

	function dateOf(campaign: Campaign): string {
		return campaign.completedAt ?? campaign.startedAt ?? campaign.scheduledAt ?? campaign.createdAt;
	}

	const linkOf = (campaign: Campaign) =>
		campaign.status === 'draft' ? `/email/new?id=${campaign.id}` : `/email/${campaign.id}`;

	const head = 'px-4 py-3.5 text-left text-[13px] font-semibold text-fg-muted';
</script>

<div class="mb-4 grid grid-cols-3 gap-4 max-[561px]:grid-cols-1">
	{#each [{ key: 'sent', value: totals.sent }, { key: 'scheduled', value: totals.scheduled }, { key: 'failed', value: totals.failed }] as const as kpi (kpi.key)}
		<Card>
			<p class="text-[12px] font-bold tracking-[0.06em] text-fg-subtle uppercase">
				{t(`email.campaigns.kpi.${kpi.key}`)}
			</p>
			<p class="mt-2 text-[28px] font-extrabold tracking-[-0.03em] tabular-nums">
				{formatNumber(kpi.value)}
			</p>
		</Card>
	{/each}
</div>

<div class="mb-4 flex flex-wrap items-center gap-3" role="search">
	<div
		class="flex min-w-64 flex-1 items-center rounded-md border border-border bg-surface focus-within:border-primary focus-within:shadow-focus"
	>
		<span class="pl-3.5 text-fg-subtle" aria-hidden="true"><Icon name="search" size={16} /></span>
		<label class="sr-only" for="campaign-search">{t('email.campaigns.search')}</label>
		<input
			class="h-11 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none"
			id="campaign-search"
			type="search"
			bind:value={query}
			placeholder={t('email.campaigns.search')}
			autocomplete="off"
		/>
	</div>
	<div class="w-52 max-[621px]:w-full">
		<Select
			id="campaign-status"
			aria-label={t('email.campaigns.table.status')}
			bind:value={statusFilter}
			options={statusOptions}
		/>
	</div>
</div>

{#if phase === 'select'}
	<Card>
		<EmptyState icon="mail" title={t('leads.heat.overview.selectExpert')} />
	</Card>
{:else if phase === 'loading'}
	<div class="h-72 rounded-lg border border-border bg-bg-elevated motion-safe:animate-pulse"></div>
{:else if phase === 'error'}
	<Alert>{error}</Alert>
{:else if visible.length === 0}
	<Card>
		<EmptyState
			icon="mail"
			title={campaigns.length === 0
				? t('email.campaigns.empty.title')
				: t('email.campaigns.empty.noResults')}
			description={campaigns.length === 0
				? t('email.campaigns.empty.description')
				: t('email.campaigns.empty.noResultsDescription')}
		/>
	</Card>
{:else}
	<Card flush>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-[14px]">
				<thead>
					<tr class="border-b border-border">
						<th class="{head} pl-6">{t('email.campaigns.table.campaign')}</th>
						<th class={head}>{t('email.campaigns.table.segment')}</th>
						<th class={head}>{t('email.campaigns.table.status')}</th>
						<th class={head}>{t('email.campaigns.table.sent')}</th>
						<th class={head}>{t('email.campaigns.table.date')}</th>
					</tr>
				</thead>
				<tbody>
					{#each visible as campaign (campaign.id)}
						<tr class="border-b border-border last:border-b-0 hover:bg-white/2">
							<td class="py-4 pr-4 pl-6">
								<a class="font-bold text-fg hover:text-primary-hover" href={linkOf(campaign)}
									>{campaign.name}</a
								>
								<p class="mt-1 text-[12.5px] text-fg-muted">
									{t('email.campaigns.subjectLine', { subject: campaign.subject })}
								</p>
							</td>
							<td class="px-4 py-4">
								<span class="flex flex-wrap gap-1.5">
									{#each segmentsOf(campaign.bands) as key (key)}
										<Chip tone={SEGMENT_TONE[key]} dot={false}>
											{t(`email.compose.segment.${key}`)}
										</Chip>
									{/each}
								</span>
							</td>
							<td class="px-4 py-4">
								<Chip tone={statusTone[campaign.status]}>
									{campaign.status === 'sending' && campaign.progress !== null
										? t('email.campaigns.progress', {
												percent: formatPercent(campaign.progress, 0)
											})
										: t(`email.status.${campaign.status}`)}
								</Chip>
							</td>
							<td class="px-4 py-4 tabular-nums">
								{#if campaign.recipients === null || campaign.status === 'draft' || campaign.status === 'scheduled'}
									{EMPTY_VALUE}
								{:else if campaign.status === 'sending'}
									{formatNumber(campaign.sent)}/{formatNumber(campaign.recipients)}
								{:else}
									{formatNumber(campaign.sent)}
								{/if}
							</td>
							<td class="px-4 py-4 whitespace-nowrap text-fg-muted">
								{formatDateTime(dateOf(campaign))}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="border-t border-border px-6 py-4 text-[13.5px] text-fg-muted">
			{t('email.campaigns.count', {
				count: visible.length,
				formatted: formatNumber(visible.length)
			})}
		</p>
	</Card>
{/if}
