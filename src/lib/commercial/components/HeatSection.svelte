<script lang="ts">
	import { onMount } from 'svelte';
	import { section, track } from '../analytics/index.ts';
	import Icon from './Icon.svelte';
	import IntermediateCta from './IntermediateCta.svelte';
	import { prefersReducedMotion, reveal, watchVisible } from './motion';
	import '../styles/heat.css';

	const stages = [
		{ score: 35, label: 'Entrou pela captura', reached: 2 },
		{ score: 52, label: 'Clicou e abriu mensagens', reached: 4 },
		{ score: 75, label: 'Voltou à página da oferta', reached: 6 }
	];

	const leads = [
		{
			name: 'Lucas',
			score: 28,
			band: 'cold',
			signal: 'Realizou o cadastro recentemente',
			action: 'Conteúdo de boas-vindas'
		},
		{
			name: 'Camila',
			score: 54,
			band: 'warm',
			signal: 'Interagiu com conteúdos e comunicações',
			action: 'Lembrete + conteúdo'
		},
		{
			name: 'Mariana',
			score: 86,
			band: 'hot',
			signal: 'Retornou à oferta e iniciou o checkout',
			action: 'Contato direto da equipe'
		}
	];

	const bands = [
		{ id: 'cold', label: 'Frio', range: '0–39' },
		{ id: 'warm', label: 'Morno', range: '40–69' },
		{ id: 'hot', label: 'Quente', range: '70–100' }
	];

	const bandOf = (score: number) => (score < 40 ? 'cold' : score < 70 ? 'warm' : 'hot');
	const circumference = 2 * Math.PI * 52;
	const bandName = (id: string) => bands.find((item) => item.id === id)?.label ?? '';

	let step = $state(2);
	let shown = $state(75);
	let frame = 0;
	let timers: ReturnType<typeof setTimeout>[] = [];

	const band = $derived(bandOf(stages[step].score));
	const bandLabel = $derived(bands.find((item) => item.id === band)?.label ?? '');
	const offset = $derived(circumference * (1 - stages[step].score / 100));

	const STEP_MS = 1500;
	const TWEEN_MS = 1200;
	const history = 'M10 38 L100 26 L190 8';
	const dots = [
		{ x: 10, y: 38 },
		{ x: 100, y: 26 },
		{ x: 190, y: 8 }
	];

	let live = $state(false);
	let manual = false;

	const tween = (to: number) => {
		cancelAnimationFrame(frame);
		if (prefersReducedMotion()) {
			shown = to;
			return;
		}
		const from = shown;
		const start = performance.now();
		const tick = (now: number) => {
			const progress = Math.min(1, (now - start) / TWEEN_MS);
			shown = Math.round(from + (to - from) * (1 - Math.pow(1 - progress, 3)));
			if (progress < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
	};

	const go = (index: number) => {
		step = index;
		tween(stages[index].score);
	};

	const stopAuto = () => {
		timers.forEach(clearTimeout);
		timers = [];
	};

	const play = () => {
		stopAuto();
		go(0);
		timers = [setTimeout(() => go(1), 1100), setTimeout(() => go(2), 1100 + STEP_MS)];
	};

	onMount(() => {
		if (!prefersReducedMotion()) {
			step = 0;
			shown = 35;
		}
		return () => {
			stopAuto();
			cancelAnimationFrame(frame);
		};
	});

	const visibility = (visible: boolean) => {
		live = visible;
		if (prefersReducedMotion()) return;
		if (visible) {
			if (!manual) play();
		} else {
			stopAuto();
		}
	};

	const pick = (index: number) => {
		manual = true;
		stopAuto();
		go(index);
		track('FeatureExplore', {
			featureId: 'pulse_heat',
			scenario: 'pulse_heat',
			detail: `score_${stages[index].score}`
		});
	};
	const replay = () => {
		manual = false;
		play();
		track('FeatureExplore', { featureId: 'pulse_heat', scenario: 'pulse_heat', detail: 'replay' });
	};
</script>

<section
	class="cl-sec cl-feature cl-a-heat"
	id="pulse-heat"
	tabindex="-1"
	aria-labelledby="cl-heat-title"
	use:section={{ id: 'pulse_heat', featureId: 'pulse_heat' }}
>
	<div class="cl-wrap">
		<div class="cl-ht-top">
			<div class="cl-ht-copy" use:reveal>
				<p class="cl-eyebrow">PULSE HEAT</p>
				<h2 id="cl-heat-title">Nem todos os seus leads precisam da mesma abordagem.</h2>
				<p class="cl-sub">
					Enquanto alguns leads estão conhecendo sua oferta, outros já demonstram sinais de
					interesse. O Pulse Heat transforma essas interações em inteligência para ajudar você a
					priorizar sua comunicação.
				</p>
			</div>

			<div
				class="cl-card cl-heat-demo cl-ht-demo"
				data-band={band}
				use:reveal={{ delay: 120 }}
				use:watchVisible={{ onchange: visibility, threshold: 0.55 }}
				class:is-live={live}
			>
				<div class="cl-ht-demo-head">
					<p class="cl-card-title">Evolução de um lead</p>
					<em class="cl-tag">Prévia conceitual</em>
				</div>

				<div class="cl-heat-top">
					<div class="cl-ring">
						<svg viewBox="0 0 120 120" aria-hidden="true">
							<circle class="cl-ring-track" cx="60" cy="60" r="52" />
							<circle
								class="cl-ring-arc"
								cx="60"
								cy="60"
								r="52"
								stroke-dasharray={circumference}
								stroke-dashoffset={offset}
							/>
						</svg>
						<div class="cl-ring-num"><b>{shown}</b><small>de 100</small></div>
					</div>
					<div class="cl-heat-state">
						<span class="cl-chip cl-chip-band">{bandLabel}</span>
						<p>{stages[step].label}</p>
						<button type="button" class="cl-link-btn" onclick={replay}>
							<Icon name="repeat" size={14} />Rever evolução
						</button>
					</div>
				</div>

				<p class="cl-sr" aria-live="polite">Pontuação {stages[step].score}, {bandLabel}.</p>

				<div class="cl-steps" role="group" aria-label="Momentos da evolução do lead">
					{#each stages as stage, index (stage.score)}
						<button
							type="button"
							class="cl-step"
							class:is-on={index === step}
							class:is-past={index < step}
							aria-pressed={index === step}
							onclick={() => pick(index)}
						>
							<b>{stage.score}</b><small>{stage.label}</small>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="cl-ht-leads" use:reveal>
			<p class="cl-ht-leads-label">
				<b>Três leads, três abordagens</b>
				<small
					>Prévia conceitual com dados fictícios. Exemplo de regra configurável: a pontuação indica
					interesse, não probabilidade de compra.</small
				>
			</p>
			<ul class="cl-ht-grid">
				{#each leads as lead (lead.name)}
					<li class="cl-ht-lead cl-ht-{lead.band}">
						<div class="cl-ht-lead-top">
							<b>{lead.name}</b>
							<span class="cl-ht-score"><b>{lead.score}</b> pontos · {bandName(lead.band)}</span>
						</div>
						<p class="cl-ht-signal">{lead.signal}</p>
						<p class="cl-ht-action"><Icon name="bolt" size={14} /><span>{lead.action}</span></p>
					</li>
				{/each}
			</ul>
		</div>

		<IntermediateCta
			label="Veja como transformar interesse em ação."
			kind="scroll"
			target="automacoes"
			ctaSource="heat_to_automations"
			featureId="behavioral_automations"
		/>
	</div>
</section>
