<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		id: string;
		checked: boolean;
		name?: string;
		error?: string;
		children: Snippet;
	};

	let { id, checked = $bindable(false), name, error, children }: Props = $props();
</script>

<div>
	<label
		class="inline-flex cursor-pointer items-start gap-2.5 text-[13.5px] text-fg-muted select-none"
		for={id}
	>
		<input
			class="peer pointer-events-none absolute opacity-0"
			{id}
			{name}
			type="checkbox"
			bind:checked
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : undefined}
		/>
		<span
			class={[
				'mt-px grid size-4.5 shrink-0 place-items-center rounded-[5px] border bg-surface',
				'[transition:background_0.15s,border-color_0.15s]',
				error ? 'border-danger' : 'border-border-strong',
				'peer-checked:border-primary peer-checked:bg-primary peer-checked:[&_svg]:opacity-100',
				'peer-focus-visible:shadow-focus'
			]}
			aria-hidden="true"
		>
			<svg
				class="size-3 fill-none stroke-white stroke-3 opacity-0 [stroke-linecap:round] [stroke-linejoin:round] [transition:opacity_0.15s]"
				viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg
			>
		</span>
		<span>{@render children()}</span>
	</label>
	{#if error}
		<p class="mt-1.5 ml-7 text-[12.5px] text-danger" id="{id}-error">{error}</p>
	{/if}
</div>
