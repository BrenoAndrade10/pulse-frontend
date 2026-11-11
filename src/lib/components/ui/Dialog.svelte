<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte';

	type Props = {
		open?: boolean;
		title: string;
		description?: string;
		size?: 'sm' | 'md' | 'lg';
		dismissible?: boolean;
		onclose?: () => void;
		onsubmit?: (event: SubmitEvent) => void | Promise<void>;
		header?: Snippet<[string]>;
		children: Snippet;
		footer?: Snippet;
	};

	let {
		open = $bindable(false),
		title,
		description,
		size = 'md',
		dismissible = true,
		onclose,
		onsubmit,
		header,
		children,
		footer
	}: Props = $props();

	const componentId = $props.id();
	let dialog = $state<HTMLDialogElement>();
	let previouslyFocused: HTMLElement | null = null;
	const widths = {
		sm: 'w-[min(440px,calc(100vw-32px))]',
		md: 'w-[min(600px,calc(100vw-32px))]',
		lg: 'w-[min(760px,calc(100vw-32px))]'
	};
	const titleId = `${componentId}-title`;
	const descriptionId = `${componentId}-description`;

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			previouslyFocused =
				document.activeElement instanceof HTMLElement ? document.activeElement : null;
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	function handleCancel(event: Event) {
		if (!dismissible) event.preventDefault();
	}

	function handleClose() {
		open = false;
		onclose?.();
		previouslyFocused?.focus();
		previouslyFocused = null;
	}

	function handleBackdropClick(event: MouseEvent) {
		if (dismissible && event.target === dialog) open = false;
	}

	function closeOnDestroy() {
		if (dialog?.open) dialog.close();
	}

	onDestroy(closeOnDestroy);
</script>

<dialog
	class={`m-auto open:flex open:max-h-[calc(100dvh-2rem)] open:flex-col ${widths[size]} overflow-hidden rounded-lg border border-border-strong bg-bg-elevated p-0 text-fg backdrop:bg-[rgb(5_5_10/0.72)] max-[420px]:max-h-[calc(100dvh-1rem)]`}
	bind:this={dialog}
	aria-label={header ? title : undefined}
	aria-labelledby={header ? undefined : titleId}
	aria-describedby={description ? descriptionId : undefined}
	oncancel={handleCancel}
	onclose={handleClose}
	onclick={handleBackdropClick}
>
	{#snippet dialogContent()}
		{#if header}{@render header(titleId)}{:else}<header
				class="border-b border-border px-6 py-5 max-[420px]:px-4"
			>
				<h2 id={titleId} class="text-[20px] font-bold">{title}</h2>
				{#if description}<p id={descriptionId} class="mt-1 text-[13px] text-fg-muted">
						{description}
					</p>{/if}
			</header>{/if}
		<div class="min-h-0 flex-1 overflow-y-auto px-6 py-5 max-[420px]:px-4">
			{@render children()}
		</div>
		{#if footer}<footer
				class="flex flex-wrap justify-end gap-2 border-t border-border px-6 py-4 max-[420px]:px-4"
			>
				{@render footer()}
			</footer>{/if}
	{/snippet}
	{#if onsubmit}
		<form class="flex min-h-0 flex-1 flex-col" novalidate {onsubmit}>
			{@render dialogContent()}
		</form>
	{:else}
		<div class="flex min-h-0 flex-1 flex-col">
			{@render dialogContent()}
		</div>
	{/if}
</dialog>
