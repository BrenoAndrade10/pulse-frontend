<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import SelectExpertState from '#lib/components/app/SelectExpertState.svelte';
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
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
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

	const kindOptions = $derived(
		KIND_FILTER_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))
	);
	const dmOptions = $derived(
		DM_FILTER_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))
	);
	const sortOptions = $derived(
		MEDIA_SORT_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))
	);

	function clearFilters() {
		query = '';
		kindFilter = 'all';
		dmFilter = 'all';
	}
</script>

<svelte:head>
	<title>{t('reels.page.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={t('reels.page.title')}
	description={data.expert
		? t('reels.page.descriptionExpert', { name: data.expert.name })
		: t('reels.page.descriptionAll')}
>
	{#snippet actions()}
		<a class={buttonClass({ variant: 'secondary' })} href="/integrations#instagram">
			<Icon name="instagram" size={16} />{t('reels.page.configureInstagram')}
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
	{#if automationsStatus === 'error'}
		<div class="mb-4">
			<Alert>
				{t('reels.page.automationsError')}
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
			<label class="sr-only" for="media-search">{t('reels.search.label')}</label>
			<input
				class="h-10.5 min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none [&::-webkit-search-cancel-button]:hidden"
				id="media-search"
				type="search"
				bind:value={query}
				placeholder={t('reels.search.placeholder')}
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
		<div class="w-44 max-[621px]:w-[calc(50%-6px)]">
			<Select
				id="media-kind-filter"
				aria-label={t('reels.search.kindFilter')}
				bind:value={kindFilter}
				options={kindOptions}
			/>
		</div>
		<div class="w-48 max-[621px]:w-[calc(50%-6px)]">
			<Select
				id="media-dm-filter"
				aria-label={t('reels.search.dmFilter')}
				bind:value={dmFilter}
				options={dmOptions}
				disabled={automationsStatus !== 'ready'}
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
	</div>

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
						{post.caption ?? t('reels.card.noCaption')}
					</p>
					<div class="mt-3 flex items-center justify-between gap-3 text-[12px] text-fg-subtle">
						<span
							>{post.timestamp ? formatDate(post.timestamp) : t('reels.card.dateUnavailable')}</span
						>
						<span class="flex gap-3 tabular-nums">
							<span title={t('reels.card.likesTitle')}
								>{t('reels.card.likes', { count: post.likeCount ?? 0 })}</span
							>
							<span title={t('reels.card.commentsTitle')}
								>{t('reels.card.comments', { count: post.commentsCount ?? 0 })}</span
							>
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
										{automation.isActive ? t('reels.card.dmActive') : t('reels.card.dmPaused')}
									</Badge>
									<p
										class="mt-1 flex min-w-0 items-center gap-1.5 text-[12px] text-fg-subtle"
										title={automation.keywords.join(', ')}
									>
										<span class="truncate">{automation.keywords.join(', ')}</span>
										{#if automation.button}
											<span class="shrink-0" title={t('reels.card.withButton')}>
												<Icon name="link" size={12} />
												<span class="sr-only">{t('reels.card.withButtonSr')}</span>
											</span>
										{/if}
										{#if automation.commentReply}
											<span class="shrink-0" title={t('reels.card.repliesComment')}>
												<Icon name="message-circle" size={12} />
												<span class="sr-only">{t('reels.card.repliesCommentSr')}</span>
											</span>
										{/if}
									</p>
								{:else}
									<span class="text-[12px] text-fg-subtle">{t('reels.card.noDm')}</span>
								{/if}
							</div>
							<Button
								variant="secondary"
								size="sm"
								disabled={automationsStatus !== 'ready'}
								aria-label={automation ? t('reels.card.editAria') : t('reels.card.configureAria')}
								onclick={() => (editingPost = post)}
							>
								{automation ? t('reels.card.edit') : t('reels.card.configure')}
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
		<p class="mt-5 text-center text-[13px] text-danger">{t(feed.paginationError)}</p>
	{/if}

	<div class="mt-6 flex min-h-10 justify-center" bind:this={sentinel}>
		{#if feed.status === 'ready' && feed.hasMore && !needsEverything && !feed.loadingMore}
			<Button variant="ghost" size="sm" disabled={feed.working} onclick={() => feed.loadMore()}>
				{t('reels.page.loadMore')}
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
