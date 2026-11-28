<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { Scenario, Step } from './scenarios';

	let {
		scenario,
		shown,
		status,
		manual,
		active,
		onplay,
		onreplay,
		onnext,
		onexplore
	}: {
		scenario: Scenario;
		shown: number;
		status: 'preview' | 'running' | 'done';
		manual: boolean;
		active: boolean;
		onplay: () => void;
		onreplay: () => void;
		onnext: () => void;
		onexplore: (step: Step) => void;
	} = $props();

	const total = $derived(scenario.steps.length);
	const lit = $derived(active ? shown : 0);
	const current = $derived(active && shown > 0 ? scenario.steps[shown - 1] : undefined);
</script>

<div class="cl-sx">
	<ol class="cl-sx-track" aria-label="Etapas: {scenario.name}">
		{#each scenario.steps as step, index (step.id)}
			<li
				class="cl-sx-step"
				class:is-lit={index < lit}
				class:is-now={active && status === 'running' && index === lit - 1}
				class:is-link={index + 1 < lit}
				class:is-final={index === total - 1}
			>
				<button type="button" onclick={() => onexplore(step)}>
					<span class="cl-sx-top">
						<span class="cl-sx-ico"><Icon name={step.icon} size={18} /></span>
						<small class="cl-sx-num">{index + 1}</small>
					</span>
					<b>{step.title}</b>
					<span class="cl-sx-effect">{step.effect}</span>
					<span class="cl-sx-ev">
						{#each step.evidence as item, position (position)}
							{#if item.kind === 'chip'}
								<span class="cl-sx-chip" data-tone={item.tone}>
									<em>{item.label}</em>{item.value}
								</span>
							{:else if item.kind === 'heat'}
								<span class="cl-sx-heat">
									<em>Heat</em>
									<span class="cl-sx-bar"><i style="width:{item.value}%"></i></span>
									<b>{item.value}</b>
								</span>
							{:else}
								<span class="cl-sx-msg">“{item.text}”</span>
							{/if}
						{/each}
					</span>
				</button>
			</li>
		{/each}
	</ol>

	<div class="cl-sx-bar-row">
		<p class="cl-sx-label">
			Demonstração conceitual — produto em desenvolvimento. Exemplos fictícios.
		</p>
		<div class="cl-sx-actions">
			{#if status === 'preview' || !active}
				<button type="button" class="cl-btn cl-btn-primary cl-btn-sm" onclick={onplay}>
					<Icon name="bolt" size={16} />Simular operação
				</button>
			{:else}
				{#if manual && status === 'running'}
					<button type="button" class="cl-btn cl-btn-primary cl-btn-sm" onclick={onnext}>
						Próximo passo
					</button>
				{/if}
				<button type="button" class="cl-btn cl-btn-ghost cl-btn-sm" onclick={onreplay}>
					<Icon name="repeat" size={16} />Reiniciar
				</button>
			{/if}
		</div>
	</div>
	<p class="cl-sr" aria-live="polite">
		{current ? `Passo ${shown} de ${total}: ${current.title}` : ''}
	</p>
</div>
