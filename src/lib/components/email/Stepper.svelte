<script lang="ts">
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';

	type StepItem = { id: number; title: string; hint: string; label: string; icon: IconName };

	let {
		steps,
		current,
		ariaLabel,
		onselect
	}: {
		steps: StepItem[];
		current: number;
		ariaLabel: string;
		onselect: (id: number) => void;
	} = $props();

	const progress = $derived(steps.length > 1 ? ((current - 1) / (steps.length - 1)) * 100 : 0);
</script>

<nav
	class="mb-6 rounded-lg border border-border bg-bg-elevated px-4 py-5 sm:px-8 sm:py-6"
	aria-label={ariaLabel}
>
	<ol class="grid" style="grid-template-columns: repeat({steps.length}, minmax(0, 1fr));">
		{#each steps as item, index (item.id)}
			{@const done = item.id < current}
			{@const active = item.id === current}
			<li class="relative">
				{#if index < steps.length - 1}
					<span
						class="absolute top-5 left-[calc(50%+1.75rem)] h-0.5 w-[calc(100%-3.5rem)] overflow-hidden rounded-full bg-border"
						aria-hidden="true"
					>
						<span
							class="block h-full rounded-full bg-linear-to-r from-primary to-brand-mid [transition:width_0.4s_ease]"
							style="width: {done ? 100 : 0}%"
						></span>
					</span>
				{/if}
				<button
					type="button"
					class="group relative flex w-full cursor-pointer flex-col items-center gap-2.5 rounded-md px-1 text-center focus-visible:shadow-focus disabled:cursor-default"
					aria-current={active ? 'step' : undefined}
					disabled={item.id > current}
					onclick={() => onselect(item.id)}
				>
					<span
						class={[
							'grid size-10 place-items-center rounded-full border-2 text-[14px] font-extrabold',
							'[transition:background_0.25s,border-color_0.25s,box-shadow_0.25s,transform_0.25s]',
							done && 'border-primary bg-primary text-white group-hover:bg-primary-hover',
							active &&
								'scale-110 border-primary bg-primary/18 text-primary-hover shadow-[0_0_0_6px_rgb(124_92_255/0.14)]',
							!done && !active && 'border-border bg-surface text-fg-subtle'
						]}
					>
						{#if done}
							<Icon name="check" size={18} />
						{:else if active}
							<Icon name={item.icon} size={18} />
						{:else}
							{item.id}
						{/if}
					</span>
					<span class="grid gap-0.5">
						<span
							class={[
								'text-[11px] font-bold tracking-[0.08em] uppercase max-sm:hidden',
								active ? 'text-primary-hover' : 'text-fg-subtle'
							]}
						>
							{item.label}
						</span>
						<span
							class={[
								'text-[13px] leading-tight font-bold sm:text-[15px]',
								active || done ? 'text-fg' : 'text-fg-muted'
							]}
						>
							{item.title}
						</span>
						<span class="text-[12.5px] text-fg-muted max-md:hidden">{item.hint}</span>
					</span>
				</button>
			</li>
		{/each}
	</ol>
	<div
		class="mt-5 h-1 overflow-hidden rounded-full bg-border sm:hidden"
		role="presentation"
		aria-hidden="true"
	>
		<div
			class="h-full rounded-full bg-linear-to-r from-primary to-brand-mid [transition:width_0.4s_ease]"
			style="width: {progress}%"
		></div>
	</div>
</nav>
