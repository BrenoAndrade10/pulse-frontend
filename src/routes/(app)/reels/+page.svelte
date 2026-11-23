<script lang="ts">
	import { tick, untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import SelectExpertState from '#lib/components/app/SelectExpertState.svelte';
	import AutomationPanel from '#lib/components/reels/AutomationPanel.svelte';
	import AutomationPostCard from '#lib/components/reels/AutomationPostCard.svelte';
	import AutomationsTable from '#lib/components/reels/AutomationsTable.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import { mediaFeedFor } from '#lib/instagram/mediaFeedRegistry.js';
	import type { CommentAutomation, InstagramPost } from '#lib/types.js';
	import { automationStatus, type AutomationStatus } from '#lib/utils/commentAutomation.js';
	import {
		KIND_FILTER_OPTIONS,
		matchesKind,
		matchesQuery,
		MEDIA_SORT_OPTIONS,
		sortMedia,
		type KindFilter,
		type MediaSort
	} from '#lib/utils/mediaSearch.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
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

	type Tab = 'posts' | 'automations';
	type StatusFilter = 'all' | AutomationStatus;

	const tab = $derived<Tab>(
		page.url.searchParams.get('tab') === 'automations' ? 'automations' : 'posts'
	);

	function setTab(next: Tab) {
		const url = new URL(page.url.href);
		if (next === 'posts') url.searchParams.delete('tab');
		else url.searchParams.set('tab', next);
		void goto(`${url.pathname}${url.search}`, { replaceState: true, reset: false });
	}

	let query = $state('');
	let statusFilter = $state<StatusFilter>('all');
	let kindFilter = $state<KindFilter>('all');
	let sort = $state<MediaSort>('recent');
	let selectedId = $state<string | null>(null);
	let searchInput = $state<HTMLInputElement>();

	const matchesStatus = (automation: CommentAutomation | undefined) =>
		statusFilter === 'all' || automationStatus(automation) === statusFilter;

	const filtering = $derived(query.trim() !== '' || kindFilter !== 'all' || statusFilter !== 'all');
	const needsEverything = $derived(filtering || sort !== 'recent');
	const visiblePosts = $derived(
		sortMedia(
			(feed?.items ?? []).filter(
				(post) =>
					matchesQuery(post, query) &&
					matchesKind(post, kindFilter) &&
					matchesStatus(automations.get(post.id))
			),
			sort
		)
	);

	const selectedPost = $derived<InstagramPost | null>(
		selectedId
			? (feed?.items.find((post) => post.id === selectedId) ??
					({ id: selectedId } as InstagramPost))
			: null
	);

	const automationRows = $derived.by(() => {
		const normalized = query.trim().toLowerCase();
		return [...automations.values()]
			.map((automation) => ({
				automation,
				post: feed?.items.find((post) => post.id === automation.mediaId) ?? null
			}))
			.filter(
				({ automation, post }) =>
					matchesStatus(automation) &&
					(!normalized ||
						automation.keywords.some((keyword) => keyword.toLowerCase().includes(normalized)) ||
						(post?.caption ?? '').toLowerCase().includes(normalized))
			)
			.toSorted((a, b) => b.automation.updatedAt.localeCompare(a.automation.updatedAt));
	});

	function editAutomation(mediaId: string) {
		selectedId = mediaId;
		setTab('posts');
	}

	function newAutomation() {
		setTab('posts');
		void tick().then(() => searchInput?.focus());
	}

	$effect(() => {
		void tab;
		query = '';
		statusFilter = 'all';
	});

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
		title: MessageKey;
		description: MessageKey;
		action: 'connect' | 'reconnect' | 'retry';
	};

	const errorContent: Record<string, ErrorContent> = {
		INSTAGRAM_NOT_CONNECTED: {
			title: 'reels.errors.notConnected.title',
			description: 'reels.errors.notConnected.description',
			action: 'connect'
		},
		INSTAGRAM_ACCESS_TOKEN_EXPIRED: {
			title: 'reels.errors.expired.title',
			description: 'reels.errors.expired.description',
			action: 'reconnect'
		},
		INSTAGRAM_ACCESS_TOKEN_INVALID: {
			title: 'reels.errors.invalid.title',
			description: 'reels.errors.invalid.description',
			action: 'reconnect'
		},
		INSTAGRAM_GRAPH_API_ERROR: {
			title: 'reels.errors.unavailable.title',
			description: 'reels.errors.unavailable.description',
			action: 'retry'
		},
		INSTAGRAM_GRAPH_API_UNAVAILABLE: {
			title: 'reels.errors.unavailable.title',
			description: 'reels.errors.unavailable.description',
			action: 'retry'
		},
		UNEXPECTED_ERROR: {
			title: 'reels.errors.unexpected.title',
			description: 'reels.errors.unexpected.description',
			action: 'retry'
		}
	};

	const loadError = $derived(
		data.connectionError ?? (feed?.status === 'error' ? feed.error : null)
	);
	const currentError = $derived(
		loadError ? (errorContent[loadError] ?? errorContent.UNEXPECTED_ERROR) : null
	);

	const showPanel = $derived(
		tab === 'posts' && selectedPost !== null && Boolean(data.expert) && !currentError
	);

	const kindOptions = $derived(
		KIND_FILTER_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))
	);
	const statusOptions = $derived(
		(['all', 'none', 'active', 'paused', 'draft'] as const)
			.filter((value) => tab === 'posts' || value !== 'none')
			.map((value) => ({
				value,
				label: value === 'all' ? t('reels.auto.allStatuses') : t(`reels.auto.status.${value}`)
			}))
	);
	const sortOptions = $derived(
		MEDIA_SORT_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))
	);

	function clearFilters() {
		query = '';
		kindFilter = 'all';
		statusFilter = 'all';
	}
</script>

<svelte:head>
	<title>{t('reels.auto.title')} · {APP_NAME}</title>
</svelte:head>

<div class={['grid items-start gap-6', showPanel && 'lg:grid-cols-[minmax(0,1fr)_30rem]']}>
	<div class="min-w-0">
		<PageHeader
			title={t('reels.auto.title')}
			description={tab === 'posts' ? t('reels.auto.postsDescription') : t('reels.auto.description')}
		>
			{#snippet actions()}
				{#if data.expert && !currentError && tab === 'automations'}
					<Button onclick={newAutomation}>
						<Icon name="plus" size={16} />{t('reels.auto.newAutomation')}
					</Button>
				{:else if !data.expert || currentError}
					<a class={buttonClass({ variant: 'secondary' })} href="/integrations#instagram">
						<Icon name="instagram" size={16} />{t('reels.page.configureInstagram')}
					</a>
				{/if}
			{/snippet}
		</PageHeader>

		{#snippet skeletonCard()}
			<div class="rounded-lg border border-border bg-bg-elevated p-2.5" aria-hidden="true">
				<div class="aspect-[4/3.4] rounded-md bg-surface motion-safe:animate-pulse"></div>
				<div class="mt-3 flex flex-col gap-2.5 px-1 pb-1">
					<span class="h-4 w-4/5 rounded bg-surface motion-safe:animate-pulse"></span>
					<span class="h-6 w-28 rounded-full bg-surface motion-safe:animate-pulse"></span>
				</div>
			</div>
		{/snippet}

		{#if !data.expert}
			<SelectExpertState
				hasExperts={data.experts.length > 0}
				subjectKey="reels.selectExpert.subject"
				emptyDescriptionKey="reels.selectExpert.emptyDescription"
			/>
		{:else if currentError}
			<Card>
				<EmptyState
					icon="instagram"
					title={t(currentError.title)}
					description={t(currentError.description)}
				>
					{#snippet action()}
						{#if currentError.action === 'retry'}
							<Button loading={feed?.status === 'loading'} onclick={() => feed?.retry()}>
								{t('common.actions.retry')}
							</Button>
						{:else}
							<a class={buttonClass()} href="/experts/{data.expert.id}#instagram">
								{currentError.action === 'reconnect'
									? t('reels.errors.reconnect')
									: t('reels.errors.connect')}
							</a>
						{/if}
					{/snippet}
				</EmptyState>
			</Card>
		{:else if feed?.status === 'ready' && feed.items.length === 0 && !feed.hasMore}
			<Card>
				<EmptyState
					icon="image"
					title={t('reels.empty.title')}
					description={t('reels.empty.description')}
				/>
			</Card>
		{:else if feed}
			<div
				class="mb-6 flex items-center justify-between gap-3 rounded-lg border border-border bg-bg-elevated px-5 py-3"
			>
				<span class="flex items-center gap-3 text-[14px] font-semibold">
					<Icon name="instagram" size={22} />
					<span class="size-2 rounded-full bg-success" aria-hidden="true"></span>
					{t('reels.auto.accountConnected')}
				</span>
				<a class={buttonClass({ variant: 'secondary', size: 'sm' })} href="/integrations#instagram"
					>{t('reels.auto.manageConnection')}</a
				>
			</div>

			{#if automationsStatus === 'error'}
				<div class="mb-4"><Alert>{t('reels.page.automationsError')}</Alert></div>
			{/if}

			<div
				class="mb-5 flex gap-1 border-b border-border"
				role="tablist"
				aria-label={t('reels.auto.tablist')}
			>
				{#each ['posts', 'automations'] as const as option (option)}
					<button
						type="button"
						role="tab"
						class={[
							'-mb-px cursor-pointer rounded-t-md border-b-2 px-5 py-3 text-[15px] font-semibold',
							'[transition:background_0.15s,color_0.15s,border-color_0.15s] focus-visible:shadow-focus',
							tab === option
								? 'border-primary bg-[rgb(124_92_255/0.16)] text-fg'
								: 'border-transparent text-fg-muted hover:text-fg'
						]}
						aria-selected={tab === option}
						onclick={() => setTab(option)}
					>
						{t(`reels.auto.tabs.${option}`)}
					</button>
				{/each}
			</div>

			<div class="mb-4 flex flex-wrap items-center gap-3" role="search">
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
					<label class="sr-only" for="media-search">{t('reels.search.label')}</label>
					<input
						class="h-11 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
						id="media-search"
						type="search"
						bind:this={searchInput}
						bind:value={query}
						placeholder={tab === 'posts'
							? t('reels.auto.searchPosts')
							: t('reels.auto.searchAutomations')}
						autocomplete="off"
					/>
					{#if query}
						<button
							class="mr-1.5 grid size-7.5 place-items-center rounded-md text-fg-muted hover:bg-surface-hover hover:text-fg"
							type="button"
							aria-label={t('reels.search.clear')}
							onclick={() => (query = '')}
						>
							<Icon name="x" size={15} />
						</button>
					{/if}
				</div>
				<div class="w-48 max-[621px]:w-[calc(50%-6px)]">
					<Select
						id="media-status-filter"
						aria-label={t('reels.auto.statusFilter')}
						bind:value={statusFilter}
						options={statusOptions}
						disabled={automationsStatus !== 'ready'}
					/>
				</div>
				{#if tab === 'posts'}
					<div class="w-40 max-[621px]:w-[calc(50%-6px)]">
						<Select
							id="media-kind-filter"
							aria-label={t('reels.search.kindFilter')}
							bind:value={kindFilter}
							options={kindOptions}
						/>
					</div>
					<div class="w-44 max-[621px]:w-full">
						<Select
							id="media-sort"
							aria-label={t('reels.search.sort')}
							bind:value={sort}
							options={sortOptions}
						/>
					</div>
				{/if}
			</div>

			{#if tab === 'posts'}
				<div
					class="mb-4 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-fg-muted"
					aria-live="polite"
				>
					{#if feed.status === 'loading'}
						<span class="h-3.5 w-56 rounded bg-surface motion-safe:animate-pulse" aria-hidden="true"
						></span>
						<span class="sr-only">{t('reels.status.loading')}</span>
					{:else if feed.scanning}
						<span
							class="size-3.5 rounded-full border-2 border-fg-subtle border-t-transparent motion-safe:animate-spin"
							aria-hidden="true"
						></span>
						{t('reels.status.scanning', { count: feed.items.length })}
					{:else if needsEverything}
						<span>
							{t('reels.status.found', { count: visiblePosts.length })}
							{feed.hasMore
								? t('reels.status.foundInRecent', { count: feed.items.length })
								: t('reels.status.foundInTotal', { count: feed.items.length })}.
						</span>
						{#if feed.hasMore && feed.scanStopped}
							<button
								class="font-semibold text-primary-hover hover:underline"
								type="button"
								onclick={() => feed.continueScan()}
							>
								{t('reels.status.searchOlder')}
							</button>
						{/if}
					{:else if automationsStatus === 'ready'}
						<Icon name="message-circle" size={15} />
						{#if activeAutomations === 0}
							{t('reels.status.chooseOne')}
						{:else}
							{t('reels.status.activeCount', { count: activeAutomations })}
						{/if}
					{/if}
				</div>

				{#if feed.status === 'ready' && visiblePosts.length === 0 && !feed.scanning && !feed.working}
					<div class="motion-safe:animate-fade-in">
						<Card>
							<EmptyState
								icon="search"
								title={t('reels.empty.noResultsTitle')}
								description={t('reels.empty.noResultsDescription')}
							>
								{#snippet action()}
									{#if filtering}
										<Button variant="secondary" onclick={clearFilters}
											>{t('reels.empty.clearFilters')}</Button
										>
									{/if}
								{/snippet}
							</EmptyState>
						</Card>
					</div>
				{/if}

				<div>
					<div
						class={[
							'grid gap-4',
							selectedPost
								? 'grid-cols-2 max-[561px]:grid-cols-1'
								: 'grid-cols-4 max-[1280px]:grid-cols-3 max-[861px]:grid-cols-2 max-[481px]:grid-cols-1'
						]}
						aria-busy={feed.status === 'loading' || feed.loadingMore}
					>
						{#each visiblePosts as post, index (post.id)}
							<div
								class="motion-safe:animate-fade-in"
								style:animation-delay="{(index % 12) * 25}ms"
							>
								<AutomationPostCard
									{post}
									status={automationStatus(automations.get(post.id))}
									selected={selectedId === post.id}
									onselect={() => (selectedId = selectedId === post.id ? null : post.id)}
								/>
							</div>
						{/each}

						{#if feed.status === 'loading' || feed.loadingMore}
							{#each { length: feed.status === 'loading' ? 8 : 4 }, index (index)}
								{@render skeletonCard()}
							{/each}
						{/if}
					</div>
				</div>

				{#if feed.paginationError}
					<p class="mt-5 text-center text-[13px] text-danger">{t(feed.paginationError)}</p>
				{/if}

				<div class="mt-6 flex min-h-10 justify-center" bind:this={sentinel}>
					{#if feed.status === 'ready' && feed.hasMore && !needsEverything && !feed.loadingMore}
						<Button
							variant="ghost"
							size="sm"
							disabled={feed.working}
							onclick={() => feed.loadMore()}
						>
							{t('reels.page.loadMore')}
						</Button>
					{/if}
				</div>
			{:else if automationsStatus === 'loading'}
				<div
					class="h-64 rounded-lg border border-border bg-bg-elevated motion-safe:animate-pulse"
				></div>
			{:else if automationRows.length === 0}
				<Card>
					<EmptyState
						icon="message-circle"
						title={automations.size === 0
							? t('reels.auto.empty.title')
							: t('reels.auto.empty.noResultsTitle')}
						description={automations.size === 0
							? t('reels.auto.empty.description')
							: t('reels.auto.empty.noResultsDescription')}
					>
						{#snippet action()}
							{#if automations.size === 0}
								<Button onclick={newAutomation}>{t('reels.auto.empty.cta')}</Button>
							{:else}
								<Button variant="secondary" onclick={clearFilters}
									>{t('reels.empty.clearFilters')}</Button
								>
							{/if}
						{/snippet}
					</EmptyState>
				</Card>
			{:else if data.expert}
				<AutomationsTable
					expertId={data.expert.id}
					rows={automationRows}
					onedit={editAutomation}
					onchanged={(automation) => automations.set(automation.mediaId, automation)}
					ondeleted={(mediaId) => automations.delete(mediaId)}
				/>
			{/if}
		{/if}
	</div>
	{#if showPanel && selectedPost && data.expert}
		{#key selectedPost.id}
			<AutomationPanel
				expertId={data.expert.id}
				post={selectedPost}
				automation={automations.get(selectedPost.id) ?? null}
				onsaved={(automation) => automations.set(automation.mediaId, automation)}
				ondeleted={(mediaId) => automations.delete(mediaId)}
				onclose={() => (selectedId = null)}
			/>
		{/key}
	{/if}
</div>
