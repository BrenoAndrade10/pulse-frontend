<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = { variant?: 'error' | 'success'; children: Snippet };

	let { variant = 'error', children }: Props = $props();

	const variants = {
		error: 'text-[#ffc2cd] bg-danger/8 border-danger/30',
		success: 'text-[#b8f5da] bg-success/8 border-success/30'
	};
</script>

<div
	class={['rounded-md border px-3.5 py-3 text-[13.5px]', variants[variant]]}
	role={variant === 'error' ? 'alert' : 'status'}
>
	{@render children()}
</div>
