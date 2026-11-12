<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import SelectExpertState from '#lib/components/app/SelectExpertState.svelte';
	import LeadHeatDialog from '#lib/components/leads/LeadHeatDialog.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { deleteLead, exportLeads, listLeads } from '#lib/services/leads.js';
	import type { Lead } from '#lib/types.js';
	import { formatDate, formatNumber } from '#lib/utils/format.js';
	import { heatVariants } from '#lib/utils/lead-heat.js';
	import { withQuery } from '#lib/utils/query.js';
	import type { LeadsState } from './+page.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let leads = $state<Lead[]>([]);
	let total = $state<number | null>(null);
	let nextCursor = $state<string | null>(null);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let errorReason = $state('');
	let loadingMore = $state(false);
	let exporting = $state(false);
	let actionError = $state<string>();

	$effect(() => {
		const request = data.leads;
		status = 'loading';
		void request.then((result: LeadsState) => {
			if (request !== data.leads) return;
			if (result.status === 'error') {
				status = 'error';
				errorReason = result.reason;
				return;
			}
			leads = result.page.data;
			total = result.page.total;
			nextCursor = result.page.nextCursor;
			status = 'ready';
		});
	});

	// Editável no campo; volta ao valor da URL a cada navegação.
	let search = $derived(data.search);

	const launchNames = $derived(new Map(data.launches.map((launch) => [launch.id, launch.name])));
	const launchOptions = $derived([
		{ value: '', label: t('leads.filter.allLaunches') },
		...data.launches.map((launch) => ({ value: launch.id, label: launch.name }))
	]);
	const heatOptions = $derived([
		{ value: '', label: t('leads.filter.allHeat') },
		...(['hot', 'warm', 'cold'] as const).map((band) => ({
			value: band,
			label: t(`leads.heat.bands.${band}`)
		}))
	]);
	const filtering = $derived(Boolean(data.launchId || data.search || data.heat));

	let heatOpen = $state(false);
	let heatLead = $state<Lead | null>(null);

	function openHeat(lead: Lead) {
		heatLead = lead;
		heatOpen = true;
	}

	/** Filtros vão para a URL: compartilhar o link mantém a lista. */
	function applyFilters(next: { launch?: string; q?: string; heat?: string }) {
		const query = withQuery(page.url.search, next);
		void goto(query || page.url.pathname, { reset: false });
	}

	async function loadMore() {
		if (!data.expert || !nextCursor || loadingMore) return;
		loadingMore = true;
		actionError = undefined;
		try {
			const result = await listLeads(
				data.expert.id,
				{
					launchId: data.launchId || undefined,
					search: data.search || undefined,
					heat: data.heat || undefined
				},
				nextCursor
			);
			leads.push(...result.data);
			nextCursor = result.nextCursor;
		} catch {
			actionError = t('leads.errors.loadMore');
		} finally {
			loadingMore = false;
		}
	}

	async function handleExport() {
		if (!data.expert) return;
		exporting = true;
		actionError = undefined;
		try {
			await exportLeads(data.expert.id, data.launchId || undefined);
		} catch {
			actionError = t('leads.errors.export');
		} finally {
			exporting = false;
		}
	}

	let dialog = $state<HTMLDialogElement>();
	let removing = $state<Lead | null>(null);
	let deleting = $state(false);

	function confirmDelete(lead: Lead) {
		removing = lead;
		dialog?.showModal();
	}

	async function handleDelete() {
		if (!data.expert || !removing) return;
		deleting = true;
		try {
			await deleteLead(data.expert.id, removing.id);
			const id = removing.id;
			leads = leads.filter((lead) => lead.id !== id);
			if (total !== null) total -= 1;
			dialog?.close();
		} catch {
			actionError = t('leads.errors.delete');
			dialog?.close();
		} finally {
			deleting = false;
		}
	}

	/** +5511999998888 → +55 (11) 99999-8888 */
	function formatPhone(phone: string | null): string {
		if (!phone) return '';
		const match = /^\+55(\d{2})(\d{4,5})(\d{4})$/.exec(phone);
		return match ? `+55 (${match[1]}) ${match[2]}-${match[3]}` : phone;
	}

	function origin(lead: Lead): string {
		const launch = data.launchId
			? lead.launches.find((item) => item.launchId === data.launchId)
			: lead.launches[0];
		const utm = launch?.firstUtm;
		return [utm?.source, utm?.campaign].filter(Boolean).join(' · ');
	}

	const errorText = $derived(
		errorReason === 'LEADS_ENCRYPTION_KEY_NOT_CONFIGURED'
			? t('leads.errors.encryptionNotConfigured')
			: errorReason === 'VALIDATION_FAILED'
				? t('leads.errors.validation')
				: t('leads.errors.load')
	);

	const cell = 'border-b border-border px-5.5 py-3.5 text-left align-top';
	const head = `${cell} text-[12px] font-semibold tracking-[0.05em] text-fg-subtle uppercase`;
</script>

<svelte:head>
	<title>{t('leads.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={t('leads.title')}
	description={data.expert
		? t('leads.description', { expert: data.expert.name })
		: t('leads.descriptionAll')}
>
	{#snippet actions()}
		{#if data.expert}
			<Button
				variant="secondary"
				loading={exporting}
				disabled={status !== 'ready' || total === 0}
				onclick={handleExport}
			>
				<Icon name="download" size={16} />{t('leads.exportCsv')}
			</Button>
		{/if}
	{/snippet}
</PageHeader>

{#if !data.expert}
	<SelectExpertState
		hasExperts={data.experts.length > 0}
		subjectKey="leads.selectSubject"
		emptyDescriptionKey="leads.selectEmpty"
	/>
{:else}
	<div class="mb-4 flex flex-wrap items-center gap-3">
		<form
			class="flex min-w-64 flex-1 gap-2"
			role="search"
			onsubmit={(event) => {
				event.preventDefault();
				applyFilters({ q: search.trim() });
			}}
		>
			<label class="sr-only" for="lead-search">{t('leads.search.label')}</label>
			<div
				class="flex min-w-0 flex-1 items-center rounded-md border border-border bg-surface focus-within:border-primary focus-within:shadow-focus"
			>
				<span class="pl-3.5 text-fg-subtle" aria-hidden="true"
					><Icon name="search" size={16} /></span
				>
				<input
					class="h-10.5 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
					id="lead-search"
					type="search"
					bind:value={search}
					placeholder={t('leads.search.placeholder')}
					autocomplete="off"
				/>
				{#if data.search}
					<button
						class="mr-1.5 grid size-7.5 place-items-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg"
						type="button"
						aria-label={t('leads.search.clear')}
						onclick={() => {
							search = '';
							applyFilters({ q: '' });
						}}
					>
						<Icon name="x" size={15} />
					</button>
				{/if}
			</div>
			<Button type="submit" variant="secondary">{t('leads.search.submit')}</Button>
		</form>
		<div class="w-60 max-[621px]:w-full">
			<Select
				id="lead-launch"
				aria-label={t('leads.filter.launchLabel')}
				value={data.launchId}
				options={launchOptions}
				onchange={(event) => applyFilters({ launch: event.currentTarget.value })}
			/>
		</div>
		<div class="w-48 max-[621px]:w-full">
			<Select
				id="lead-heat"
				aria-label={t('leads.filter.heatLabel')}
				value={data.heat}
				options={heatOptions}
				onchange={(event) => applyFilters({ heat: event.currentTarget.value })}
			/>
		</div>
	</div>

	<p class="mb-4 min-h-5 text-[13px] text-fg-muted" aria-live="polite">
		{#if status === 'loading'}
			<span class="inline-block h-3.5 w-40 rounded bg-surface motion-safe:animate-pulse"></span>
		{:else if status === 'ready' && total !== null}
			{t('leads.summary.count', { count: total, formatted: formatNumber(total) })}
			{#if data.launchId}{t('leads.summary.inLaunch', {
					name: launchNames.get(data.launchId) ?? t('leads.summary.selectedLaunch')
				})}{/if}
			{#if data.heat}{t('leads.summary.forHeat', {
					band: t(`leads.heat.bands.${data.heat}`).toLowerCase()
				})}{/if}
			{#if data.search}{t('leads.summary.forSearch', { query: data.search })}{/if}.
		{/if}
	</p>

	{#if actionError}
		<div class="mb-4"><Alert>{actionError}</Alert></div>
	{/if}

	{#if status === 'error'}
		<Card>
			<EmptyState icon="users" title={t('leads.unavailable')} description={errorText}>
				{#snippet action()}
					{#if filtering}
						<a class={buttonClass({ variant: 'secondary' })} href={page.url.pathname}
							>{t('leads.clearFilters')}</a
						>
					{/if}
				{/snippet}
			</EmptyState>
		</Card>
	{:else if status === 'ready' && leads.length === 0}
		<Card>
			<EmptyState
				icon="user-plus"
				title={filtering ? t('leads.empty.notFoundTitle') : t('leads.empty.noneTitle')}
				description={filtering
					? t('leads.empty.notFoundDescription')
					: t('leads.empty.noneDescription')}
			>
				{#snippet action()}
					{#if filtering}
						<a class={buttonClass({ variant: 'secondary' })} href={page.url.pathname}
							>{t('leads.clearFilters')}</a
						>
					{:else}
						<a class={buttonClass()} href="/tracking">{t('leads.empty.configureTracking')}</a>
					{/if}
				{/snippet}
			</EmptyState>
		</Card>
	{:else}
		<Card flush>
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[14px]" aria-busy={status === 'loading'}>
					<thead>
						<tr>
							<th class={head}>{t('leads.table.lead')}</th>
							<th class={head}>{t('leads.table.contact')}</th>
							<th class={head}>{t('leads.table.heat')}</th>
							<th class="{head} max-[901px]:hidden">{t('leads.table.launches')}</th>
							<th class="{head} max-[761px]:hidden">{t('leads.table.firstSignup')}</th>
							<th class="{head} max-[1101px]:hidden">{t('leads.table.origin')}</th>
							<th class={head}><span class="sr-only">{t('leads.table.actions')}</span></th>
						</tr>
					</thead>
					<tbody>
						{#if status === 'loading'}
							{#each { length: 6 }, index (index)}
								<tr aria-hidden="true">
									<td class={cell}
										><span class="block h-4 w-32 rounded bg-surface motion-safe:animate-pulse"
										></span></td
									>
									<td class={cell}
										><span class="block h-4 w-44 rounded bg-surface motion-safe:animate-pulse"
										></span></td
									>
									<td class={cell}
										><span class="block h-6 w-24 rounded-full bg-surface motion-safe:animate-pulse"
										></span></td
									>
									<td class="{cell} max-[901px]:hidden"
										><span class="block h-4 w-28 rounded bg-surface motion-safe:animate-pulse"
										></span></td
									>
									<td class="{cell} max-[761px]:hidden"
										><span class="block h-4 w-24 rounded bg-surface motion-safe:animate-pulse"
										></span></td
									>
									<td class="{cell} max-[1101px]:hidden"
										><span class="block h-4 w-20 rounded bg-surface motion-safe:animate-pulse"
										></span></td
									>
									<td class={cell}></td>
								</tr>
							{/each}
						{:else}
							{#each leads as lead (lead.id)}
								{@const customs = Object.entries(lead.custom)}
								{@const band = lead.heat.band}
								{@const calculated = lead.heat.calculatedAt !== null}
								{@const status = calculated
									? `${t(`leads.heat.bands.${band}`)} · ${formatNumber(lead.heat.score)}`
									: t('leads.heat.notCalculated')}

								<tr class="motion-safe:animate-fade-in [&:last-child>td]:border-b-0">
									<td class={cell}>
										<span class="block font-semibold">{lead.name ?? t('leads.table.noName')}</span>
										{#if customs.length}
											<span
												class="mt-0.5 block max-w-64 truncate text-[12.5px] text-fg-subtle"
												title={customs.map(([k, v]) => `${k}: ${v}`).join(' · ')}
											>
												{customs.map(([key, value]) => `${key}: ${value}`).join(' · ')}
											</span>
										{/if}
									</td>
									<td class={cell}>
										<span class="block break-all">{lead.email ?? ''}</span>
										<span class="block text-[13px] text-fg-muted">{formatPhone(lead.phone)}</span>
									</td>
									<td class={cell}>
										<button
											class="cursor-pointer rounded-[999px] focus-visible:shadow-focus focus-visible:outline-none"
											type="button"
											aria-haspopup="dialog"
											aria-label={t('leads.table.heatAria', {
												name: lead.name ?? lead.email ?? t('leads.table.leadFallback'),
												status
											})}
											onclick={() => openHeat(lead)}
										>
											<Badge variant={calculated ? heatVariants[band] : 'neutral'}>{status}</Badge>
										</button>
									</td>
									<td class="{cell} max-[901px]:hidden">
										<div class="flex flex-wrap gap-1.5">
											{#each lead.launches as launch (launch.launchId)}
												<Badge variant={launch.launchId === data.launchId ? 'success' : 'neutral'}>
													{launchNames.get(launch.launchId) ??
														t('leads.table.launchFallback')}{launch.submissionsCount > 1
														? ` · ${launch.submissionsCount}x`
														: ''}
												</Badge>
											{:else}
												<span class="text-[13px] text-fg-subtle">{t('leads.table.noLaunch')}</span>
											{/each}
										</div>
									</td>
									<td class="{cell} whitespace-nowrap text-fg-muted max-[761px]:hidden">
										{formatDate(lead.firstSeenAt)}
									</td>
									<td class="{cell} text-[13px] text-fg-muted max-[1101px]:hidden"
										>{origin(lead) || '—'}</td
									>
									<td class="{cell} text-right">
										<Button
											variant="ghost"
											size="sm"
											aria-label={t('leads.table.deleteAria', {
												name: lead.name ?? lead.email ?? t('leads.table.leadFallback')
											})}
											onclick={() => confirmDelete(lead)}
										>
											<Icon name="trash" size={15} />
										</Button>
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>
		</Card>

		{#if nextCursor}
			<div class="mt-5 flex justify-center">
				<Button variant="secondary" loading={loadingMore} onclick={loadMore}
					>{t('leads.loadMore')}</Button
				>
			</div>
		{/if}
	{/if}
{/if}

{#if data.expert}
	<LeadHeatDialog bind:open={heatOpen} expertId={data.expert.id} lead={heatLead} />
{/if}

<dialog
	class={[
		'm-auto w-[min(440px,calc(100vw-32px))] p-6',
		'rounded-lg border border-border-strong bg-bg-elevated text-fg',
		'shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]',
		'backdrop:bg-[rgb(5_5_10/0.7)] backdrop:backdrop-blur-[3px]'
	]}
	bind:this={dialog}
	aria-labelledby="delete-lead-title"
>
	<h2 class="text-[18px] font-bold" id="delete-lead-title">
		{t('leads.delete.title', {
			name: removing?.name ?? removing?.email ?? t('leads.delete.thisLead')
		})}
	</h2>
	<p class="mt-2 mb-6 text-fg-muted">
		{t('leads.delete.description')}
	</p>
	<div class="flex justify-end gap-2.5">
		<Button variant="ghost" disabled={deleting} onclick={() => dialog?.close()}
			>{t('common.actions.cancel')}</Button
		>
		<Button variant="danger" loading={deleting} onclick={handleDelete}
			>{t('common.actions.delete')}</Button
		>
	</div>
</dialog>
