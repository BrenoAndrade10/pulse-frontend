<script lang="ts">
	import { onMount } from 'svelte';
	import { section, track } from '../analytics/index.ts';
	import Icon from './Icon.svelte';
	import { prefersReducedMotion, reveal, whenVisible } from './motion';
	import '../styles/problem.css';

	type Mode = 'fragmented' | 'connected';

	const modes: { id: Mode; label: string }[] = [
		{ id: 'fragmented', label: 'Operação fragmentada' },
		{ id: 'connected', label: 'Operação conectada' }
	];

	const fragmented = [
		{ icon: 'chart', title: 'Ferramenta de tracking', text: 'Consulta os acessos' },
		{ icon: 'cart', title: 'Gateway de pagamento', text: 'Verifica as vendas' },
		{ icon: 'grid', title: 'Planilha', text: 'Exporta os dados' },
		{ icon: 'filter', title: 'Segmentação', text: 'Cria a lista de leads' },
		{ icon: 'send', title: 'Outra ferramenta', text: 'Dispara as mensagens' }
	];

	const connected = [
		{ icon: 'database', title: 'Dados conectados', text: 'Acessos, vendas e cadastros juntos' },
		{ icon: 'flame', title: 'Comportamento interpretado', text: 'Pulse Heat lê os sinais' },
		{ icon: 'target', title: 'Oportunidade identificada', text: 'Lead pronto para abordagem' },
		{ icon: 'chat', title: 'Comunicação acionável', text: 'Mensagem enviada pela Pulse' }
	];

	let mode = $state<Mode>('fragmented');
	let touched = false;
	let timer: ReturnType<typeof setTimeout> | undefined;
	let buttons: HTMLButtonElement[] = $state([]);

	onMount(() => () => clearTimeout(timer));

	const autoplay = () => {
		if (prefersReducedMotion()) return;
		timer = setTimeout(() => {
			if (!touched) mode = 'connected';
		}, 1600);
	};

	const choose = (next: Mode) => {
		touched = true;
		clearTimeout(timer);
		if (next === mode) return;
		mode = next;
		track('FeatureExplore', { scenario: 'problem_comparison', detail: next });
	};

	const onkey = (event: KeyboardEvent, current: number) => {
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (current + 1) % 2;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (current + 1) % 2;
		else if (event.key === 'Home') next = 0;
		else if (event.key === 'End') next = 1;
		if (next < 0) return;
		event.preventDefault();
		buttons[next]?.focus();
		choose(modes[next].id);
	};
</script>

<section
	class="cl-sec cl-problem cl-a-problem"
	id="problema"
	tabindex="-1"
	aria-labelledby="cl-problem-title"
	use:section={{ id: 'problem' }}
>
	<div class="cl-wrap">
		<header class="cl-pc-head" use:reveal>
			<div>
				<p class="cl-eyebrow">O PROBLEMA</p>
				<h2 id="cl-problem-title">
					Você não precisa de mais ferramentas. Precisa que elas trabalhem juntas.
				</h2>
			</div>
			<div class="cl-pc-seg" role="radiogroup" aria-label="Comparar a operação">
				<span class="cl-pc-ind" aria-hidden="true" style="--i:{mode === 'connected' ? 1 : 0}"
				></span>
				{#each modes as item, position (item.id)}
					<button
						type="button"
						role="radio"
						class="cl-pc-opt"
						class:is-on={mode === item.id}
						aria-checked={mode === item.id}
						tabindex={mode === item.id ? 0 : -1}
						bind:this={buttons[position]}
						onclick={() => choose(item.id)}
						onkeydown={(event) => onkey(event, position)}>{item.label}</button
					>
				{/each}
			</div>
		</header>

		<div
			class="cl-pc-stage"
			class:is-connected={mode === 'connected'}
			use:reveal={{ delay: 100 }}
			use:whenVisible={{ onenter: autoplay, threshold: 0.5 }}
		>
			<ol class="cl-pc-flow cl-pc-frag" inert={mode !== 'fragmented'}>
				{#each fragmented as item, index (item.title)}
					<li class="cl-pc-item" style="--k:{index}">
						<div class="cl-pc-win">
							<span class="cl-pc-n">{index + 1}</span>
							<span class="cl-pc-ico"><Icon name={item.icon} size={16} /></span>
							<div>
								<b>{item.title}</b>
								<small>{item.text}</small>
							</div>
						</div>
						{#if index < fragmented.length - 1}
							<span class="cl-pc-link" aria-hidden="true"><i></i><i></i></span>
						{/if}
					</li>
				{/each}
			</ol>
			<ol class="cl-pc-flow cl-pc-conn" inert={mode !== 'connected'}>
				{#each connected as item, index (item.title)}
					<li class="cl-pc-item" style="--k:{index}">
						<div class="cl-pc-win">
							<span class="cl-pc-n">{index + 1}</span>
							<span class="cl-pc-ico"><Icon name={item.icon} size={16} /></span>
							<div>
								<b>{item.title}</b>
								<small>{item.text}</small>
							</div>
						</div>
						{#if index < connected.length - 1}
							<span class="cl-pc-link" aria-hidden="true"><i></i><i></i></span>
						{/if}
					</li>
				{/each}
			</ol>
		</div>

		<p class="cl-pc-cap" aria-live="polite">
			<span>
				{mode === 'fragmented'
					? '5 ferramentas e etapas manuais: os dados e as ações não se conectam.'
					: 'Do dado à comunicação, no mesmo ecossistema.'}
			</span>
			<small>Ilustração conceitual.</small>
		</p>
	</div>
</section>
