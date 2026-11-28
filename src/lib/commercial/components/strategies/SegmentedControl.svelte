<script lang="ts">
	type Option = { id: string; label: string };

	let {
		id,
		label,
		options,
		value,
		onchoose
	}: {
		id: string;
		label: string;
		options: Option[];
		value: string;
		onchoose: (optionId: string) => void;
	} = $props();

	let buttons: HTMLButtonElement[] = $state([]);

	const index = $derived(
		Math.max(
			0,
			options.findIndex((option) => option.id === value)
		)
	);

	const onkey = (event: KeyboardEvent, current: number) => {
		const last = options.length - 1;
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
			next = current === last ? 0 : current + 1;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
			next = current === 0 ? last : current - 1;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = last;
		if (next < 0) return;
		event.preventDefault();
		buttons[next]?.focus();
		onchoose(options[next].id);
	};
</script>

<div class="cl-seg" role="radiogroup" aria-label={label} style="--n:{options.length};--i:{index}">
	<span class="cl-seg-ind" aria-hidden="true"></span>
	{#each options as option, position (option.id)}
		<button
			type="button"
			class="cl-seg-item"
			class:is-on={option.id === value}
			role="radio"
			id="{id}-{option.id}"
			aria-checked={option.id === value}
			tabindex={option.id === value ? 0 : -1}
			bind:this={buttons[position]}
			onclick={() => onchoose(option.id)}
			onkeydown={(event) => onkey(event, position)}
		>
			{option.label}
		</button>
	{/each}
</div>
