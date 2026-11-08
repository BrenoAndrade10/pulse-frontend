<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import '../app.css';
	import { i18n } from '#lib/i18n/index.svelte.js';
	import { INSTAGRAM_OAUTH_CHANNEL, isInstagramOAuthResult } from '#lib/services/experts.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		i18n.init();

		const channel = new BroadcastChannel(INSTAGRAM_OAUTH_CHANNEL);

		channel.addEventListener('message', (event) => {
			if (isInstagramOAuthResult(event.data)) void invalidateAll();
		});

		return () => channel.close();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" sizes="32x32" href="/brand/favicon-32.png" />
	<link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
</svelte:head>

{@render children()}
