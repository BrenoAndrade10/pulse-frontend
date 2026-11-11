<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import Icon, { type IconName } from './Icon.svelte';

	type Option = { value: string; label: string };

	type Props = Omit<HTMLSelectAttributes, 'value'> & {
		id: string;
		label?: string;
		value: string;
		options: Option[];
		error?: string;
		leadingIcon?: IconName;
	};

	let { id, label, value = $bindable(''), options, error, leadingIcon, ...rest }: Props = $props();
</script>

<div class="flex min-w-0 flex-col gap-1.5">
	{#if label}<label class="text-[13px] font-semibold text-fg-muted" for={id}>{label}</label>{/if}
	<div class="relative">
		<select
			class={[
				'h-10.5 w-full cursor-pointer appearance-none rounded-md border bg-surface pr-9.5',
				leadingIcon ? 'pl-10' : 'pl-3.5',
				'text-[14px] text-fg [transition:border-color_0.15s]',
				// O reset do Tailwind força opacity: 1; o visual antigo vinha do padrão do navegador.
				'disabled:opacity-70',
				error
					? 'border-danger'
					: 'border-border hover:border-border-strong focus-visible:border-primary'
			]}
			{id}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={error ? `${id}-error` : undefined}
			{...rest}
		>
			{#each options as option (option.value)}
				<option class="bg-surface" value={option.value}>{option.label}</option>
			{/each}
		</select>
		{#if leadingIcon}
			<Icon
				name={leadingIcon}
				size={16}
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-fg-subtle"
			/>
		{/if}
		<svg
			class="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 fill-none stroke-fg-subtle stroke-2"
			viewBox="0 0 24 24"
			aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg
		>
	</div>
	{#if error}<p class="text-[12.5px] text-danger" id="{id}-error">{error}</p>{/if}
</div>
