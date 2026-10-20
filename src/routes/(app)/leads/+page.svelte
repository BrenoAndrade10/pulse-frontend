<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { deleteLead, exportLeads, listLeads } from '#lib/services/leads.js';
	import type { Lead } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
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
		{ value: '', label: 'Todos os lançamentos' },
		...data.launches.map((launch) => ({ value: launch.id, label: launch.name }))
	]);
	const filtering = $derived(Boolean(data.launchId || data.search));

	/** Filtros vão para a URL: compartilhar o link mantém a lista. */
	function applyFilters(next: { launch?: string; q?: string }) {
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
				{ launchId: data.launchId || undefined, search: data.search || undefined },
				nextCursor
			);
			leads.push(...result.data);
			nextCursor = result.nextCursor;
		} catch {
			actionError = 'Não foi possível carregar mais leads. Tente novamente.';
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
			actionError = 'Não foi possível gerar o arquivo. Tente novamente.';
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
			actionError = 'Não foi possível excluir o lead. Tente novamente.';
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
			? 'A captação de leads ainda não foi configurada no servidor.'
			: errorReason === 'VALIDATION_FAILED'
				? 'Busque por um e-mail completo ou por um telefone com DDD.'
				: 'Não foi possível carregar os leads.'
	);

	const cell = 'border-b border-border px-5.5 py-3.5 text-left align-top';
	const head = `${cell} text-[12px] font-semibold tracking-[0.05em] text-fg-subtle uppercase`;
</script>

<svelte:head>
	<title>Leads · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="Leads"
	description={data.expert
		? `Pessoas que se cadastraram nos formulários das páginas de ${data.expert.name}.`
		: 'Pessoas que se cadastraram nos formulários das páginas dos seus experts.'}
>
	{#snippet actions()}
		{#if data.expert}
			<Button
				variant="secondary"
				loading={exporting}
				disabled={status !== 'ready' || total === 0}
				onclick={handleExport}
			>
				<Icon name="download" size={16} />Exportar CSV
			</Button>
		{/if}
	{/snippet}
</PageHeader>

{#if !data.expert}
	<Card>
		<EmptyState
			icon="users"
			title="Nenhum expert cadastrado"
			description="Os leads são organizados por expert. Cadastre um para começar."
		>
			{#snippet action()}
				<a class={buttonClass()} href="/experts/new">Cadastrar expert</a>
			{/snippet}
		</EmptyState>
	</Card>
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
			<label class="sr-only" for="lead-search">Buscar lead</label>
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
					placeholder="E-mail ou telefone completo"
					autocomplete="off"
				/>
				{#if data.search}
					<button
						class="mr-1.5 grid size-7.5 place-items-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg"
						type="button"
						aria-label="Limpar busca"
						onclick={() => {
							search = '';
							applyFilters({ q: '' });
						}}
					>
						<Icon name="x" size={15} />
					</button>
				{/if}
			</div>
			<Button type="submit" variant="secondary">Buscar</Button>
		</form>
		<div class="w-60 max-[621px]:w-full">
			<Select
				id="lead-launch"
				aria-label="Filtrar por lançamento"
				value={data.launchId}
				options={launchOptions}
				onchange={(event) => applyFilters({ launch: event.currentTarget.value })}
			/>
		</div>
	</div>

	<p class="mb-4 min-h-5 text-[13px] text-fg-muted" aria-live="polite">
		{#if status === 'loading'}
			<span class="inline-block h-3.5 w-40 rounded bg-surface motion-safe:animate-pulse"></span>
		{:else if status === 'ready' && total !== null}
			{total === 1 ? '1 lead' : `${total.toLocaleString('pt-BR')} leads`}
			{#if data.launchId}no lançamento {launchNames.get(data.launchId) ?? 'selecionado'}{/if}
			{#if data.search}para "{data.search}"{/if}.
		{/if}
	</p>

	{#if actionError}
		<div class="mb-4"><Alert>{actionError}</Alert></div>
	{/if}

	{#if status === 'error'}
		<Card>
			<EmptyState icon="users" title="Leads indisponíveis" description={errorText}>
				{#snippet action()}
					{#if filtering}
						<a class={buttonClass({ variant: 'secondary' })} href={page.url.pathname}
							>Limpar filtros</a
						>
					{/if}
				{/snippet}
			</EmptyState>
		</Card>
	{:else if status === 'ready' && leads.length === 0}
		<Card>
			<EmptyState
				icon="user-plus"
				title={filtering ? 'Nenhum lead encontrado' : 'Nenhum lead ainda'}
				description={filtering
					? 'Confira o e-mail ou telefone digitado, ou mude o lançamento.'
					: 'Configure um formulário no Rastreamento: cada envio vira um lead aqui.'}
			>
				{#snippet action()}
					{#if filtering}
						<a class={buttonClass({ variant: 'secondary' })} href={page.url.pathname}
							>Limpar filtros</a
						>
					{:else}
						<a class={buttonClass()} href="/tracking">Configurar rastreamento</a>
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
							<th class={head}>Lead</th>
							<th class={head}>Contato</th>
							<th class="{head} max-[901px]:hidden">Lançamentos</th>
							<th class="{head} max-[761px]:hidden">Primeiro cadastro</th>
							<th class="{head} max-[1101px]:hidden">Origem</th>
							<th class={head}><span class="sr-only">Ações</span></th>
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
								<tr class="motion-safe:animate-fade-in [&:last-child>td]:border-b-0">
									<td class={cell}>
										<span class="block font-semibold">{lead.name ?? 'Sem nome'}</span>
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
									<td class="{cell} max-[901px]:hidden">
										<div class="flex flex-wrap gap-1.5">
											{#each lead.launches as launch (launch.launchId)}
												<Badge variant={launch.launchId === data.launchId ? 'success' : 'neutral'}>
													{launchNames.get(launch.launchId) ??
														'Lançamento'}{launch.submissionsCount > 1
														? ` · ${launch.submissionsCount}x`
														: ''}
												</Badge>
											{:else}
												<span class="text-[13px] text-fg-subtle">Sem lançamento</span>
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
											aria-label="Excluir {lead.name ?? lead.email ?? 'lead'}"
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
				<Button variant="secondary" loading={loadingMore} onclick={loadMore}>Carregar mais</Button>
			</div>
		{/if}
	{/if}
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
		Excluir os dados de {removing?.name ?? removing?.email ?? 'este lead'}?
	</h2>
	<p class="mt-2 mb-6 text-fg-muted">
		O lead, os cadastros e as inscrições nos lançamentos são apagados e não podem ser recuperados.
		Use para atender pedidos de exclusão de dados (LGPD).
	</p>
	<div class="flex justify-end gap-2.5">
		<Button variant="ghost" disabled={deleting} onclick={() => dialog?.close()}>Cancelar</Button>
		<Button variant="danger" loading={deleting} onclick={handleDelete}>Excluir</Button>
	</div>
</dialog>
