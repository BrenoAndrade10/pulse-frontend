<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import { playExclusive } from '#lib/instagram/playback.js';
	import type { InstagramPost } from '#lib/types.js';
	import { coverUrl, MEDIA_KIND, mediaKind, slidesOf } from '#lib/utils/instagramMedia.js';

	type Props = { post: InstagramPost };

	const ARROWS = [
		{ dir: -1, icon: 'chevron-left', side: 'left-2', label: 'Item anterior' },
		{ dir: 1, icon: 'chevron-right', side: 'right-2', label: 'Próximo item' }
	] as const;

	let { post }: Props = $props();

	const kind = $derived(MEDIA_KIND[mediaKind(post)]);
	const slides = $derived(slidesOf(post));
	const fallbackCover = $derived(coverUrl(post));

	let track = $state<HTMLDivElement>();
	let active = $state(0);
	let playing = $state(false);
	let muted = $state(true);
	const videos: (HTMLVideoElement | undefined)[] = $state([]);
	const failed: boolean[] = $state([]);
	// -1 é a capa avulsa (publicação sem itens para mostrar).
	const brokenImages: Record<number, boolean> = $state({});

	const activeSlide = $derived(slides[active]);
	const activeVideo = $derived(
		activeSlide?.type === 'video' && !failed[active] ? videos[active] : undefined
	);

	// Prévia ao passar o mouse só em quem tem mouse e não pediu menos movimento.
	const hoverPreview =
		typeof window !== 'undefined' &&
		window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
		!window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	async function play() {
		if (!activeVideo) return;
		activeVideo.muted = muted;
		try {
			await playExclusive(activeVideo);
		} catch {
			// O navegador pode recusar o play (ex.: economia de dados); fica a capa.
		}
	}

	function pause() {
		activeVideo?.pause();
	}

	function togglePlay(event: MouseEvent) {
		event.preventDefault();
		if (playing) pause();
		else void play();
	}

	function toggleMute(event: MouseEvent) {
		event.preventDefault();
		muted = !muted;
		if (activeVideo) activeVideo.muted = muted;
	}

	function goTo(index: number) {
		if (!track) return;
		const target = Math.max(0, Math.min(slides.length - 1, index));
		track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
	}

	function handleScroll() {
		if (!track) return;
		const index = Math.round(track.scrollLeft / track.clientWidth);
		if (index === active) return;
		pause();
		active = index;
	}

	function revealOnLoad(image: HTMLImageElement) {
		const reveal = () => image.classList.remove('opacity-0');
		if (image.complete) reveal();
		else image.addEventListener('load', reveal, { once: true });
	}
</script>

{#snippet unavailable(hadMedia: boolean)}
	<span class="grid size-full place-items-center p-4 text-center text-fg-subtle">
		<span class="flex flex-col items-center gap-2">
			<Icon name={kind.icon} size={28} />
			{#if hadMedia}
				<span class="text-[12px]">Mídia indisponível no momento</span>
			{/if}
		</span>
	</span>
{/snippet}

<div
	class="group/media relative aspect-[4/5] overflow-hidden bg-surface"
	role="group"
	aria-roledescription={slides.length > 1 ? 'carrossel' : undefined}
	aria-label={slides.length > 1 ? `${kind.label} com ${slides.length} itens` : kind.label}
	onpointerenter={() => hoverPreview && void play()}
	onpointerleave={() => hoverPreview && pause()}
>
	{#if slides.length === 0}
		{#if fallbackCover && !brokenImages[-1]}
			<img
				class="size-full object-cover opacity-0 transition-opacity duration-300"
				src={fallbackCover}
				alt={post.caption ? `Capa: ${post.caption}` : `Capa: ${kind.label}`}
				loading="lazy"
				decoding="async"
				onerror={() => (brokenImages[-1] = true)}
				{@attach revealOnLoad}
			/>
		{:else}
			{@render unavailable(Boolean(fallbackCover))}
		{/if}
	{:else}
		<div
			class="flex size-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scrollbar-none"
			bind:this={track}
			onscroll={handleScroll}
		>
			{#each slides as slide, index (slide.id)}
				<div
					class="relative size-full shrink-0 snap-center"
					aria-roledescription={slides.length > 1 ? 'item' : undefined}
					aria-label={slides.length > 1 ? `${index + 1} de ${slides.length}` : undefined}
				>
					{#if slide.type === 'image' || failed[index]}
						{@const src = slide.type === 'image' ? slide.src : slide.poster}
						{#if src && !brokenImages[index]}
							<img
								class="size-full object-cover opacity-0 transition-opacity duration-300"
								{src}
								alt={post.caption ? `${kind.label}: ${post.caption}` : kind.label}
								loading="lazy"
								decoding="async"
								onerror={() => (brokenImages[index] = true)}
								{@attach revealOnLoad}
							/>
						{:else}
							{@render unavailable(true)}
						{/if}
					{:else}
						<video
							class="size-full object-cover"
							src={slide.src}
							poster={slide.poster ?? undefined}
							preload="none"
							muted
							loop
							playsinline
							bind:this={videos[index]}
							onplay={() => index === active && (playing = true)}
							onpause={() => index === active && (playing = false)}
							onerror={() => (failed[index] = true)}
						></video>
					{/if}
				</div>
			{/each}
		</div>

		{#if activeVideo}
			<button
				class={[
					'absolute inset-0 grid place-items-center text-white',
					'focus-visible:shadow-none focus-visible:[&>span]:shadow-focus'
				]}
				type="button"
				aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
				onclick={togglePlay}
			>
				<span
					class={[
						'grid size-12 place-items-center rounded-full bg-[rgb(0_0_0/0.45)] backdrop-blur-sm',
						'transition-opacity duration-200',
						playing ? 'opacity-0 group-hover/media:opacity-100' : 'opacity-100'
					]}
				>
					<Icon name={playing ? 'pause' : 'play'} size={20} />
				</span>
			</button>
			<button
				class="absolute right-2.5 bottom-2.5 grid size-8 place-items-center rounded-full bg-[rgb(0_0_0/0.55)] text-white backdrop-blur-sm"
				type="button"
				aria-label={muted ? 'Ativar som' : 'Desativar som'}
				aria-pressed={!muted}
				onclick={toggleMute}
			>
				<Icon name={muted ? 'volume-off' : 'volume-on'} size={15} />
			</button>
		{/if}

		{#if slides.length > 1}
			{#each ARROWS as arrow (arrow.dir)}
				{@const hidden = arrow.dir < 0 ? active === 0 : active === slides.length - 1}
				<button
					class={[
						'absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full',
						'bg-[rgb(255_255_255/0.85)] text-[#111] shadow transition-opacity duration-200',
						'opacity-0 group-hover/media:opacity-100 focus-visible:opacity-100 max-[761px]:hidden',
						arrow.side,
						hidden && 'pointer-events-none opacity-0!'
					]}
					type="button"
					aria-label={arrow.label}
					tabindex={hidden ? -1 : 0}
					onclick={() => goTo(active + arrow.dir)}
				>
					<Icon name={arrow.icon} size={16} />
				</button>
			{/each}

			<span
				class="pointer-events-none absolute bottom-2.5 left-1/2 flex -translate-x-1/2 gap-1"
				aria-hidden="true"
			>
				{#each slides as slide, index (slide.id)}
					<i
						class={[
							'size-1.5 rounded-full transition-colors duration-200',
							index === active ? 'bg-white' : 'bg-[rgb(255_255_255/0.45)]'
						]}
					></i>
				{/each}
			</span>
		{/if}
	{/if}

	<span
		class="pointer-events-none absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-[rgb(0_0_0/0.55)] px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm"
	>
		<Icon name={kind.icon} size={12} />{kind.label}
		{#if slides.length > 1}<span class="tabular-nums opacity-80"
				>· {active + 1}/{slides.length}</span
			>{/if}
	</span>

	{#if post.permalink}
		<a
			class="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-[rgb(0_0_0/0.55)] text-white backdrop-blur-sm hover:no-underline"
			href={post.permalink}
			target="_blank"
			rel="noreferrer"
			aria-label="Abrir no Instagram"
		>
			<Icon name="external-link" size={14} />
		</a>
	{/if}
</div>
