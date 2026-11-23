<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type Item = { id: string; title: string; text: string; icon: string; meta?: string };

	let {
		items,
		panel,
		dark = false,
		interval = 5600,
		label
	}: {
		items: Item[];
		panel: Snippet<[string]>;
		dark?: boolean;
		interval?: number;
		label: string;
	} = $props();

	let active = $state('');
	let paused = $state(false);
	let visible = $state(false);
	let reduced = $state(false);
	let root: HTMLElement | undefined = $state();

	const running = $derived(visible && !paused && !reduced);
	const current = $derived(active || items[0]?.id || '');

	$effect(() => {
		if (!running) return;
		const id = current;
		const timer = setTimeout(() => {
			const index = items.findIndex((item) => item.id === id);
			active = items[(index + 1) % items.length].id;
		}, interval);
		return () => clearTimeout(timer);
	});

	function onKeydown(event: KeyboardEvent) {
		const keys = ['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'];
		if (!keys.includes(event.key)) return;
		event.preventDefault();
		const step = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1;
		const index = items.findIndex((item) => item.id === current);
		const next = items[(index + step + items.length) % items.length];
		active = next.id;
		root?.querySelector<HTMLButtonElement>(`[data-tab="${next.id}"]`)?.focus();
	}

	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
			threshold: 0.35
		});
		if (root) observer.observe(root);
		return () => observer.disconnect();
	});
</script>

<div
	class="ft"
	class:ft-dark={dark}
	bind:this={root}
	onmouseenter={() => (paused = true)}
	onmouseleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
	role="presentation"
>
	<div class="ft-tabs" role="tablist" aria-label={label} aria-orientation="vertical" tabindex="-1" onkeydown={onKeydown}>
		{#each items as item (item.id)}
			<button
				type="button"
				role="tab"
				class="ft-tab"
				class:active={current === item.id}
				aria-selected={current === item.id}
				tabindex={current === item.id ? 0 : -1}
				data-tab={item.id}
				onclick={() => (active = item.id)}
			>
				<span class="ft-tab-icon" aria-hidden="true"><Icon name={item.icon} size={20} /></span>
				<span class="ft-tab-copy">
					<strong>{item.title}</strong>
					<small>{item.text}</small>
				</span>
				{#if item.meta}<span class="ft-tab-meta">{item.meta}</span>{/if}
				{#if current === item.id}
					{#key running}
						<i class="ft-progress" class:run={running} style:animation-duration="{interval}ms"></i>
					{/key}
				{/if}
			</button>
		{/each}
	</div>
	<div class="ft-stage" role="tabpanel" aria-live="polite">
		{#key current}
			<div class="ft-panel">
				{@render panel(current)}
			</div>
		{/key}
	</div>
</div>
