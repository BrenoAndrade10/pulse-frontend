<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = Omit<HTMLInputAttributes, 'value'> & {
		id: string;
		label: string;
		value: string;
		error?: string;
		hint?: string;
	};

	let { id, label, value = $bindable(''), error, hint, type = 'text', ...rest }: Props = $props();

	let revealed = $state(false);
	const isPassword = $derived(type === 'password');
	const inputType = $derived(isPassword && revealed ? 'text' : type);
	const describedBy = $derived(error ? `${id}-error` : hint ? `${id}-hint` : undefined);
</script>

<div class="flex flex-col gap-1.5">
	<label class="text-[13px] font-semibold text-fg-muted" for={id}>{label}</label>
	<div
		class={[
			'relative flex items-center rounded-md border bg-surface focus-within:bg-surface-hover',
			'[transition:border-color_0.15s,box-shadow_0.15s,background_0.15s]',
			error
				? 'border-danger focus-within:shadow-[0_0_0_3px_rgb(255_92_122/0.25)]'
				: 'border-border hover:not-focus-within:border-border-strong focus-within:border-primary focus-within:shadow-focus'
		]}
	>
		<input
			class={[
				'h-11.5 min-w-0 flex-1 border-0 bg-transparent px-3.5 text-fg outline-none',
				'placeholder:text-fg-subtle focus-visible:shadow-none',
				// Evita o fundo amarelo do autofill no tema dark
				'[&:-webkit-autofill]:caret-fg [&:-webkit-autofill]:[-webkit-text-fill-color:var(--color-fg)]',
				'[&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_1000px_var(--color-surface)_inset]'
			]}
			{id}
			type={inputType}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			{...rest}
		/>
		{#if isPassword}
			<button
				type="button"
				class="mr-[3px] grid size-10 cursor-pointer place-items-center rounded-sm border-0 bg-transparent text-fg-subtle hover:text-fg"
				onclick={() => (revealed = !revealed)}
				aria-label={revealed ? 'Ocultar senha' : 'Mostrar senha'}
				aria-pressed={revealed}
			>
				{#if revealed}
					<svg
						class="size-4.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path
							d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 5.1A9.8 9.8 0 0112 5c5 0 9 4.5 10 7a13 13 0 01-3.2 4.3M6.1 6.1A13.3 13.3 0 002 12c1 2.5 5 7 10 7a9.7 9.7 0 004.2-.9"
						/>
					</svg>
				{:else}
					<svg
						class="size-4.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round] [stroke-linejoin:round]"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" />
						<circle cx="12" cy="12" r="3" />
					</svg>
				{/if}
			</button>
		{/if}
	</div>
	{#if error}
		<p class="text-[12.5px] text-danger" id="{id}-error">{error}</p>
	{:else if hint}
		<p class="text-[12.5px] text-fg-subtle" id="{id}-hint">{hint}</p>
	{/if}
</div>
