<script lang="ts">
	type Option = { id: string; label: string; hint?: string; badge?: string; accent?: string };

	let {
		mode,
		id,
		label,
		options,
		value,
		onchoose,
		variant = 'pills'
	}: {
		mode: 'tabs' | 'radio';
		id: string;
		label: string;
		options: Option[];
		value: string;
		onchoose: (optionId: string) => void;
		variant?: 'pills' | 'cards';
	} = $props();

	let buttons: HTMLButtonElement[] = $state([]);

	const onkey = (event: KeyboardEvent, index: number) => {
		const last = options.length - 1;
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
			next = index === last ? 0 : index + 1;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
			next = index === 0 ? last : index - 1;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = last;
		if (next < 0) return;
		event.preventDefault();
		buttons[next]?.focus();
		onchoose(options[next].id);
	};
</script>

<div
	class="cl-choice cl-choice-{variant}"
	role={mode === 'tabs' ? 'tablist' : 'radiogroup'}
	aria-label={label}
>
	{#each options as option, index (option.id)}
		{@const selected = option.id === value}
		<button
			type="button"
			class="cl-choice-item"
			class:is-on={selected}
			style={option.accent
				? `--cl-accent:${option.accent};--cl-accent-soft:${option.accent}26`
				: undefined}
			role={mode === 'tabs' ? 'tab' : 'radio'}
			id="{id}-{mode === 'tabs' ? 'tab' : 'opt'}-{option.id}"
			aria-selected={mode === 'tabs' ? selected : undefined}
			aria-checked={mode === 'radio' ? selected : undefined}
			aria-controls={mode === 'tabs' ? `${id}-panel` : undefined}
			tabindex={selected ? 0 : -1}
			bind:this={buttons[index]}
			onclick={() => onchoose(option.id)}
			onkeydown={(event) => onkey(event, index)}
		>
			<span class="cl-choice-label">{option.label}</span>
			{#if option.hint}<small class="cl-choice-hint">{option.hint}</small>{/if}
			{#if option.badge}<em class="cl-tag">{option.badge}</em>{/if}
		</button>
	{/each}
</div>
