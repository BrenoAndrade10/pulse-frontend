<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import MediaPreview from '#lib/components/instagram/MediaPreview.svelte';
	import CommentAutomationDialog from '#lib/components/reels/CommentAutomationDialog.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { mediaFeedFor } from '#lib/instagram/mediaFeedRegistry.js';
	import type { CommentAutomation, InstagramPost } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
	import {
		DM_FILTER_OPTIONS,
		KIND_FILTER_OPTIONS,
		matchesDmFilter,
		matchesKind,
		matchesQuery,
		MEDIA_SORT_OPTIONS,
		sortMedia,
		type DmFilter,
		type KindFilter,
		type MediaSort
	} from '#lib/utils/mediaSearch.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const feed = $derived(data.expert && !data.connectionError ? mediaFeedFor(data.expert.id) : null);

	const automations = new SvelteMap<string, CommentAutomation>();
	let automationsStatus = $state<'loading' | 'ready' | 'error'>('loading');
	let automationsExpertId: string | null = null;

	// Ao voltar para a tela, as regras atuais ficam visíveis até as novas chegarem.
	$effect(() => {
		const request = data.automations;
		const expertId = data.expert?.id ?? null;

		untrack(() => {
			if (expertId !== automationsExpertId) {
				automations.clear();
				automationsStatus = 'loading';
				automationsExpertId = expertId;
			}
		});

		void request.then((list) => {
			if (request !== data.automations) return;
			untrack(() => {
				if (!list) {
					if (automationsStatus !== 'ready') automationsStatus = 'error';
					return;
				}
				automations.clear();
				for (const automation of list) automations.set(automation.mediaId, automation);
				automationsStatus = 'ready';
			});
		});
	});

	const activeAutomations = $derived(
		[...automations.values()].filter((automation) => automation.isActive).length
	);

	let query = $state('');
	let kindFilter = $state<KindFilter>('all');
	let dmFilter = $state<DmFilter>('all');
	let sort = $state<MediaSort>('recent');
	let editingPost = $state<InstagramPost | null>(null);

	const filtering = $derived(query.trim() !== '' || kindFilter !== 'all' || dmFilter !== 'all');
	const needsEverything = $derived(filtering || sort !== 'recent');
	const visiblePosts = $derived(
		sortMedia(
			(feed?.items ?? []).filter(
				(post) =>
					matchesQuery(post, query) &&
					matchesKind(post, kindFilter) &&
					matchesDmFilter(automations.get(post.id), dmFilter)
			),
			sort
		)
	);

	$effect(() => {
		if (!feed || !needsEverything || !feed.hasMore || feed.working || feed.scanStopped) return;

		const timer = setTimeout(() => feed.scanAll(), 350);
		return () => clearTimeout(timer);
	});

	let sentinel = $state<HTMLElement>();
	let sentinelVisible = $state(false);

	$effect(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => (sentinelVisible = entry.isIntersecting),
			{ rootMargin: '800px 0px' }
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});

	$effect(() => {
		if (
			sentinelVisible &&
			feed?.status === 'ready' &&
			feed.hasMore &&
			!feed.working &&
			!feed.paginationError
		) {
			const current = feed;
			if (!needsEverything) untrack(() => current.loadMore());
		}
	});

	type ErrorContent = {
		title: string;
		description: string;
		action: 'connect' | 'reconnect' | 'retry';
	};

	const errorContent: Record<string, ErrorContent> = {
		INSTAGRAM_NOT_CONNECTED: {
			title: 'Instagram não conectado',
			description: 'Conecte a conta profissional deste expert para ver as publicações.',
			action: 'connect'
		},
		INSTAGRAM_ACCESS_TOKEN_EXPIRED: {
			title: 'Conexão expirada',
			description: 'Reconecte o Instagram deste expert para continuar importando as publicações.',
			action: 'reconnect'
		},
		INSTAGRAM_ACCESS_TOKEN_INVALID: {
			title: 'Acesso ao Instagram recusado',
			description:
				'A Meta não aceitou mais a autorização desta conta. Reconecte o Instagram do expert.',
			action: 'reconnect'
		},
		INSTAGRAM_GRAPH_API_ERROR: {
			title: 'O Instagram não respondeu',
			description: 'A conta continua conectada. Tente novamente em alguns instantes.',
			action: 'retry'
		},
		INSTAGRAM_GRAPH_API_UNAVAILABLE: {
			title: 'O Instagram não respondeu',
			description: 'A conta continua conectada. Tente novamente em alguns instantes.',
			action: 'retry'
		},
		UNEXPECTED_ERROR: {
			title: 'Não foi possível carregar as publicações',
			description: 'Tente novamente em alguns instantes.',
			action: 'retry'
		}
	};

	const loadError = $derived(
		data.connectionError ?? (feed?.status === 'error' ? feed.error : null)
	);
	const currentError = $derived(
		loadError ? (errorContent[loadError] ?? errorContent.UNEXPECTED_ERROR) : null
	);

	const plural = (count: number, one: string, many: string) =>
		count === 1 ? `1 ${one}` : `${count} ${many}`;

	function clearFilters() {
		query = '';
		kindFilter = 'all';
		dmFilter = 'all';
	}
</script>

<svelte:head>
	<title>Publicações · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="Publicações"
	description={data.expert
		? `Fotos, carrosséis, vídeos e Reels do Instagram de ${data.expert.name}.`
		: 'Conteúdos publicados pelas contas conectadas.'}
>
	{#snippet actions()}
		<a class={buttonClass({ variant: 'secondary' })} href="/integrations#instagram">
			<Icon name="instagram" size={16} />Configurar Instagram
		</a>
	{/snippet}
</PageHeader>

{#snippet skeletonCard()}
	<div class="flex flex-col border border-border bg-bg-elevated" aria-hidden="true">
		<div class="aspect-[4/5] bg-surface motion-safe:animate-pulse"></div>
		<div class="flex flex-1 flex-col p-3.5">
			<div class="flex min-h-10 flex-col justify-center gap-2">
				<span class="h-3 w-full rounded bg-surface motion-safe:animate-pulse"></span>
				<span class="h-3 w-3/5 rounded bg-surface motion-safe:animate-pulse"></span>
			</div>
			<span class="mt-3 h-3 w-2/5 rounded bg-surface motion-safe:animate-pulse"></span>
			<div class="mt-auto pt-3">
				<div class="flex min-h-11 items-center gap-2 border-t border-border pt-3">
					<span class="h-4 w-20 rounded bg-surface motion-safe:animate-pulse"></span>
					<span class="ml-auto h-8 w-24 rounded-md bg-surface motion-safe:animate-pulse"></span>
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#if !data.expert}
	<Card>
		<EmptyState
			icon="users"
			title="Nenhum expert cadastrado"
			description="Cadastre um expert antes de conectar uma conta do Instagram."
		>
			{#snippet action()}
				<a class={buttonClass()} href="/experts/new">Cadastrar expert</a>
			{/snippet}
		</EmptyState>
	</Card>
{:else if currentError}
	<Card>
		<EmptyState icon="instagram" title={currentError.title} description={currentError.description}>
			{#snippet action()}
				{#if currentError.action === 'retry'}
					<Button loading={feed?.status === 'loading'} onclick={() => feed?.retry()}>
						Tentar novamente
					</Button>
				{:else}
					<a class={buttonClass()} href="/experts/{data.expert.id}#instagram">
						{currentError.action === 'reconnect' ? 'Reconectar Instagram' : 'Conectar Instagram'}
					</a>
				{/if}
			{/snippet}
		</EmptyState>
	</Card>
{:else if feed?.status === 'ready' && feed.items.length === 0 && !feed.hasMore}
	<Card>
		<EmptyState
			icon="image"
			title="Nenhuma publicação ainda"
			description="As publicações desta conta do Instagram aparecerão aqui."
		/>
	</Card>
{:else if feed}
	{#if automationsStatus === 'error'}
		<div class="mb-4">
			<Alert>
				Não foi possível carregar as DMs automáticas. As publicações aparecem normalmente; atualize
				a página para configurar as DMs.
			</Alert>
		</div>
	{/if}

	<div class="mb-3 flex flex-wrap items-center gap-3" role="search">
		<div
			class={[
				'relative flex min-w-64 flex-1 items-center rounded-md border border-border bg-surface',
				'focus-within:border-primary focus-within:bg-surface-hover focus-within:shadow-focus',
				'[transition:border-color_0.15s,box-shadow_0.15s] hover:not-focus-within:border-border-strong'
			]}
		>
			<span class="pointer-events-none pl-3.5 text-fg-subtle" aria-hidden="true">
				<Icon name="search" size={16} />
			</span>
			<label class="sr-only" for="media-search">Buscar publicações</label>
			<input
				class="h-10.5 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
				id="media-search"
				type="search"
				bind:value={query}
				placeholder="Buscar pela legenda ou colar o link da publicação"
				autocomplete="off"
			/>
			{#if query}
				<button
					class="mr-1.5 grid size-7.5 place-items-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg"
					type="button"
					aria-label="Limpar busca"
					onclick={() => (query = '')}
				>
					<Icon name="x" size={15} />
				</button>
			{/if}
		</div>
		<div class="w-44 max-[621px]:w-[calc(50%-6px)]">
			<Select
				id="media-kind-filter"
				aria-label="Filtrar por tipo"
				bind:value={kindFilter}
				options={KIND_FILTER_OPTIONS}
			/>
		</div>
		<div class="w-48 max-[621px]:w-[calc(50%-6px)]">
			<Select
				id="media-dm-filter"
				aria-label="Filtrar por DM automática"
				bind:value={dmFilter}
				options={DM_FILTER_OPTIONS}
				disabled={automationsStatus !== 'ready'}
			/>
		</div>
		<div class="w-44 max-[621px]:w-full">
			<Select
				id="media-sort"
				aria-label="Ordenar publicações"
				bind:value={sort}
				options={MEDIA_SORT_OPTIONS}
			/>
		</div>
	</div>

	<div
		class="mb-4 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-fg-muted"
		aria-live="polite"
	>
		{#if feed.status === 'loading'}
			<span class="h-3.5 w-56 rounded bg-surface motion-safe:animate-pulse" aria-hidden="true"
			></span>
			<span class="sr-only">Carregando publicações</span>
		{:else if feed.scanning}
			<span
				class="size-3.5 rounded-full border-2 border-fg-subtle border-t-transparent motion-safe:animate-spin"
				aria-hidden="true"
			></span>
			Buscando em todas as publicações… {feed.items.length} carregadas até agora.
		{:else if needsEverything}
			<span>
				{plural(visiblePosts.length, 'publicação encontrada', 'publicações encontradas')}
				{feed.hasMore ? `nas ${feed.items.length} mais recentes` : `de ${feed.items.length}`}.
			</span>
			{#if feed.hasMore && feed.scanStopped}
				<button
					class="font-semibold text-primary-hover hover:underline"
					type="button"
					onclick={() => feed.continueScan()}
				>
					Buscar nas mais antigas
				</button>
			{/if}
		{:else if automationsStatus === 'ready'}
			<Icon name="message-circle" size={15} />
			{#if activeAutomations === 0}
				Escolha uma publicação e configure a palavra-chave que dispara a DM automática.
			{:else}
				{plural(
					activeAutomations,
					'publicação com DM automática ativa.',
					'publicações com DM automática ativa.'
				)}
			{/if}
		{/if}
	</div>

	{#if feed.status === 'ready' && visiblePosts.length === 0 && !feed.scanning && !feed.working}
		<div class="motion-safe:animate-fade-in">
			<Card>
				<EmptyState
					icon="search"
					title="Nenhuma publicação encontrada"
					description="Tente outras palavras da legenda, cole o link da publicação ou mude os filtros."
				>
					{#snippet action()}
						{#if filtering}
							<Button variant="secondary" onclick={clearFilters}>Limpar filtros</Button>
						{/if}
					{/snippet}
				</EmptyState>
			</Card>
		</div>
	{/if}

	<div
		class="grid grid-cols-4 gap-4 max-[1100px]:grid-cols-3 max-[761px]:grid-cols-2 max-[481px]:grid-cols-1"
		aria-busy={feed.status === 'loading' || feed.loadingMore}
	>
		{#each visiblePosts as post, index (post.id)}
			{@const automation = automations.get(post.id)}
			<article
				class="flex flex-col overflow-hidden border border-border bg-bg-elevated motion-safe:animate-fade-in"
				style:animation-delay="{(index % 12) * 25}ms"
			>
				<MediaPreview {post} />
				<div class="flex flex-1 flex-col p-3.5">
					<p class="line-clamp-2 min-h-10 text-[13px] leading-5 text-fg-muted">
						{post.caption ?? 'Sem legenda'}
					</p>
					<div class="mt-3 flex items-center justify-between gap-3 text-[12px] text-fg-subtle">
						<span>{post.timestamp ? formatDate(post.timestamp) : 'Data indisponível'}</span>
						<span class="flex gap-3 tabular-nums">
							<span title="Curtidas">{post.likeCount ?? 0} curtidas</span>
							<span title="Comentários">{post.commentsCount ?? 0} comentários</span>
						</span>
					</div>
					<div class="mt-auto pt-3">
						<div class="flex min-h-11 items-center gap-2 border-t border-border pt-3">
							<div class="min-w-0 flex-1">
								{#if automationsStatus === 'loading'}
									<span
										class="block h-4 w-20 rounded bg-surface motion-safe:animate-pulse"
										aria-hidden="true"
									></span>
								{:else if automation}
									<Badge variant={automation.isActive ? 'success' : 'neutral'}>
										{automation.isActive ? 'DM ativa' : 'DM pausada'}
									</Badge>
									<p
										class="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-fg-subtle"
										title={automation.keywords.join(', ')}
									>
										<span class="truncate">{automation.keywords.join(', ')}</span>
										{#if automation.button}
											<span class="shrink-0" title="DM com botão">
												<Icon name="link" size={12} />
												<span class="sr-only">com botão</span>
											</span>
										{/if}
										{#if automation.commentReply}
											<span class="shrink-0" title="Responde o comentário">
												<Icon name="message-circle" size={12} />
												<span class="sr-only">responde o comentário</span>
											</span>
										{/if}
									</p>
								{:else}
									<span class="text-[12px] text-fg-subtle">Sem DM automática</span>
								{/if}
							</div>
							<Button
								variant="secondary"
								size="sm"
								disabled={automationsStatus !== 'ready'}
								aria-label={automation ? 'Editar DM automática' : 'Configurar DM automática'}
								onclick={() => (editingPost = post)}
							>
								{automation ? 'Editar' : 'Configurar DM'}
							</Button>
						</div>
					</div>
				</div>
			</article>
		{/each}

		{#if feed.status === 'loading' || feed.loadingMore}
			{#each { length: feed.status === 'loading' ? 8 : 4 }, index (index)}
				{@render skeletonCard()}
			{/each}
		{/if}
	</div>

	{#if feed.paginationError}
		<p class="mt-5 text-center text-[13px] text-danger">{feed.paginationError}</p>
	{/if}

	<div class="mt-6 flex min-h-10 justify-center" bind:this={sentinel}>
		{#if feed.status === 'ready' && feed.hasMore && !needsEverything && !feed.loadingMore}
			<Button variant="ghost" size="sm" disabled={feed.working} onclick={() => feed.loadMore()}>
				Carregar mais
			</Button>
		{/if}
	</div>
{/if}

{#if editingPost && data.expert}
	<CommentAutomationDialog
		expertId={data.expert.id}
		post={editingPost}
		automation={automations.get(editingPost.id) ?? null}
		onsaved={(automation) => automations.set(automation.mediaId, automation)}
		ondeleted={(mediaId) => automations.delete(mediaId)}
		onclose={() => (editingPost = null)}
	/>
{/if}
