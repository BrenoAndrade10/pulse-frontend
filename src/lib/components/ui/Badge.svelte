<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';
	import type { BadgeVariant } from '#lib/utils/facebook.js';

	let {
		variant = 'neutral',
		class: className,
		children
	}: { variant?: BadgeVariant; class?: ClassValue; children: Snippet } = $props();

	const variants: Record<BadgeVariant, string> = {
		neutral: 'text-fg-muted bg-white/4 border-border',
		success: 'text-success bg-success/8 border-success/30',
		warning: 'text-warning bg-warning/8 border-warning/30',
		danger: 'text-danger bg-danger/8 border-danger/30'
	};
</script>

<span
	class={[
		'badge',
		'inline-flex items-center gap-1.5 rounded-[999px] border px-2.5 py-[3px]',
		'text-[12px] font-semibold whitespace-nowrap',
		variants[variant],
		className
	]}
>
	<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>
	{@render children()}
</span>
