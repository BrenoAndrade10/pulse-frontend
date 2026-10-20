<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { INSTAGRAM_OAUTH_CHANNEL, isInstagramOAuthResult } from '#lib/services/experts.js';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	onMount(() => {
		const channel = new BroadcastChannel(INSTAGRAM_OAUTH_CHANNEL);

		channel.addEventListener('message', (event) => {
			if (isInstagramOAuthResult(event.data)) void invalidateAll();
		});

		return () => channel.close();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
