<script lang="ts">
	import { untrack } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { page } from '$app/state';
	import ContextBar from '#lib/components/app/ContextBar.svelte';
	import Logo from '#lib/components/auth/Logo.svelte';
	import Sidebar from '#lib/components/app/Sidebar.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { auth } from '#lib/auth/session.svelte.js';
	import { loginPathFor } from '#lib/utils/redirect.js';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	let menuOpen = $state(false);

	// Sessão encerrada durante o uso (logout, expiração, logout em outra aba).
	$effect(() => {
		if (auth.status !== 'anonymous') return;

		const target =
			auth.endReason === 'expired'
				? `${loginPathFor(untrack(() => `${page.url.pathname}${page.url.search}`))}&expired=1`
				: '/login';

		void goto(target, { replaceState: true });
	});

	afterNavigate(() => {
		menuOpen = false;
	});
</script>

<svelte:window onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)} />

<div class="grid min-h-dvh grid-cols-[260px_minmax(0,1fr)] max-lg:grid-cols-[minmax(0,1fr)]">
	<Sidebar open={menuOpen} onclose={() => (menuOpen = false)} />

	<div
		class="min-w-0 [background:radial-gradient(900px_400px_at_100%_-10%,rgb(124_92_255/0.08),transparent_70%),var(--color-bg)]"
	>
		<header
			class={[
				'hidden max-lg:sticky max-lg:top-0 max-lg:z-30 max-lg:flex max-lg:h-15 max-lg:items-center max-lg:gap-3 max-lg:px-4',
				'max-lg:border-b max-lg:border-border max-lg:bg-[rgb(10_10_18/0.85)] max-lg:backdrop-blur-[10px]'
			]}
		>
			<button
				type="button"
				class="grid size-10 cursor-pointer place-items-center rounded-sm border border-border bg-surface text-fg"
				onclick={() => (menuOpen = true)}
				aria-label="Abrir menu"
			>
				<Icon name="menu" size={20} />
			</button>
			<Logo />
		</header>

		<ContextBar
			experts={data.experts}
			launches={data.launches}
			expertId={data.selectedExpertId}
			launchId={data.selectedLaunchId}
		/>

		<main class="mx-auto max-w-[1320px] px-10 pt-7 pb-14 max-lg:px-4 max-lg:pt-6 max-lg:pb-10">
			{#if data.expertsBackendUnavailable}
				<div class="mb-5">
					<Alert>Não foi possível carregar os experts. Verifique o backend e tente novamente.</Alert
					>
				</div>
			{/if}
			{@render children()}
		</main>
	</div>
</div>
