<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { buttonClass, type ButtonSize, type ButtonVariant } from './button.js';

	type Props = HTMLButtonAttributes & {
		variant?: ButtonVariant;
		size?: ButtonSize;
		fullWidth?: boolean;
		loading?: boolean;
		children: Snippet;
	};

	let {
		variant = 'primary',
		size = 'md',
		fullWidth = false,
		loading = false,
		disabled,
		type = 'button',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class={[buttonClass({ variant, size, fullWidth }), className]}
	disabled={disabled || loading}
	aria-busy={loading}
	{...rest}
>
	{#if loading}
		<span
			class="size-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
			aria-hidden="true"
		></span>
	{/if}
	{@render children()}
</button>
