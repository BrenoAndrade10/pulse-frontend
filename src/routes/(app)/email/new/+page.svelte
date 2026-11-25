<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Chip from '#lib/components/email/Chip.svelte';
	import EmailEditor from '#lib/components/email/EmailEditor.svelte';
	import Stepper from '#lib/components/email/Stepper.svelte';
	import { type IconName } from '#lib/components/ui/Icon.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import {
		getCampaign,
		getEmailSettings,
		saveCampaign,
		type CampaignBand,
		type CampaignLocale,
		type EmailSettings
	} from '#lib/services/email.js';
	import { getHeatSummary } from '#lib/services/leads.js';
	import { emailErrorMessage } from '#lib/utils/emailErrors.js';
	import { formatNumber } from '#lib/utils/format.js';

	type SegmentKey = 'hot' | 'warm' | 'idle';
	type Step = 1 | 2 | 3;

	const SEGMENTS: {
		key: SegmentKey;
		bands: CampaignBand[];
		chip: 'danger' | 'warn' | 'neutral';
	}[] = [
		{ key: 'hot', bands: ['hot'], chip: 'danger' },
		{ key: 'warm', bands: ['warm'], chip: 'warn' },
		{ key: 'idle', bands: ['cold', 'none'], chip: 'neutral' }
	];

	const campaignLocale = (): CampaignLocale =>
		i18n.locale === 'es' ? 'es' : i18n.locale === 'en' ? 'en' : 'pt';

	function segmentFromBands(bands: CampaignBand[]): SegmentKey {
		if (bands.includes('cold') || bands.includes('none')) return 'idle';
		return bands.includes('hot') ? 'hot' : 'warm';
	}

	let counts = $state<Record<SegmentKey, number>>({ hot: 0, warm: 0, idle: 0 });
	let countsPhase = $state<'select' | 'loading' | 'ready'>('select');
	let settings = $state<EmailSettings | null>(null);
	const expertId = $derived<string | null>(page.data.selectedExpertId ?? null);

	$effect(() => {
		const id = expertId;
		if (!id) {
			countsPhase = 'select';
			counts = { hot: 0, warm: 0, idle: 0 };
			return;
		}
		let current = true;
		countsPhase = 'loading';
		getHeatSummary(id).then(
			(summary) => {
				if (!current) return;
				counts = {
					hot: summary.counts.hot,
					warm: summary.counts.warm,
					idle: summary.counts.cold + summary.counts.none
				};
				countsPhase = 'ready';
			},
			() => {
				if (current) countsPhase = 'ready';
			}
		);
		return () => {
			current = false;
		};
	});

	$effect(() => {
		const id = expertId;
		settings = null;
		if (!id) return;
		let current = true;
		getEmailSettings(id).then(
			(loaded) => {
				if (current) settings = loaded;
			},
			() => {}
		);
		return () => {
			current = false;
		};
	});

	let step = $state<Step>(1);
	let segment = $state<SegmentKey>('hot');
	let subject = $state('');
	let html = $state('');
	let preview = $state<'desktop' | 'mobile'>('desktop');
	let when = $state<'now' | 'later'>('now');
	let scheduledAt = $state('');
	let error = $state<string>();
	let saving = $state<'draft' | 'send' | null>(null);
	let loadingDraft = $state(false);
	const campaignId = $derived(page.url.searchParams.get('id'));

	$effect(() => {
		const id = campaignId;
		const owner = expertId;
		if (!id || !owner) return;
		let current = true;
		loadingDraft = true;
		getCampaign(owner, id).then(
			(campaign) => {
				if (!current) return;
				subject = campaign.subject;
				html = campaign.bodyHtml ?? '';
				segment = segmentFromBands(campaign.bands);
				if (campaign.scheduledAt && campaign.status === 'scheduled') {
					when = 'later';
					scheduledAt = toLocalInput(new Date(campaign.scheduledAt));
				}
				loadingDraft = false;
			},
			(failure: unknown) => {
				if (!current) return;
				error = emailErrorMessage(failure);
				loadingDraft = false;
			}
		);
		return () => {
			current = false;
		};
	});

	function toLocalInput(date: Date): string {
		const pad = (value: number) => String(value).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	const minSchedule = $derived(toLocalInput(new Date()));

	const recipients = $derived(counts[segment]);
	const canSend = $derived(Boolean(settings?.verified));
	const availableToday = $derived(
		settings ? Math.max(0, settings.limits.cap - settings.limits.today) : 0
	);
	const overLimit = $derived(canSend && recipients > availableToday);
	const segmentName = $derived(t(`email.compose.segment.${segment as 'hot' | 'warm' | 'idle'}`));
	const plainText = $derived(html.replace(/<[^>]*>/g, '').trim());
	const rendered = $derived(
		html.replaceAll('{{nome}}', 'Stefani').replaceAll('{{email}}', 'stefani@email.com')
	);
	const renderedSubject = $derived(subject.replaceAll('{{nome}}', 'Stefani'));

	const STEPS: { id: Step; label: 'segment' | 'content' | 'review'; icon: IconName }[] = [
		{ id: 1, label: 'segment', icon: 'users' },
		{ id: 2, label: 'content', icon: 'pencil' },
		{ id: 3, label: 'review', icon: 'send' }
	];

	function goTo(next: Step) {
		error = undefined;
		if (next === 3) {
			if (!subject.trim()) {
				error = t('email.compose.validation.subject');
				step = 2;
				return;
			}
			if (!plainText) {
				error = t('email.compose.validation.content');
				step = 2;
				return;
			}
		}
		step = next;
	}

	async function submit(draft: boolean) {
		if (!expertId) return;
		error = undefined;
		if (draft && !subject.trim()) {
			error = t('email.compose.validation.subject');
			step = 2;
			return;
		}
		saving = draft ? 'draft' : 'send';
		try {
			await saveCampaign(
				expertId,
				{
					name: subject.trim().slice(0, 120),
					subject: subject.trim(),
					bodyHtml: html,
					locale: campaignLocale(),
					bands: SEGMENTS.find((item) => item.key === segment)!.bands,
					scheduledAt: when === 'later' && scheduledAt ? new Date(scheduledAt).toISOString() : null,
					draft
				},
				campaignId ?? undefined
			);
			await goto('/email?tab=campaigns');
		} catch (failure) {
			error = emailErrorMessage(failure);
		} finally {
			saving = null;
		}
	}
</script>

<svelte:head>
	<title>{t('email.compose.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={campaignId ? t('email.compose.editTitle') : t('email.compose.title')}
	back={{ href: '/email', label: t('email.compose.back') }}
>
	{#snippet actions()}
		<Button
			variant="secondary"
			loading={saving === 'draft'}
			disabled={saving !== null || !expertId || loadingDraft}
			onclick={() => submit(true)}
		>
			{t('email.compose.actions.saveDraft')}
		</Button>
	{/snippet}
</PageHeader>

<Stepper
	steps={STEPS.map((item) => ({
		id: item.id,
		title: t(`email.compose.steps.${item.label}`),
		hint: t(`email.compose.stepHints.${item.label}`),
		label: t('email.compose.stepLabel', { n: item.id }),
		icon: item.icon
	}))}
	current={step}
	ariaLabel={t('email.compose.stepsAria')}
	onselect={(id) => goTo(id as Step)}
/>

{#if error}<div class="mb-4"><Alert>{error}</Alert></div>{/if}

{#key step}
	<div class="animate-fade-in">
		{#if step === 1}
			<Card
				title={t('email.compose.segment.title')}
				description={t('email.compose.segment.description')}
			>
				<div
					role="radiogroup"
					aria-label={t('email.compose.segment.title')}
					class="grid grid-cols-3 gap-4 max-[761px]:grid-cols-1"
				>
					{#each SEGMENTS as item (item.key)}
						<button
							type="button"
							role="radio"
							aria-checked={segment === item.key}
							class={[
								'cursor-pointer rounded-lg border p-5 text-left focus-visible:shadow-focus',
								'[transition:border-color_0.15s,background_0.15s]',
								segment === item.key
									? 'border-primary bg-primary/10'
									: 'border-border bg-surface hover:border-border-strong'
							]}
							onclick={() => (segment = item.key)}
						>
							<Chip tone={item.chip}
								>{t(`email.compose.segment.${item.key as 'hot' | 'warm' | 'idle'}`)}</Chip
							>
							<p class="mt-3 text-[28px] font-extrabold tracking-[-0.03em] tabular-nums">
								{countsPhase === 'loading' ? '…' : formatNumber(counts[item.key])}
							</p>
							<p class="text-[13px] text-fg-muted">
								{t(`email.compose.segment.${item.key as 'hot' | 'warm' | 'idle'}Hint`)}
							</p>
						</button>
					{/each}
				</div>
				<div
					class="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-md bg-surface px-4 py-3.5 text-[14px]"
				>
					<span>
						<strong
							>{t('email.compose.segment.recipients', { count: formatNumber(recipients) })}</strong
						>
					</span>
					{#if countsPhase === 'select'}
						<span class="text-fg-muted">{t('leads.heat.overview.selectExpert')}</span>
					{:else if canSend}
						<span class={overLimit ? 'font-semibold text-warning' : 'font-semibold text-success'}>
							{overLimit
								? t('email.compose.segment.overLimit')
								: t('email.compose.segment.withinLimit')}
						</span>
					{/if}
				</div>
				<div class="mt-6 flex justify-end">
					<Button onclick={() => goTo(2)}>{t('email.compose.actions.next')}</Button>
				</div>
			</Card>
		{:else if step === 2}
			<div class="grid grid-cols-[minmax(0,1fr)_28rem] items-start gap-5 max-xl:grid-cols-1">
				<div class="grid gap-4">
					<Card>
						<div class="grid gap-4">
							<TextField
								id="email-subject"
								label={t('email.compose.subject')}
								placeholder={t('email.compose.subjectPlaceholder')}
								bind:value={subject}
							/>
						</div>
					</Card>
					<div>
						<p class="mb-2 text-[13px] font-semibold text-fg-muted">{t('email.compose.message')}</p>
						<EmailEditor bind:value={html} placeholder={t('email.compose.editorPlaceholder')} />
					</div>
					<div class="flex justify-between">
						<Button variant="secondary" onclick={() => goTo(1)}
							>{t('email.compose.actions.back')}</Button
						>
						<Button onclick={() => goTo(3)}>{t('email.compose.actions.next')}</Button>
					</div>
				</div>

				<aside
					class="sticky top-28 rounded-lg border border-border bg-bg-elevated p-5 max-xl:static"
					aria-label={t('email.compose.preview.title')}
				>
					<div class="flex items-center justify-between gap-3">
						<h2 class="text-[15px] font-bold">{t('email.compose.preview.title')}</h2>
						<div class="flex gap-1.5" role="group">
							{#each ['desktop', 'mobile'] as const as mode (mode)}
								<button
									type="button"
									class={[
										'cursor-pointer rounded-full px-3 py-1 text-[12.5px] font-semibold',
										preview === mode
											? 'bg-primary/20 text-primary-hover'
											: 'bg-white/7 text-fg-muted'
									]}
									aria-pressed={preview === mode}
									onclick={() => (preview = mode)}
								>
									{t(`email.compose.preview.${mode}`)}
								</button>
							{/each}
						</div>
					</div>
					<div class="mt-4 rounded-md bg-[#f4f3f8] p-4 text-[#14121f]">
						<p class="text-[12px] text-[#7b768a]">
							{t('email.compose.preview.from')}: {settings?.senderName || '—'} &lt;{settings?.senderLocal &&
							settings?.domain
								? `${settings.senderLocal}@${settings.domain}`
								: '—'}&gt;<br />
							{t('email.compose.preview.subject')}:
							<b class="text-[#14121f]">{renderedSubject || '—'}</b>
						</p>
						<div
							class={[
								'mx-auto mt-3 rounded-md bg-white p-5 text-[14px] leading-relaxed',
								preview === 'mobile' && 'max-w-[320px]'
							]}
						>
							<!-- eslint-disable-next-line svelte/no-at-html-tags -->
							<div class="email-preview">{@html rendered || ''}</div>
							<p class="mt-5 border-t border-[#eee] pt-3 text-[11.5px] text-[#9a95a8]">
								{t('email.compose.preview.footer', { expert: settings?.senderName || '—' })}<br />
								<u>{t('email.compose.preview.unsubscribe')}</u>
							</p>
						</div>
					</div>
				</aside>
			</div>
		{:else}
			<Card title={t('email.compose.review.title')}>
				<dl class="grid gap-3.5 text-[14px]">
					<div class="flex justify-between gap-4 border-b border-border pb-3">
						<dt class="text-fg-muted">{t('email.compose.review.segment')}</dt>
						<dd class="font-semibold">{segmentName}</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-border pb-3">
						<dt class="text-fg-muted">{t('email.compose.review.recipients')}</dt>
						<dd class="font-semibold tabular-nums">{formatNumber(recipients)}</dd>
					</div>
					<div class="flex justify-between gap-4 border-b border-border pb-3">
						<dt class="text-fg-muted">{t('email.compose.review.sender')}</dt>
						<dd class="font-semibold">
							{settings?.senderName || '—'} &lt;{settings?.senderLocal && settings?.domain
								? `${settings.senderLocal}@${settings.domain}`
								: '—'}&gt;
						</dd>
					</div>
					<div class="flex justify-between gap-4 pb-1">
						<dt class="text-fg-muted">{t('email.compose.review.subject')}</dt>
						<dd class="font-semibold">{renderedSubject}</dd>
					</div>
				</dl>
				<fieldset class="mt-6">
					<legend class="mb-3 text-[14px] font-bold">{t('email.compose.review.when')}</legend>
					<div class="flex flex-wrap items-center gap-3">
						{#each ['now', 'later'] as const as option (option)}
							<label
								class={[
									'inline-flex cursor-pointer items-center gap-2.5 rounded-md border px-4 py-2.5 text-[14px] font-semibold',
									when === option ? 'border-primary bg-primary/10' : 'border-border bg-surface'
								]}
							>
								<input
									class="accent-[#7c5cff]"
									type="radio"
									name="when"
									value={option}
									bind:group={when}
								/>
								{t(`email.compose.review.${option}`)}
							</label>
						{/each}
						{#if when === 'later'}
							<input
								class="h-10.5 rounded-md border border-border bg-surface px-3 text-[14px] text-fg outline-none focus:border-primary focus:shadow-focus"
								type="datetime-local"
								min={minSchedule}
								bind:value={scheduledAt}
								aria-label={t('email.compose.review.later')}
							/>
						{/if}
					</div>
				</fieldset>
				{#if !canSend}
					<div class="mt-5"><Alert>{t('email.compose.review.needsDomain')}</Alert></div>
				{/if}
				<div class="mt-6 flex justify-between">
					<Button variant="secondary" onclick={() => goTo(2)}
						>{t('email.compose.actions.back')}</Button
					>
					<Button
						loading={saving === 'send'}
						disabled={!canSend ||
							!expertId ||
							saving !== null ||
							(when === 'later' && !scheduledAt)}
						onclick={() => submit(false)}
					>
						{when === 'later'
							? t('email.compose.actions.schedule')
							: t('email.compose.actions.send')}
					</Button>
				</div>
			</Card>
		{/if}
	</div>
{/key}

<style>
	:global(.email-preview p) {
		margin: 0 0 12px;
	}
	:global(.email-preview h1),
	:global(.email-preview h2),
	:global(.email-preview h3) {
		margin: 0 0 12px;
		font-weight: 700;
	}
	:global(.email-preview ul) {
		margin: 0 0 12px;
		padding-left: 22px;
		list-style: disc;
	}
	:global(.email-preview ol) {
		margin: 0 0 12px;
		padding-left: 22px;
		list-style: decimal;
	}
	:global(.email-preview a) {
		color: #6a43f0;
	}
	:global(.email-preview img) {
		max-width: 100%;
		height: auto;
	}
</style>
