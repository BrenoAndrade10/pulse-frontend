<script lang="ts">
	import Dialog from '#lib/components/ui/Dialog.svelte';
	import type { Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title: string;
		description?: string;
		dismissible?: boolean;
		onclose?: () => void;
		onsubmit?: (event: SubmitEvent) => void | Promise<void>;
		children: Snippet;
		footer?: Snippet;
	};

	let {
		open = $bindable(false),
		title,
		description,
		dismissible = true,
		onclose,
		onsubmit,
		children,
		footer
	}: Props = $props();
	const footerContent = $derived(footer);
</script>

<Dialog bind:open {title} {description} {dismissible} {onclose} {onsubmit}>
	{@render children()}
	{#snippet footer()}{@render footerContent?.()}{/snippet}
</Dialog>
