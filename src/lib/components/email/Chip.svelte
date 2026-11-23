<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'ok' | 'warn' | 'danger' | 'neutral' | 'primary';

	let {
		tone = 'neutral',
		dot = true,
		children
	}: { tone?: Tone; dot?: boolean; children: Snippet } = $props();

	const styles: Record<Tone, string> = {
		ok: 'bg-success/12 text-success',
		warn: 'bg-warning/12 text-warning',
		danger: 'bg-danger/12 text-danger',
		neutral: 'bg-white/7 text-fg-muted',
		primary: 'bg-primary/18 text-primary-hover'
	};
</script>

<span
	class={[
		'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12.5px] font-semibold whitespace-nowrap',
		styles[tone]
	]}
>
	{#if dot}<span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>{/if}
	{@render children()}
</span>
