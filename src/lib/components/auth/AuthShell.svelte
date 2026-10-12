<script lang="ts">
	import type { Snippet } from 'svelte';
	import BrandPanel from './BrandPanel.svelte';
	import Logo from './Logo.svelte';

	type Props = {
		title: string;
		subtitle: string;
		children: Snippet;
		footer?: Snippet;
	};

	let { title, subtitle, children, footer }: Props = $props();
</script>

<!-- max-[961px]: equivale a @media (max-width: 960px) — Tailwind usa (width < X). -->
<div class="grid min-h-dvh grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] max-[961px]:grid-cols-[1fr]">
	<BrandPanel class="max-[961px]:hidden" />

	<main
		class={[
			'relative flex items-center justify-center px-6 py-12',
			'max-[961px]:items-start max-[961px]:px-4 max-[961px]:py-10',
			'max-[961px]:bg-[image:radial-gradient(600px_300px_at_100%_0%,rgb(124_92_255/0.18),transparent_70%),radial-gradient(500px_300px_at_0%_100%,rgb(255_77_157/0.1),transparent_70%)]'
		]}
	>
		<div class="w-full max-w-[400px]">
			<div class="mb-8 hidden max-[961px]:block">
				<Logo />
			</div>

			<header class="mb-7">
				<h1 class="mb-2 text-[28px] font-extrabold tracking-[-0.03em]">{title}</h1>
				<p class="text-fg-muted">{subtitle}</p>
			</header>

			{@render children()}

			{#if footer}
				<div class="mt-7 text-center text-[14px] text-fg-muted">{@render footer()}</div>
			{/if}
		</div>
	</main>
</div>
