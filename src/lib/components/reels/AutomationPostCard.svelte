<script lang="ts">
	import AutomationStatus from '#lib/components/reels/AutomationStatus.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import type { InstagramPost } from '#lib/types.js';
	import type { AutomationStatus as Status } from '#lib/utils/commentAutomation.js';
	import { coverUrl } from '#lib/utils/instagramMedia.js';

	type Props = { post: InstagramPost; status: Status; selected: boolean; onselect: () => void };

	let { post, status, selected, onselect }: Props = $props();

	const cover = $derived(coverUrl(post));
	const title = $derived(
		post.caption
			?.split('\n')
			.find((line) => line.trim())
			?.trim() ?? t('reels.card.noCaption')
	);
	let broken = $state(false);
</script>

<article
	class={[
		'group relative overflow-hidden rounded-lg border bg-bg-elevated [transition:border-color_0.15s,box-shadow_0.15s]',
		selected
			? 'border-primary shadow-[0_0_0_2px_rgb(124_92_255/0.55)]'
			: 'border-border hover:border-border-strong'
	]}
>
	<button
		type="button"
		class="block w-full cursor-pointer p-2.5 text-left focus-visible:shadow-focus"
		aria-pressed={selected}
		aria-label={`${t('reels.auto.actions.selectPost')}: ${title}`}
		onclick={onselect}
	>
		<span class="relative block aspect-[4/3.4] overflow-hidden rounded-md bg-surface">
			{#if cover && !broken}
				<img
					class="size-full object-cover"
					src={cover}
					alt=""
					loading="lazy"
					onerror={() => (broken = true)}
				/>
			{:else}
				<span class="grid size-full place-items-center text-fg-subtle"
					><Icon name="video" size={28} /></span
				>
			{/if}
		</span>
		<span class="mt-3 block px-1">
			<span class="line-clamp-1 text-[16px] font-bold">{title}</span>
			<span class="mt-2.5 block pb-1"><AutomationStatus {status} /></span>
		</span>
	</button>
	{#if post.permalink}
		<a
			class="absolute top-4.5 right-4.5 grid size-9 place-items-center rounded-md bg-[rgb(10_10_18/0.7)] text-fg backdrop-blur-[6px] hover:bg-[rgb(10_10_18/0.9)] hover:no-underline focus-visible:shadow-focus"
			href={post.permalink}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={t('reels.auto.actions.openPost')}
			title={t('reels.auto.actions.openPost')}
		>
			<Icon name="external-link" size={16} />
		</a>
	{/if}
</article>
