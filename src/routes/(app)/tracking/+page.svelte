<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import SelectExpertState from '#lib/components/app/SelectExpertState.svelte';
	import PageSetupCard from '#lib/components/tracking/PageSetupCard.svelte';
	import PixelInstallCard from '#lib/components/tracking/PixelInstallCard.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import {
		createTrackingPixel,
		getTrackingPixel,
		setTrackingPageLaunch
	} from '#lib/services/tracking.js';
	import type { TrackingPixel } from '#lib/types.js';
	import { formatRelativeTime } from '#lib/utils/format.js';
	import type { PixelState } from './+page.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let pixelState = $state<PixelState | null>(null);

	$effect(() => {
		const request = data.pixel;
		pixelState = null;
		void request.then((result) => {
			if (request === data.pixel) pixelState = result;
		});
	});

	// Ao voltar do editor (outra aba), atualiza as páginas sem voltar ao skeleton.
	$effect(() => {
		const expertId = data.expert?.id;
		if (!expertId) return;

		const refresh = async () => {
			if (document.visibilityState !== 'visible' || pixelState?.status !== 'ready') return;
			if (!pixelState.pixel) return;
			try {
				const pixel = await getTrackingPixel(expertId);
				if (pixel && data.expert?.id === expertId) pixelState = { status: 'ready', pixel };
			} catch {
				// Mantém o que está na tela; a próxima volta tenta de novo.
			}
		};

		document.addEventListener('visibilitychange', refresh);
		return () => document.removeEventListener('visibilitychange', refresh);
	});

	let activating = $state(false);
	let activationError = $state<string>();
	let setupCard = $state<ReturnType<typeof PageSetupCard>>();

	const highlights: { icon: IconName; title: MessageKey; text: MessageKey }[] = [
		{
			icon: 'link',
			title: 'tracking.activate.highlights.install.title',
			text: 'tracking.activate.highlights.install.text'
		},
		{
			icon: 'target',
			title: 'tracking.activate.highlights.point.title',
			text: 'tracking.activate.highlights.point.text'
		},
		{
			icon: 'bar-chart',
			title: 'tracking.activate.highlights.track.title',
			text: 'tracking.activate.highlights.track.text'
		}
	];

	async function activate() {
		if (!data.expert) return;
		activating = true;
		activationError = undefined;
		try {
			const pixel: TrackingPixel = await createTrackingPixel(data.expert.id);
			pixelState = { status: 'ready', pixel };
		} catch {
			activationError = t('tracking.activate.error');
		} finally {
			activating = false;
		}
	}

	const launchOptions = $derived([
		{ value: '', label: t('tracking.pages.autoLaunch') },
		...data.launches.map((launch) => ({ value: launch.id, label: launch.name }))
	]);
	let pageError = $state<string>();

	/** Atualiza na hora e volta atrás se a API recusar. */
	async function changeLaunch(url: string, value: string) {
		if (!data.expert || pixelState?.status !== 'ready' || !pixelState.pixel) return;
		const pixel = pixelState.pixel;
		const previous = pixel.pages.find((page) => page.url === url)?.launchId ?? null;
		const launchId = value || null;
		const withLaunch = (id: string | null) => ({
			...pixel,
			pages: pixel.pages.map((page) => (page.url === url ? { ...page, launchId: id } : page))
		});

		pageError = undefined;
		pixelState = { status: 'ready', pixel: withLaunch(launchId) };
		try {
			await setTrackingPageLaunch(data.expert.id, url, launchId);
		} catch {
			pixelState = { status: 'ready', pixel: withLaunch(previous) };
			pageError = t('tracking.pages.saveError');
		}
	}

	function continueOn(url: string) {
		setupCard?.prefill(url);
		document.getElementById('setup-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>{t('tracking.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={t('tracking.title')}
	description={data.expert
		? t('tracking.description', { expert: data.expert.name })
		: t('tracking.descriptionAll')}
/>

{#snippet skeleton(lines: number)}
	<div class="rounded-lg border border-border bg-bg-elevated p-6" aria-hidden="true">
		<span class="block h-4.5 w-44 rounded bg-surface motion-safe:animate-pulse"></span>
		<span class="mt-2.5 block h-3.5 w-2/3 rounded bg-surface motion-safe:animate-pulse"></span>
		{#each { length: lines }, index (index)}
			<span class="mt-5 block h-11.5 w-full rounded-md bg-surface motion-safe:animate-pulse"></span>
		{/each}
	</div>
{/snippet}

{#if !data.expert}
	<SelectExpertState
		hasExperts={data.experts.length > 0}
		subjectKey="tracking.selectSubject"
		emptyDescriptionKey="tracking.selectEmpty"
	/>
{:else if pixelState === null}
	<div class="flex flex-col gap-5">
		{@render skeleton(2)}
		{@render skeleton(1)}
	</div>
	<span class="sr-only" aria-live="polite">{t('tracking.loading')}</span>
{:else if pixelState.status === 'unavailable'}
	<Card>
		<EmptyState
			icon="target"
			title={t('tracking.unavailable.title')}
			description={t('tracking.unavailable.description')}
		/>
	</Card>
{:else if pixelState.status === 'error'}
	<Card>
		<EmptyState
			icon="target"
			title={t('tracking.loadError.title')}
			description={t('tracking.loadError.description')}
		>
			{#snippet action()}
				<Button onclick={() => invalidateAll()}>{t('common.actions.retry')}</Button>
			{/snippet}
		</EmptyState>
	</Card>
{:else if !pixelState.pixel}
	<section
		class="rounded-lg border border-border bg-bg-elevated p-8 max-[561px]:p-5 motion-safe:animate-fade-in"
		aria-labelledby="activate-title"
	>
		<div class="max-w-xl">
			<h2 id="activate-title" class="text-[20px] font-extrabold tracking-[-0.02em]">
				{t('tracking.activate.title')}
			</h2>
			<p class="mt-2 text-fg-muted">
				{t('tracking.activate.description', { expert: data.expert.name })}
			</p>
		</div>

		<ol class="mt-6 grid grid-cols-3 gap-3 max-[761px]:grid-cols-1">
			{#each highlights as item, index (item.title)}
				<li class="flex gap-3 rounded-md bg-surface p-4">
					<span
						class="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary-hover"
						aria-hidden="true"
					>
						<Icon name={item.icon} size={16} />
					</span>
					<span>
						<span class="block font-semibold">
							<span class="sr-only">{t('tracking.activate.step', { number: index + 1 })}</span>{t(
								item.title
							)}
						</span>
						<span class="block text-[13px] text-fg-subtle">{t(item.text)}</span>
					</span>
				</li>
			{/each}
		</ol>

		<div class="mt-6 flex flex-wrap items-center gap-3">
			<Button loading={activating} onclick={activate}>{t('tracking.activate.button')}</Button>
			<span class="text-[12.5px] text-fg-subtle">{t('tracking.activate.hint')}</span>
		</div>
		{#if activationError}
			<div class="mt-4"><Alert>{activationError}</Alert></div>
		{/if}
	</section>
{:else}
	{@const pixel = pixelState.pixel}
	<div class="flex flex-col gap-5 motion-safe:animate-fade-in">
		<PageSetupCard bind:this={setupCard} expertId={data.expert.id} {pixel} />

		<Card
			title={t('tracking.pages.title')}
			description={t('tracking.pages.description')}
			flush={pixel.pages.length > 0}
		>
			{#if pixel.pages.length === 0}
				<p class="text-[13.5px] text-fg-muted">
					{t('tracking.pages.empty')}
				</p>
			{:else}
				<ul>
					{#each pixel.pages as item (item.url)}
						{@const address = new URL(item.url)}
						<li
							class="flex items-center gap-4 border-t border-border px-5.5 py-3.5 first:border-t-0 max-[561px]:flex-wrap max-[561px]:px-4"
						>
							<span class="min-w-0 flex-1">
								<span class="block truncate font-semibold">
									{address.hostname.replace(/^www\./, '')}<span class="font-normal text-fg-muted"
										>{address.pathname === '/' ? '' : address.pathname}</span
									>
								</span>
								<span class="block text-[12.5px] text-fg-subtle">
									{t('tracking.pages.events', { count: item.eventsCount })} · {t(
										'tracking.pages.updated',
										{ time: formatRelativeTime(item.updatedAt) }
									)}
								</span>
							</span>
							<div class="w-60 max-[561px]:w-full">
								<Select
									id="page-launch-{item.url}"
									aria-label={t('tracking.pages.launchLabel')}
									value={item.launchId ?? ''}
									options={launchOptions}
									onchange={(event) => changeLaunch(item.url, event.currentTarget.value)}
								/>
							</div>
							<Button variant="secondary" size="sm" onclick={() => continueOn(item.url)}>
								{t('tracking.pages.continue')}
							</Button>
						</li>
					{/each}
				</ul>
				{#if pageError}
					<div class="px-5.5 pb-4"><Alert>{pageError}</Alert></div>
				{/if}
			{/if}
		</Card>

		<PixelInstallCard {pixel} />
	</div>
{/if}
