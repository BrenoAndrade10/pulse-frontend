<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Chip from '#lib/components/email/Chip.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { cancelCampaign } from '#lib/services/email.js';
	import { emailErrorMessage } from '#lib/utils/emailErrors.js';
	import { formatDateTime, formatNumber, formatPercent } from '#lib/utils/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const campaign = $derived(data.campaign);
	let confirming = $state(false);
	let canceling = $state(false);
	let error = $state<string>();

	const canCancel = $derived(campaign?.status === 'scheduled' || campaign?.status === 'sending');
	const statusTone = {
		draft: 'neutral',
		scheduled: 'primary',
		sending: 'warn',
		sent: 'ok',
		canceled: 'neutral',
		failed: 'danger'
	} as const;

	const segments = $derived.by(() => {
		const bands = campaign?.bands ?? [];
		const keys: ('hot' | 'warm' | 'idle')[] = [];
		if (bands.includes('hot')) keys.push('hot');
		if (bands.includes('warm')) keys.push('warm');
		if (bands.includes('cold') || bands.includes('none')) keys.push('idle');
		return keys.map((key) => t(`email.compose.segment.${key}`)).join(', ');
	});

	const kpis = $derived(
		campaign
			? [
					{ key: 'recipients', value: campaign.recipients },
					{ key: 'sent', value: campaign.sent },
					{ key: 'pending', value: campaign.pending },
					{ key: 'suppressed', value: campaign.suppressed },
					{ key: 'failed', value: campaign.failed }
				]
			: []
	);

	async function confirmCancel() {
		if (!campaign || !data.expertId) return;
		canceling = true;
		error = undefined;
		try {
			await cancelCampaign(data.expertId, campaign.id);
			confirming = false;
			await invalidateAll();
		} catch (failure) {
			error = emailErrorMessage(failure);
			confirming = false;
		} finally {
			canceling = false;
		}
	}
</script>

<svelte:head>
	<title>{campaign?.name ?? t('email.report.notFound')} · {APP_NAME}</title>
</svelte:head>

{#if !campaign}
	<PageHeader
		title={t('email.report.notFound')}
		back={{ href: '/email', label: t('email.report.back') }}
	/>
	<Card><EmptyState icon="mail" title={t('email.report.notFound')} /></Card>
{:else}
	<PageHeader
		title={campaign.name}
		back={{ href: '/email', label: t('email.report.back') }}
		description={t('email.report.subline', {
			segment: segments,
			date: formatDateTime(
				campaign.completedAt ?? campaign.startedAt ?? campaign.scheduledAt ?? campaign.createdAt
			)
		})}
	>
		{#snippet actions()}
			<Chip tone={statusTone[campaign.status]}>{t(`email.status.${campaign.status}`)}</Chip>
			{#if canCancel}
				<Button variant="secondary" onclick={() => (confirming = true)}>
					{t('email.report.cancel')}
				</Button>
			{/if}
		{/snippet}
	</PageHeader>

	{#if error}<div class="mb-4"><Alert>{error}</Alert></div>{/if}
	{#if campaign.status === 'failed' && campaign.failureReason === 'EMAIL_DOMAIN_NOT_READY'}
		<div class="mb-4"><Alert>{t('email.report.failedDomain')}</Alert></div>
	{/if}

	{#if campaign.status === 'sending' && campaign.progress !== null}
		<div
			class="mb-4 h-2 overflow-hidden rounded-full bg-surface"
			role="progressbar"
			aria-valuenow={Math.round(campaign.progress * 100)}
			aria-valuemin="0"
			aria-valuemax="100"
			aria-label={t('email.campaigns.progress', { percent: formatPercent(campaign.progress, 0) })}
		>
			<span
				class="block h-full rounded-full bg-gradient-brand"
				style:width="{campaign.progress * 100}%"
			></span>
		</div>
	{/if}

	<div class="mb-4 grid grid-cols-5 gap-4 max-xl:grid-cols-3 max-[641px]:grid-cols-2">
		{#each kpis as kpi (kpi.key)}
			<div class="rounded-lg border border-border bg-bg-elevated p-5">
				<p class="text-[12px] font-bold tracking-[0.06em] text-fg-subtle uppercase">
					{t(
						`email.report.kpi.${kpi.key as 'recipients' | 'sent' | 'pending' | 'suppressed' | 'failed'}`
					)}
				</p>
				<p class="mt-2 text-[26px] font-extrabold tracking-[-0.03em] tabular-nums">
					{kpi.value === null ? '—' : formatNumber(kpi.value)}
				</p>
			</div>
		{/each}
	</div>

	<div class="grid grid-cols-2 gap-4 max-xl:grid-cols-1">
		<Card title={t('email.report.links.title')} description={t('email.report.links.description')}>
			<p class="text-[14px] text-fg-muted">{t('email.report.links.empty')}</p>
		</Card>
		<Card title={t('email.report.who.title')} description={t('email.report.who.description')}>
			<p class="text-[14px] text-fg-muted">{t('email.report.who.empty')}</p>
		</Card>
	</div>

	<Dialog
		bind:open={confirming}
		title={t('email.report.cancelTitle')}
		description={t('email.report.cancelDescription')}
		size="sm"
	>
		<p class="text-[14px] font-semibold">{campaign.name}</p>
		{#snippet footer()}
			<Button variant="secondary" disabled={canceling} onclick={() => (confirming = false)}>
				{t('email.report.cancelKeep')}
			</Button>
			<Button variant="danger" loading={canceling} onclick={confirmCancel}>
				{t('email.report.cancelConfirm')}
			</Button>
		{/snippet}
	</Dialog>
{/if}
