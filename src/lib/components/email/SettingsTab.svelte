<script lang="ts">
	import { page } from '$app/state';
	import Alert from '#lib/components/ui/Alert.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Chip from '#lib/components/email/Chip.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import {
		getEmailSettings,
		saveDomain,
		saveSender,
		sendTestEmail,
		verifyDomain,
		type EmailSettings
	} from '#lib/services/email.js';
	import { emailErrorMessage } from '#lib/utils/emailErrors.js';
	import { formatNumber, formatPercent } from '#lib/utils/format.js';

	const expertId = $derived<string | null>(page.data.selectedExpertId ?? null);

	let settings = $state<EmailSettings | null>(null);
	let domainInput = $state('');
	let senderName = $state('');
	let senderLocal = $state('');
	let replyTo = $state('');
	let verifying = $state(false);
	let saving = $state(false);
	let testing = $state(false);
	let loadFailed = $state(false);
	let notice = $state<string>();
	let problem = $state<string>();
	let copiedKey = $state<string | null>(null);

	function fill(loaded: EmailSettings) {
		settings = loaded;
		domainInput = loaded.domain;
		senderName = loaded.senderName;
		senderLocal = loaded.senderLocal;
		replyTo = loaded.replyTo;
	}

	$effect(() => {
		const id = expertId;
		settings = null;
		loadFailed = false;
		notice = undefined;
		problem = undefined;
		if (!id) return;
		let current = true;
		getEmailSettings(id).then(
			(loaded) => {
				if (current) fill(loaded);
			},
			() => {
				if (current) loadFailed = true;
			}
		);
		return () => {
			current = false;
		};
	});

	async function verify() {
		if (!expertId || !settings) return;
		verifying = true;
		notice = undefined;
		problem = undefined;
		try {
			const typed = domainInput.trim().toLowerCase();
			if (typed !== settings.domain) {
				fill(await saveDomain(expertId, typed));
			}
			fill(await verifyDomain(expertId));
		} catch (error) {
			problem = emailErrorMessage(error);
		} finally {
			verifying = false;
		}
	}

	async function save() {
		if (!expertId) return;
		saving = true;
		notice = undefined;
		problem = undefined;
		try {
			fill(await saveSender(expertId, { senderName, senderLocal, replyTo }));
			notice = t('email.settings.sender.saved');
		} catch (error) {
			problem = emailErrorMessage(error);
		} finally {
			saving = false;
		}
	}

	async function test() {
		if (!expertId) return;
		testing = true;
		notice = undefined;
		problem = undefined;
		try {
			await sendTestEmail(expertId, replyTo.trim());
			notice = t('email.settings.sender.testSent', { email: replyTo.trim() });
		} catch (error) {
			problem = emailErrorMessage(error);
		} finally {
			testing = false;
		}
	}

	async function copy(key: string, value: string) {
		try {
			await navigator.clipboard.writeText(value);
			copiedKey = key;
			setTimeout(() => (copiedKey = null), 1600);
		} catch {
			copiedKey = null;
		}
	}

	const recordTone = { ok: 'ok', pending: 'warn', recommended: 'neutral' } as const;
	const head = 'px-3 py-3 text-left text-[13px] font-semibold text-fg-muted';
</script>

{#if !expertId}
	<Card><EmptyState icon="mail" title={t('leads.heat.overview.selectExpert')} /></Card>
{:else if loadFailed}
	<Card><EmptyState icon="mail" title={t('email.settings.errors.load')} /></Card>
{:else if !settings}
	<div class="h-96 rounded-lg border border-border bg-bg-elevated motion-safe:animate-pulse"></div>
{:else}
	{#if problem}<div class="mb-4"><Alert>{problem}</Alert></div>{/if}
	<div class="grid grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start gap-4 max-xl:grid-cols-1">
		<div class="grid gap-4">
			<Card
				title={t('email.settings.domain.title')}
				description={t('email.settings.domain.description')}
			>
				{#snippet actions()}
					<Chip tone={settings!.verified ? 'ok' : settings!.domain ? 'warn' : 'neutral'}>
						{settings!.verified
							? t('email.settings.domain.status.verified')
							: settings!.domain
								? t('email.settings.domain.status.pending')
								: t('email.settings.domain.status.none')}
					</Chip>
				{/snippet}
				<div class="flex flex-wrap items-end gap-3">
					<div class="min-w-64 flex-1">
						<TextField
							id="email-domain"
							label={t('email.settings.domain.label')}
							placeholder={t('email.settings.domain.placeholder')}
							bind:value={domainInput}
						/>
					</div>
					<Button
						variant="secondary"
						loading={verifying}
						disabled={!domainInput.trim()}
						onclick={verify}
					>
						<Icon name="check" size={16} />
						{verifying ? t('email.settings.domain.verifying') : t('email.settings.domain.verify')}
					</Button>
				</div>
				{#if settings.records.length === 0}
					<p class="mt-5 text-[13.5px] text-fg-muted">{t('email.settings.records.empty')}</p>
				{:else}
					<div class="mt-5 overflow-x-auto">
						<table class="w-full border-collapse text-[13.5px]">
							<thead>
								<tr class="border-b border-border">
									<th class={head}>{t('email.settings.records.type')}</th>
									<th class={head}>{t('email.settings.records.name')}</th>
									<th class={head}>{t('email.settings.records.value')}</th>
									<th class={head}>{t('email.settings.records.status')}</th>
								</tr>
							</thead>
							<tbody>
								{#each settings.records as record, index (index)}
									{@const key = `${record.type}-${record.name}-${index}`}
									<tr class="border-b border-border last:border-b-0">
										<td class="px-3 py-3 font-bold">{record.type}</td>
										<td class="px-3 py-3 font-mono text-[12.5px] text-[#cfc8ff]">{record.name}</td>
										<td class="px-3 py-3">
											<button
												type="button"
												class="inline-flex max-w-48 cursor-pointer items-center gap-2 text-left font-mono text-[12.5px] text-[#cfc8ff] hover:text-fg focus-visible:shadow-focus"
												aria-label={`${t('email.settings.records.copy')}: ${record.value}`}
												onclick={() => copy(key, record.value)}
											>
												<span class="truncate">{record.value}</span>
												<Icon
													name={copiedKey === key ? 'check' : 'copy'}
													size={14}
													class="shrink-0"
												/>
											</button>
											{#if copiedKey === key}
												<span class="sr-only" role="status"
													>{t('email.settings.records.copied')}</span
												>
											{/if}
										</td>
										<td class="px-3 py-3">
											<Chip tone={recordTone[record.state]}
												>{t(`email.settings.records.${record.state}`)}</Chip
											>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</Card>

			<Card
				title={t('email.settings.sender.title')}
				description={t('email.settings.sender.description')}
			>
				<div class="grid grid-cols-2 gap-4 max-[641px]:grid-cols-1">
					<TextField
						id="sender-name"
						label={t('email.settings.sender.name')}
						bind:value={senderName}
					/>
					<div class="flex flex-col gap-1.5">
						<label class="text-[13px] font-semibold text-fg-muted" for="sender-local">
							{t('email.settings.sender.email')}
						</label>
						<div
							class="flex h-10.5 items-center rounded-md border border-border bg-surface focus-within:border-primary focus-within:shadow-focus"
						>
							<input
								class="h-full min-w-0 flex-1 border-0 bg-transparent pl-3.5 text-[14px] text-fg outline-none focus-visible:shadow-none"
								id="sender-local"
								bind:value={senderLocal}
								autocomplete="off"
							/>
							<span class="pr-3.5 text-[14px] text-fg-subtle"
								>@{settings.domain || t('email.settings.domain.placeholder')}</span
							>
						</div>
					</div>
					<div class="col-span-2 max-[641px]:col-span-1">
						<TextField
							id="sender-reply"
							type="email"
							label={t('email.settings.sender.replyTo')}
							bind:value={replyTo}
						/>
					</div>
				</div>
				<div class="mt-5 flex flex-wrap items-center justify-end gap-3">
					{#if notice}<p class="mr-auto text-[13px] text-success" role="status">{notice}</p>{/if}
					<Button
						variant="secondary"
						loading={testing}
						disabled={!settings.verified}
						onclick={test}
					>
						<Icon name="send" size={15} />{t('email.settings.sender.test')}
					</Button>
					<Button loading={saving} onclick={save}>{t('email.settings.sender.save')}</Button>
				</div>
			</Card>
		</div>

		<div class="grid gap-4">
			<Card
				title={t('email.settings.health.title')}
				description={t('email.settings.health.description')}
			>
				<div class="grid gap-5">
					{#each [{ label: 'bounce', value: settings.health.bounce, limit: settings.health.bounceLimit }, { label: 'complaint', value: settings.health.complaint, limit: settings.health.complaintLimit }] as metric (metric.label)}
						<div>
							<div class="mb-2 flex items-baseline justify-between gap-3 text-[14px]">
								<span>{t(`email.settings.health.${metric.label as 'bounce' | 'complaint'}`)}</span>
								<span>
									<strong class="text-success tabular-nums">{formatPercent(metric.value, 2)}</strong
									>
									<span class="text-[12.5px] text-fg-subtle">
										· {t('email.settings.health.limit', { limit: formatPercent(metric.limit, 2) })}
									</span>
								</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden="true">
								<span
									class="block h-full rounded-full bg-success"
									style:width="{Math.min(100, (metric.value / metric.limit) * 100)}%"
								></span>
							</div>
						</div>
					{/each}
					<div class="flex items-center justify-between text-[14px]">
						<span>{t('email.settings.health.state')}</span>
						<Chip tone={settings.health.active ? 'ok' : 'neutral'}>
							{settings.health.active
								? t('email.settings.health.active')
								: t('email.settings.health.inactive')}
						</Chip>
					</div>
				</div>
			</Card>

			<Card
				title={t('email.settings.limits.title')}
				description={t('email.settings.limits.description')}
			>
				{#if settings.limits.cap === 0}
					<p class="text-[13.5px] text-fg-muted">{t('email.settings.limits.empty')}</p>
				{:else}
					<div class="mb-2 flex items-baseline justify-between text-[14px]">
						<span>{t('email.settings.limits.today')}</span>
						<span>
							<strong class="tabular-nums">{formatNumber(settings.limits.today)}</strong>
							<span class="text-[12.5px] text-fg-subtle">
								{t('email.settings.limits.unit', { limit: formatNumber(settings.limits.cap) })}
							</span>
						</span>
					</div>
					<div class="h-1.5 overflow-hidden rounded-full bg-surface" aria-hidden="true">
						<span
							class="block h-full rounded-full bg-gradient-brand"
							style:width="{(settings.limits.today / settings.limits.cap) * 100}%"
						></span>
					</div>
					<p class="mt-3 text-[13px] text-fg-muted">
						{t('email.settings.limits.warmup', {
							day: settings.limits.day,
							total: settings.limits.totalDays,
							next: formatNumber(settings.limits.nextCap)
						})}
					</p>
				{/if}
			</Card>

			<Card
				title={t('email.settings.suppressions.title')}
				description={t('email.settings.suppressions.description')}
			>
				<ul class="grid gap-2.5 text-[14px]">
					<li class="flex justify-between">
						<span>{t('email.settings.suppressions.unsub')}</span><strong class="tabular-nums"
							>{formatNumber(settings.suppressions.unsubscribed)}</strong
						>
					</li>
					<li class="flex justify-between">
						<span>{t('email.settings.suppressions.bounces')}</span><strong class="tabular-nums"
							>{formatNumber(settings.suppressions.bounced)}</strong
						>
					</li>
					<li class="flex justify-between">
						<span>{t('email.settings.suppressions.complaints')}</span><strong class="tabular-nums"
							>{formatNumber(settings.suppressions.complaints)}</strong
						>
					</li>
				</ul>
				<Button class="mt-4" variant="secondary" fullWidth disabled
					>{t('email.settings.suppressions.view')}</Button
				>
			</Card>
		</div>
	</div>
{/if}
