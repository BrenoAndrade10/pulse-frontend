<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title?: string;
		description?: string;
		/** Remove o padding do corpo (ex.: tabelas que encostam nas bordas). */
		flush?: boolean;
		id?: string;
		actions?: Snippet;
		children: Snippet;
	};

	let { title, description, flush = false, id, actions, children }: Props = $props();
</script>

<section class="min-w-0 rounded-lg border border-border bg-bg-elevated" {id}>
	{#if title || actions}
		<header class="flex items-start justify-between gap-4 px-5.5 pt-5">
			<div>
				{#if title}<h2 class="text-[15px] font-bold">{title}</h2>{/if}
				{#if description}<p class="mt-1 text-[13px] text-fg-muted">{description}</p>{/if}
			</div>
			{#if actions}<div class="flex shrink-0 gap-2">{@render actions()}</div>{/if}
		</header>
	{/if}
	<div class={flush ? 'pt-4' : 'px-5.5 pt-5 pb-5.5'}>
		{@render children()}
	</div>
</section>
