<script lang="ts">
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
	import type { TrackingPixel } from '#lib/types.js';
	import { formatRelativeTime } from '#lib/utils/format.js';

	type Props = { pixel: TrackingPixel };

	let { pixel }: Props = $props();

	type Guide = 'html' | 'wordpress' | 'gtm';

	const GUIDES: { id: Guide; label: MessageKey; steps: MessageKey[] }[] = [
		{
			id: 'html',
			label: 'tracking.install.guides.html.label',
			steps: [
				'tracking.install.guides.html.steps.one',
				'tracking.install.guides.html.steps.two',
				'tracking.install.guides.html.steps.three'
			]
		},
		{
			id: 'wordpress',
			label: 'tracking.install.guides.wordpress.label',
			steps: [
				'tracking.install.guides.wordpress.steps.one',
				'tracking.install.guides.wordpress.steps.two',
				'tracking.install.guides.wordpress.steps.three'
			]
		},
		{
			id: 'gtm',
			label: 'tracking.install.guides.gtm.label',
			steps: [
				'tracking.install.guides.gtm.steps.one',
				'tracking.install.guides.gtm.steps.two',
				'tracking.install.guides.gtm.steps.three'
			]
		}
	];

	let guide = $state<Guide>('html');
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const installed = $derived(pixel.installation.status === 'installed');
	const snippet = $derived(
		`<script async src="${pixel.scriptUrl}" data-pixel="${pixel.publicKey}"></` + 'script>'
	);
	const activeGuide = $derived(GUIDES.find((item) => item.id === guide)!);

	async function copySnippet() {
		try {
			await navigator.clipboard.writeText(snippet);
			copied = true;
			clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2000);
		} catch {
			// Sem permissão de área de transferência: o código continua selecionável.
		}
	}
</script>

<section
	class="rounded-lg border border-border bg-bg-elevated p-6 max-[561px]:p-4.5"
	aria-labelledby="install-title"
>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div>
			<h2 id="install-title" class="text-[17px] font-bold">{t('tracking.install.title')}</h2>
			<p class="mt-1 text-[13.5px] text-fg-muted">
				{t('tracking.install.description')}
			</p>
		</div>
		<span class="flex flex-col items-end gap-1">
			<Badge variant={installed ? 'success' : 'warning'}>
				{installed ? t('tracking.install.installed') : t('tracking.install.waiting')}
			</Badge>
			{#if pixel.installation.lastEventAt}
				<span class="text-[12px] text-fg-subtle">
					{t('tracking.install.lastEvent', {
						time: formatRelativeTime(pixel.installation.lastEventAt)
					})}
				</span>
			{/if}
		</span>
	</div>

	<div class="relative mt-5">
		<pre
			class="overflow-x-auto rounded-md border border-border bg-surface py-3.5 pr-28 pl-4 font-mono text-[12.5px] leading-relaxed text-fg select-all"><code
				>{snippet}</code
			></pre>
		<Button
			class="absolute top-2 right-2"
			variant="secondary"
			size="sm"
			onclick={copySnippet}
			aria-label={t('tracking.install.copyAria')}
		>
			<Icon name={copied ? 'check' : 'copy'} size={14} />
			{copied ? t('tracking.install.copied') : t('tracking.install.copy')}
		</Button>
		<span class="sr-only" aria-live="polite"
			>{copied ? t('tracking.install.copiedAnnounce') : ''}</span
		>
	</div>

	<div class="mt-5">
		<div class="inline-flex rounded-md border border-border bg-surface p-1" role="tablist">
			{#each GUIDES as item (item.id)}
				<button
					class={[
						'rounded-sm px-3 py-1.5 text-[13px] font-semibold [transition:background_0.15s,color_0.15s]',
						guide === item.id ? 'bg-bg-elevated text-fg shadow-sm' : 'text-fg-muted hover:text-fg'
					]}
					type="button"
					role="tab"
					id="guide-tab-{item.id}"
					aria-selected={guide === item.id}
					aria-controls="guide-panel"
					onclick={() => (guide = item.id)}
				>
					{t(item.label)}
				</button>
			{/each}
		</div>
		<div id="guide-panel" role="tabpanel" aria-labelledby="guide-tab-{guide}">
			<ol class="mt-3.5 flex flex-col gap-2 text-[13.5px] text-fg-muted">
				{#each activeGuide.steps as step, index (step)}
					<li class="flex gap-2.5">
						<span
							class="grid size-5.5 shrink-0 place-items-center rounded-full bg-surface text-[11.5px] font-bold text-fg"
							aria-hidden="true">{index + 1}</span
						>
						<span>{t(step)}</span>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
