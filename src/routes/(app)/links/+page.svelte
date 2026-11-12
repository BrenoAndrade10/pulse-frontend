<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ApiError } from '#lib/api/http.js';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import { listLaunches } from '#lib/services/launches.js';
	import { createLink, listLinks, updateLink } from '#lib/services/links.js';
	import type {
		CreateLinkInput,
		Expert,
		Launch,
		Link,
		LinkChannel,
		LinkPurpose,
		LinkUpdateInput
	} from '#lib/types.js';
	import { linkPlacements, previewUtm, slug } from '#lib/utils/linkUtm.js';
	import { formatDate } from '#lib/utils/format.js';
	import { withQuery } from '#lib/utils/query.js';
	import ChannelPicker from '#lib/components/links/ChannelPicker.svelte';
	import LinkFormDialog from '#lib/components/links/LinkFormDialog.svelte';
	import type { PageProps } from './$types';
	import type { LinksState } from './+page.js';

	let { data }: PageProps = $props();
	let dialogOpen = $state(false);
	let channel = $state<LinkChannel | ''>('');
	let previousChannel = $state<LinkChannel | ''>('');
	let placement = $state('');
	let placementSelection = $state('');
	let customPlacement = $state(false);
	let name = $state('');
	let nameEdited = $state(false);
	let destination = $state('');
	let purpose = $state<LinkPurpose>('other');
	let campaign = $state('');
	let utmSource = $state('');
	let utmMedium = $state('');
	let utmContent = $state('');
	let utmTerm = $state('');
	let expertId = $state('');
	let launchId = $state('');
	let launchOptions = $state<Launch[]>([]);
	let advanced = $state(false);
	let submitted = $state(false);
	let submitting = $state(false);
	let validationError = $state('');
	let errorKey = $state<MessageKey | ''>('');
	let result = $state<Link | null>(null);
	let qrCode = $state('');
	let copied = $state(false);
	let editingLink = $state<Link | null>(null);
	let recalculateUtm = $state(false);
	let links = $state<Link[]>([]);
	let listStatus = $state<'loading' | 'ready' | 'error'>('loading');
	let nextCursor = $state<string | null>(null);
	let listError = $state('');
	let loadingMore = $state(false);
	let actionError = $state<MessageKey | ''>('');
	let searchDraft = $state('');
	let updatingId = $state('');
	let deactivateTarget = $state<Link | null>(null);
	let confirmDialog = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	$effect(() => {
		const request = data.links;
		listStatus = 'loading';
		void request.then((state: LinksState) => {
			if (request !== data.links) return;
			if (state.status === 'error') {
				listStatus = 'error';
				listError = state.reason;
				return;
			}
			links = state.page.data;
			nextCursor = state.page.nextCursor;
			searchDraft = data.search;
			listStatus = 'ready';
		});
	});

	const listFiltering = $derived(Boolean(data.search || data.channel || data.status));
	const listErrorText = $derived(
		listError === 'VALIDATION_FAILED' ? t('links.errors.validation') : t('links.errors.load')
	);

	function applyListFilters(changes: Record<string, string | undefined>) {
		const query = withQuery(page.url.search, changes);
		void goto(query ? `${page.url.pathname}${query}` : page.url.pathname, {
			replaceState: true
		});
	}

	function debounceSearch(value: string) {
		if (debounceTimer) clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => applyListFilters({ q: value.trim() }), 300);
	}

	async function loadMoreLinks() {
		if (!nextCursor || loadingMore) return;
		loadingMore = true;
		actionError = '';
		try {
			const result = await listLinks({
				expertId: data.selectedExpertId ?? undefined,
				launchId: data.selectedLaunchId ?? undefined,
				search: data.search || undefined,
				channel: (data.channel || undefined) as LinkChannel | undefined,
				status: (data.status || undefined) as Link['status'] | undefined,
				cursor: nextCursor
			});
			links.push(...result.data);
			nextCursor = result.nextCursor;
		} catch {
			actionError = 'links.errors.loadMore';
		} finally {
			loadingMore = false;
		}
	}

	async function toggleStatus(link: Link, status: Link['status']) {
		updatingId = link.id;
		actionError = '';
		const previous = link.status;
		link.status = status;
		try {
			const updated = await updateLink(link.id, { status });
			links = links.map((item) => (item.id === link.id ? updated : item));
		} catch {
			link.status = previous;
			actionError = 'links.errors.update';
		} finally {
			updatingId = '';
		}
	}

	function requestDeactivate(link: Link) {
		deactivateTarget = link;
		confirmDialog = true;
	}

	async function confirmDeactivate() {
		if (!deactivateTarget) return;
		const target = deactivateTarget;
		confirmDialog = false;
		deactivateTarget = null;
		await toggleStatus(target, 'inactive');
	}

	async function copyUrl(url: string) {
		try {
			await navigator.clipboard.writeText(url);
		} catch {
			const area = document.createElement('textarea');
			area.value = url;
			document.body.append(area);
			area.select();
			document.execCommand('copy');
			area.remove();
		}
	}

	const effectiveChannel = $derived<LinkChannel>(channel || 'other');
	const selectedLaunch = $derived(launchOptions.find((launch) => launch.id === launchId));
	const placementOptions = $derived(
		linkPlacements[effectiveChannel].map((value) => ({
			value,
			label: t(`links.placements.${value}` as MessageKey)
		}))
	);
	const purposeOptions = $derived(
		(['content', 'capture', 'event', 'offer', 'checkout', 'other'] as LinkPurpose[]).map(
			(value) => ({ value, label: t(`links.purposes.${value}`) })
		)
	);
	const suggestedUtm = $derived(
		previewUtm({
			channel: effectiveChannel,
			placement,
			campaign,
			linkName: name,
			launchName: selectedLaunch?.name
		})
	);
	const formUtm = $derived(
		previewUtm({
			channel: effectiveChannel,
			placement,
			campaign,
			linkName: name,
			launchName: selectedLaunch?.name,
			overrides: { source: utmSource, medium: utmMedium, content: utmContent, term: utmTerm }
		})
	);
	const channelLabel = $derived(channel ? t(`links.channels.${channel}`) : t('links.general'));
	const placementLabel = $derived(
		customPlacement ? placement : placement ? t(`links.placements.${placement}` as MessageKey) : ''
	);
	const destinationError = $derived(
		destination.trim() && /^http:\/\//i.test(destination.trim())
			? t('links.errors.insecure')
			: destination.trim() && !normalizeDestination(destination)
				? t('links.errors.invalid')
				: ''
	);
	const formErrors = $derived({
		name: name.trim().length < 2 || name.trim().length > 120 ? t('links.errors.name') : '',
		destination:
			!destination.trim() || destination.trim().length > 2048
				? t('links.errors.destination')
				: destinationError,
		launch: launchId && !expertId ? t('links.errors.launchExpert') : ''
	});
	const hasDestinationUtm = $derived(/(?:\?|&)utm_[^=]+=/i.test(destination));
	const previewText = $derived(
		[channelLabel, placementLabel, selectedLaunch?.name || slug(campaign)]
			.filter(Boolean)
			.join(' · ')
	);
	const editChanged = $derived(
		!editingLink ||
			name.trim() !== editingLink.name ||
			destination.trim() !== editingLink.destinationUrl ||
			purpose !== editingLink.purpose ||
			effectiveChannel !== (editingLink.channel ?? 'other') ||
			placement.trim() !== (editingLink.placement ?? '') ||
			campaign.trim() !== (editingLink.campaign ?? '') ||
			expertId !== (editingLink.expertId ?? '') ||
			launchId !== (editingLink.launchId ?? '') ||
			utmSource !== (editingLink.utm.source ?? '') ||
			utmMedium !== (editingLink.utm.medium ?? '') ||
			utmContent !== (editingLink.utm.content ?? '') ||
			utmTerm !== (editingLink.utm.term ?? '') ||
			recalculateUtm
	);

	$effect(() => {
		if (!nameEdited)
			name = [channelLabel, placementLabel, selectedLaunch?.name].filter(Boolean).join(' · ');
	});

	function normalizeDestination(value: string) {
		const trimmed = value.trim();
		if (!trimmed || /^http:\/\//i.test(trimmed)) return '';
		try {
			return new URL(
				/^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
			).toString();
		} catch {
			return '';
		}
	}

	function resetForm() {
		channel = '';
		previousChannel = '';
		placement = '';
		placementSelection = '';
		customPlacement = false;
		name = '';
		nameEdited = false;
		destination = '';
		purpose = 'other';
		campaign = '';
		utmSource = '';
		utmMedium = '';
		utmContent = '';
		utmTerm = '';
		advanced = false;
		submitted = false;
		validationError = '';
		errorKey = '';
		launchId = '';
	}

	function openCreate() {
		editingLink = null;
		result = null;
		resetForm();
		expertId = data.selectedExpertId ?? '';
		launchOptions = expertId ? data.launches.filter((launch) => launch.expertId === expertId) : [];
		launchId =
			expertId && data.launches.some((launch) => launch.id === data.selectedLaunchId)
				? (data.selectedLaunchId ?? '')
				: '';
		if (expertId) void loadExpertLaunches(expertId);
		dialogOpen = true;
	}

	function openEdit(link: Link) {
		editingLink = link;
		result = null;
		channel = link.channel ?? '';
		previousChannel = channel;
		placement = link.placement ?? '';
		customPlacement = Boolean(placement && !linkPlacements[effectiveChannel].includes(placement));
		placementSelection = customPlacement ? '__custom__' : placement;
		name = link.name;
		nameEdited = true;
		destination = link.destinationUrl;
		purpose = link.purpose;
		campaign = link.campaign ?? '';
		utmSource = link.utm.source ?? '';
		utmMedium = link.utm.medium ?? '';
		utmContent = link.utm.content ?? '';
		utmTerm = link.utm.term ?? '';
		expertId = link.expertId ?? '';
		launchOptions = expertId ? data.launches.filter((launch) => launch.expertId === expertId) : [];
		launchId = link.launchId ?? '';
		recalculateUtm = false;
		advanced = true;
		submitted = false;
		errorKey = '';
		validationError = '';
		dialogOpen = true;
		if (expertId) void loadExpertLaunches(expertId);
	}

	function handleChannelChange(next: LinkChannel) {
		const oldPlacement = placement;
		const wasCatalog = Boolean(
			previousChannel && linkPlacements[previousChannel].includes(oldPlacement)
		);
		channel = next;
		previousChannel = next;
		if (wasCatalog && !linkPlacements[next].includes(oldPlacement)) {
			placement = '';
			placementSelection = '';
			customPlacement = false;
		} else if (customPlacement) placementSelection = '__custom__';
		else placementSelection = linkPlacements[next].includes(oldPlacement) ? oldPlacement : '';
	}

	function handlePlacementChange(value: string) {
		placementSelection = value;
		customPlacement = value === '__custom__';
		if (!customPlacement) placement = value;
		else if (linkPlacements[effectiveChannel].includes(placement)) placement = '';
	}

	function onExpertChange() {
		launchId = '';
		if (expertId) void loadExpertLaunches(expertId);
		else launchOptions = [];
	}

	async function loadExpertLaunches(id: string) {
		try {
			launchOptions = await listLaunches(id);
		} catch {
			launchOptions = data.launches.filter((launch) => launch.expertId === id);
		}
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		validationError = '';
		errorKey = '';
		const normalized = normalizeDestination(destination);
		if (Object.values(formErrors).some(Boolean) || !normalized) return;
		submitting = true;
		const utm = Object.fromEntries(
			Object.entries({
				source: utmSource,
				medium: utmMedium,
				content: utmContent,
				term: utmTerm
			}).filter(([, value]) => value.trim())
		);
		const input: CreateLinkInput = {
			name: name.trim(),
			destinationUrl: normalized,
			purpose,
			...(channel ? { channel } : {}),
			...(placement.trim() ? { placement: placement.trim() } : {}),
			...(campaign.trim() ? { campaign: campaign.trim() } : {}),
			...(Object.keys(utm).length ? { utm } : {}),
			...(expertId ? { expertId } : {}),
			...(launchId ? { launchId } : {})
		};
		try {
			if (editingLink) {
				const original = editingLink;
				const patch: LinkUpdateInput = {};
				if (name.trim() !== original.name) patch.name = name.trim();
				if (normalized !== original.destinationUrl) patch.destinationUrl = normalized;
				if (purpose !== original.purpose) patch.purpose = purpose;
				if (effectiveChannel !== (original.channel ?? 'other')) patch.channel = effectiveChannel;
				if (placement.trim() !== (original.placement ?? ''))
					patch.placement = placement.trim() || null;
				if (campaign.trim() !== (original.campaign ?? '')) patch.campaign = campaign.trim() || null;
				if (expertId !== (original.expertId ?? '')) patch.expertId = expertId || null;
				if (launchId !== (original.launchId ?? '')) patch.launchId = launchId || null;
				const nextUtm = {
					source: utmSource,
					medium: utmMedium,
					campaign: campaign,
					content: utmContent,
					term: utmTerm
				};
				const utmPatch: NonNullable<LinkUpdateInput['utm']> = {};
				for (const key of ['source', 'medium', 'campaign', 'content', 'term'] as const) {
					if (nextUtm[key] !== (original.utm[key] ?? '')) utmPatch[key] = nextUtm[key] || null;
				}
				if (Object.keys(utmPatch).length) patch.utm = utmPatch;
				if (recalculateUtm) patch.regenerateUtm = true;
				const updated = await updateLink(original.id, patch);
				links = links.map((item) => (item.id === updated.id ? updated : item));
				dialogOpen = false;
				return;
			}
			const created = await createLink(input);
			result = created;
			const firstPage = await listLinks({
				expertId: data.selectedExpertId ?? undefined,
				launchId: data.selectedLaunchId ?? undefined,
				search: data.search || undefined,
				channel: (data.channel || undefined) as LinkChannel | undefined,
				status: (data.status || undefined) as Link['status'] | undefined
			});
			links = firstPage.data;
			nextCursor = firstPage.nextCursor;
			const qr = await import('qrcode');
			qrCode = await qr.toDataURL(created.shortUrl, { margin: 1, width: 180 });
		} catch (cause) {
			if (cause instanceof ApiError && cause.reason === 'VALIDATION_FAILED') {
				validationError = cause.validationMessages.join(' ');
				if (!validationError) errorKey = 'links.errors.validation';
			} else if (cause instanceof ApiError)
				errorKey =
					(
						{
							LINK_DESTINATION_INVALID: 'links.errors.invalid',
							LINK_DESTINATION_INSECURE: 'links.errors.insecure',
							LINK_DESTINATION_BLOCKED: 'links.errors.blocked',
							LINK_DESTINATION_TOO_LONG: 'links.errors.tooLong',
							EXPERT_NOT_FOUND: 'links.errors.expert',
							LAUNCH_NOT_FOUND: 'links.errors.launch',
							LINK_CODE_GENERATION_FAILED: 'links.errors.generation',
							LINK_NOT_FOUND: 'links.errors.linkNotFound'
						} as Record<string, MessageKey>
					)[cause.reason] ?? 'links.errors.generic';
			if (editingLink && cause instanceof ApiError && cause.reason === 'LINK_NOT_FOUND') {
				applyListFilters({});
			} else errorKey = 'links.errors.generic';
		} finally {
			submitting = false;
		}
	}

	async function copyShortUrl() {
		if (!result) return;
		try {
			await navigator.clipboard.writeText(result.shortUrl);
		} catch {
			const area = document.createElement('textarea');
			area.value = result.shortUrl;
			document.body.append(area);
			area.select();
			document.execCommand('copy');
			area.remove();
		}
		copied = true;
		window.setTimeout(() => (copied = false), 2000);
	}

	function duplicate() {
		if (!result) return;
		const current = result;
		resetForm();
		destination = current.destinationUrl;
		purpose = current.purpose;
		expertId = current.expertId ?? '';
		launchId = current.launchId ?? '';
		launchOptions = data.launches.filter((launch) => launch.expertId === expertId);
		result = null;
		qrCode = '';
	}
</script>

<svelte:head><title>{t('links.title')}</title></svelte:head>
<PageHeader title={t('links.title')} description={t('links.description')}>
	{#snippet actions()}<Button onclick={openCreate}
			><Icon name="plus" size={16} />{t('links.newLink')}</Button
		>{/snippet}
</PageHeader>
<div class="mb-5 flex flex-wrap items-center gap-3">
	<div
		class="flex min-w-64 flex-1 items-center rounded-md border border-border bg-surface focus-within:border-primary focus-within:shadow-focus"
	>
		<Icon name="search" size={16} class="ml-3.5 text-fg-subtle" />
		<input
			class="h-10.5 min-w-0 flex-1 bg-transparent px-2.5 text-[14px] text-fg outline-none placeholder:text-fg-subtle"
			type="search"
			bind:value={searchDraft}
			oninput={(event) => debounceSearch(event.currentTarget.value)}
			placeholder={t('links.searchPlaceholder')}
			aria-label={t('links.searchPlaceholder')}
		/>
		{#if data.search}<button
				class="mr-1.5 grid size-7.5 place-items-center rounded-md text-fg-muted hover:bg-surface-hover"
				aria-label={t('links.searchClear')}
				onclick={() => {
					searchDraft = '';
					applyListFilters({ q: '' });
				}}><Icon name="x" size={15} /></button
			>{/if}
	</div>
	<Select
		id="links-channel-filter"
		aria-label={t('links.filterChannel')}
		value={data.channel}
		options={[
			{ value: '', label: t('links.allChannels') },
			...(['instagram', 'whatsapp', 'telegram', 'email', 'ads', 'other'] as LinkChannel[]).map(
				(value) => ({ value, label: t(`links.channels.${value}`) })
			)
		]}
		onchange={(event) => applyListFilters({ channel: event.currentTarget.value })}
	/>
	<Select
		id="links-status-filter"
		aria-label={t('links.filterStatus')}
		value={data.status}
		options={[
			{ value: '', label: t('links.allStatuses') },
			{ value: 'active', label: t('links.activeStatus') },
			{ value: 'inactive', label: t('links.inactiveStatus') }
		]}
		onchange={(event) => applyListFilters({ status: event.currentTarget.value })}
	/>
</div>
{#if actionError}<div class="mb-4"><Alert>{t(actionError)}</Alert></div>{/if}
{#if listStatus === 'error'}
	<Card
		><EmptyState icon="link" title={t('links.errors.load')} description={listErrorText}
			>{#snippet action()}<button
					class={buttonClass({ variant: 'secondary' })}
					onclick={() => applyListFilters({})}>{t('links.tryAgain')}</button
				>{/snippet}</EmptyState
		></Card
	>
{:else if listStatus === 'loading'}
	<Card
		><div class="space-y-3 p-5">
			{#each Array.from({ length: 5 }, (_, index) => index) as index (index)}<div
					class="h-12 animate-pulse rounded bg-surface"
				></div>{/each}
		</div></Card
	>
{:else if links.length === 0}
	<Card
		><EmptyState
			icon="link"
			title={listFiltering ? t('links.emptyFilteredTitle') : t('links.emptyTitle')}
			description={listFiltering
				? t('links.emptyFilteredDescription')
				: t('links.emptyDescription')}
		>
			{#snippet action()}{#if listFiltering}<button
						class={buttonClass({ variant: 'secondary' })}
						onclick={() => applyListFilters({ q: '', channel: '', status: '' })}
						>{t('links.clearFilters')}</button
					>{:else}<Button onclick={openCreate}
						><Icon name="plus" size={16} />{t('links.createFirst')}</Button
					>{/if}{/snippet}
		</EmptyState></Card
	>
{:else}
	<Card>
		<div class="hidden overflow-x-auto md:block">
			<table class="w-full text-left text-[13px]">
				<thead
					><tr class="border-b border-border text-[11px] uppercase tracking-wider text-fg-subtle"
						><th class="px-5 py-3">{t('links.name')}</th><th class="px-5 py-3"
							>{t('links.shortUrl')}</th
						><th class="px-5 py-3">{t('links.channel')}</th><th class="px-5 py-3"
							>{t('links.destinationSummary')}</th
						><th class="px-5 py-3">{t('links.createdAt')}</th><th class="px-5 py-3"
							>{t('links.actions')}</th
						></tr
					></thead
				><tbody
					>{#each links as link (link.id)}<tr class="border-b border-border last:border-0"
							><td class="px-5 py-4 font-medium">{link.name}</td><td class="px-5 py-4"
								><div class="flex items-center gap-2">
									<code class="max-w-40 truncate font-mono text-primary">{link.shortUrl}</code
									><button aria-label={t('links.copy')} onclick={() => copyUrl(link.shortUrl)}
										><Icon name="copy" size={14} /></button
									><a
										href={link.shortUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={t('links.openLink')}><Icon name="external-link" size={14} /></a
									>
								</div></td
							><td class="px-5 py-4"
								>{t(`links.channels.${link.channel ?? 'other'}`)}{#if link.placement}<span
										class="text-fg-muted"
									>
										· {linkPlacements[link.channel ?? 'other'].includes(link.placement)
											? t(`links.placements.${link.placement}` as MessageKey)
											: link.placement}</span
									>{/if}</td
							><td class="max-w-52 truncate px-5 py-4" title={link.destinationUrl}
								><a
									class="hover:text-primary"
									href={link.destinationUrl}
									target="_blank"
									rel="noopener noreferrer">{link.destinationUrl}</a
								></td
							><td class="px-5 py-4 text-fg-muted">{formatDate(link.createdAt)}</td><td
								class="px-5 py-4"
								><div class="flex items-center gap-2">
									<Badge variant={link.status === 'active' ? 'success' : 'neutral'}
										>{link.status === 'active' ? t('links.active') : t('links.inactive')}</Badge
									><Button
										size="sm"
										variant="ghost"
										onclick={() => openEdit(link)}
										disabled={updatingId === link.id}>{t('links.edit')}</Button
									>{#if link.status === 'active'}<Button
											size="sm"
											variant="ghost"
											loading={updatingId === link.id}
											onclick={() => requestDeactivate(link)}>{t('links.deactivate')}</Button
										>{:else}<Button
											size="sm"
											variant="ghost"
											loading={updatingId === link.id}
											onclick={() => toggleStatus(link, 'active')}>{t('links.activate')}</Button
										>{/if}
								</div></td
							></tr
						>{/each}</tbody
				>
			</table>
		</div>
		<div class="space-y-3 p-4 md:hidden">
			{#each links as link (link.id)}<article class="rounded-md border border-border p-4">
					<div class="flex items-start justify-between gap-3">
						<div>
							<h2 class="font-semibold">{link.name}</h2>
							<p class="mt-1 text-xs text-fg-muted">
								{t(`links.channels.${link.channel ?? 'other'}`)}{link.placement
									? ` · ${link.placement}`
									: ''}
							</p>
						</div>
						<Badge variant={link.status === 'active' ? 'success' : 'neutral'}
							>{link.status === 'active' ? t('links.active') : t('links.inactive')}</Badge
						>
					</div>
					<code class="mt-3 block break-all font-mono text-xs text-primary">{link.shortUrl}</code>
					<p class="mt-2 truncate text-xs text-fg-muted" title={link.destinationUrl}>
						{link.destinationUrl}
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<Button size="sm" variant="ghost" onclick={() => copyUrl(link.shortUrl)}
							>{t('links.copy')}</Button
						><Button size="sm" variant="ghost" onclick={() => openEdit(link)}
							>{t('links.edit')}</Button
						>{#if link.status === 'active'}<Button
								size="sm"
								variant="ghost"
								onclick={() => requestDeactivate(link)}>{t('links.deactivate')}</Button
							>{:else}<Button size="sm" variant="ghost" onclick={() => toggleStatus(link, 'active')}
								>{t('links.activate')}</Button
							>{/if}
					</div>
				</article>{/each}
		</div>
		{#if nextCursor}<div class="flex justify-center border-t border-border p-4">
				<Button variant="secondary" loading={loadingMore} onclick={loadMoreLinks}
					>{t('links.loadMore')}</Button
				>
			</div>{/if}
	</Card>
{/if}

<Dialog
	bind:open={confirmDialog}
	title={t('links.confirmDeactivateTitle')}
	description={t('links.confirmDeactivateDescription')}
	size="sm"
>
	<div></div>
	{#snippet footer()}<Button variant="ghost" onclick={() => (confirmDialog = false)}
			>{t('links.cancel')}</Button
		><Button onclick={confirmDeactivate}>{t('links.confirm')}</Button>{/snippet}
</Dialog>

<LinkFormDialog
	bind:open={dialogOpen}
	title={result ? t('links.resultTitle') : editingLink ? t('links.edit') : t('links.createTitle')}
	description={result ? t('links.resultDescription') : t('links.createDescription')}
	onsubmit={result ? undefined : save}
	dismissible={!submitting}
>
	{#if result}
		<div>
			<div class="flex flex-col gap-5">
				<div
					class="flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/10 p-4"
				>
					<code class="min-w-0 flex-1 break-all text-[15px] text-primary-hover"
						>{result.shortUrl}</code
					><Button size="sm" onclick={copyShortUrl} aria-live="polite"
						><Icon name="copy" size={15} />{copied ? t('links.copied') : t('links.copy')}</Button
					>
				</div>
				{#if qrCode}<img
						src={qrCode}
						alt={t('links.qrAlt')}
						class="mx-auto size-45 rounded-md bg-white p-2"
					/>{/if}
				<div class="grid gap-2 text-[13px] text-fg-muted">
					<p><strong class="text-fg">{result.name}</strong></p>
					<p>
						{result.channel ? t(`links.channels.${result.channel}`) : t('links.general')}
						{result.placement
							? `· ${linkPlacements[result.channel ?? 'other'].includes(result.placement) ? t(`links.placements.${result.placement}` as MessageKey) : result.placement}`
							: ''}
					</p>
					<p>{result.destinationUrl}</p>
					<p>
						{t(`links.purposes.${result.purpose}`)} · {Object.entries(result.utm)
							.filter(([, value]) => value)
							.map(([key, value]) => `${key}=${value}`)
							.join(' · ') || '—'}
					</p>
				</div>
			</div>
		</div>
	{:else}
		<div class="space-y-5">
			{#if validationError || errorKey}<Alert>{validationError || t(errorKey as MessageKey)}</Alert
				>{/if}
			<fieldset class="space-y-4">
				<legend class="text-[15px] font-bold">{t('links.sections.information')}</legend>
				<div class="grid gap-4 sm:grid-cols-2">
					<TextField
						id="link-name"
						label={t('links.name')}
						bind:value={name}
						oninput={() => (nameEdited = true)}
						error={submitted ? formErrors.name : undefined}
					/><TextField
						id="link-destination"
						label={t('links.destination')}
						bind:value={destination}
						error={submitted ? formErrors.destination : undefined}
						hint={destination && !destinationError
							? `${t('links.normalized')}: ${normalizeDestination(destination)}`
							: undefined}
					/>
				</div>
				{#if hasDestinationUtm}<p class="text-[12.5px] text-fg-muted">
						{t('links.destinationUtmNotice')}
					</p>{/if}
			</fieldset>
			<fieldset class="space-y-4">
				<legend class="text-[15px] font-bold">{t('links.sections.source')}</legend><ChannelPicker
					bind:value={channel}
					onchange={handleChannelChange}
				/>
				<div class="grid gap-4 sm:grid-cols-2">
					<Select
						id="link-placement"
						label={t('links.placement')}
						bind:value={placementSelection}
						onchange={() => handlePlacementChange(placementSelection)}
						options={[
							{ value: '', label: t('links.noPlacement') },
							...placementOptions,
							{ value: '__custom__', label: t('links.customPlacement') }
						]}
					/>{#if customPlacement}<TextField
							id="link-custom-placement"
							label={t('links.customPlacement')}
							bind:value={placement}
							maxlength={64}
						/>{/if}
				</div>
			</fieldset>
			<fieldset class="space-y-4">
				<legend class="text-[15px] font-bold">{t('links.sections.context')}</legend>
				<div class="grid gap-4 sm:grid-cols-2">
					<Select
						id="link-expert"
						label={t('links.expert')}
						bind:value={expertId}
						onchange={onExpertChange}
						options={[
							{ value: '', label: t('links.allCompany') },
							...data.experts.map((expert: Expert) => ({ value: expert.id, label: expert.name }))
						]}
					/><Select
						id="link-launch"
						label={t('links.launch')}
						bind:value={launchId}
						disabled={!expertId}
						error={submitted ? formErrors.launch : undefined}
						options={[
							{ value: '', label: t('links.noLaunch') },
							...launchOptions.map((launch) => ({ value: launch.id, label: launch.name }))
						]}
					/>
				</div>
				<Select
					id="link-purpose"
					label={t('links.purpose')}
					bind:value={purpose}
					options={purposeOptions}
				/>
				<p class="text-[12.5px] text-fg-subtle">{t('links.purposeHint')}</p>
			</fieldset>
			<details bind:open={advanced} class="rounded-md border border-border">
				<summary class="cursor-pointer px-3.5 py-3 text-[13px] font-semibold"
					>{t('links.sections.advanced')}</summary
				>
				<div class="grid gap-4 border-t border-border p-3.5 sm:grid-cols-2">
					<TextField
						id="link-campaign"
						label={t('links.campaign')}
						bind:value={campaign}
						placeholder={suggestedUtm.campaign ?? ''}
						hint={t('links.suggested', { value: suggestedUtm.campaign ?? t('links.none') })}
					/><TextField
						id="utm-source"
						label={t('links.utmSource')}
						bind:value={utmSource}
						placeholder={suggestedUtm.source}
					/><TextField
						id="utm-medium"
						label={t('links.utmMedium')}
						bind:value={utmMedium}
						placeholder={suggestedUtm.medium}
					/><TextField
						id="utm-content"
						label={t('links.utmContent')}
						bind:value={utmContent}
						placeholder={suggestedUtm.content ?? ''}
					/><TextField
						id="utm-term"
						label={t('links.utmTerm')}
						bind:value={utmTerm}
						placeholder={t('links.none')}
					/>
				</div>
				{#if editingLink}<label
						class="flex items-start gap-2 px-3.5 pb-3.5 text-[13px] text-fg-muted"
						><input type="checkbox" bind:checked={recalculateUtm} />
						<span
							><span class="font-medium text-fg">{t('links.recalculateUtm')}</span><span
								class="block text-[12px]">{t('links.recalculateUtmHint')}</span
							></span
						></label
					>{/if}
				<div class="border-t border-border px-3.5 py-3 text-[12.5px] text-fg-muted">
					<p class="font-semibold text-fg">{t('links.utmPreview')}</p>
					<p class="mt-1 break-words">
						{Object.entries(formUtm)
							.filter(([, value]) => value)
							.map(([key, value]) => `${key}=${value}`)
							.join(' · ')}
					</p>
				</div>
			</details>
			<p class="rounded-md bg-surface px-3.5 py-3 text-[13px] text-fg-muted">
				<strong class="text-fg">{t('links.preview')}</strong>
				{previewText || t('links.general')}
			</p>
		</div>
	{/if}
	{#snippet footer()}
		{#if result}
			<Button variant="ghost" onclick={() => (dialogOpen = false)}>{t('links.close')}</Button>
			<Button variant="ghost" onclick={duplicate}>{t('links.duplicate')}</Button>
			<Button
				variant="ghost"
				onclick={() => window.open(result?.shortUrl, '_blank', 'noopener,noreferrer')}
				>{t('links.test')}</Button
			>
			<Button
				onclick={() => {
					result = null;
					qrCode = '';
					resetForm();
				}}>{t('links.createAnother')}</Button
			>
		{:else}
			<Button variant="ghost" onclick={() => (dialogOpen = false)}>{t('links.cancel')}</Button>
			<Button type="submit" loading={submitting} disabled={Boolean(editingLink && !editChanged)}
				>{editingLink ? t('links.save') : t('links.create')}</Button
			>
		{/if}
	{/snippet}
</LinkFormDialog>
