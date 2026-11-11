<script lang="ts">
	import { ApiError } from '#lib/api/http.js';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import { listLaunches } from '#lib/services/launches.js';
	import { createLink } from '#lib/services/links.js';
	import type {
		CreateLinkInput,
		Expert,
		Launch,
		Link,
		LinkChannel,
		LinkPurpose
	} from '#lib/types.js';
	import { linkPlacements, previewUtm, slug } from '#lib/utils/linkUtm.js';
	import ChannelPicker from '#lib/components/links/ChannelPicker.svelte';
	import type { PageProps } from './$types';

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
			const created = await createLink(input);
			result = created;
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
							LINK_CODE_GENERATION_FAILED: 'links.errors.generation'
						} as Record<string, MessageKey>
					)[cause.reason] ?? 'links.errors.generic';
			else errorKey = 'links.errors.generic';
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
<Card
	><EmptyState icon="link" title={t('links.emptyTitle')} description={t('links.emptyDescription')}>
		{#snippet action()}<Button onclick={openCreate}
				><Icon name="plus" size={16} />{t('links.createFirst')}</Button
			>{/snippet}
	</EmptyState></Card
>

<Dialog
	bind:open={dialogOpen}
	title={result ? t('links.resultTitle') : t('links.createTitle')}
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
			<Button type="submit" loading={submitting}>{t('links.create')}</Button>
		{/if}
	{/snippet}
</Dialog>
