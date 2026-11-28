<script lang="ts">
	import { onMount } from 'svelte';
	import '../styles/strategies.css';
	import { section, track } from '../analytics/index.ts';
	import type { OperationType } from '../contract.ts';
	import IntermediateCta from './IntermediateCta.svelte';
	import { prefersReducedMotion, reveal, watchVisible } from './motion';
	import SegmentedControl from './strategies/SegmentedControl.svelte';
	import StrategyDemo from './strategies/StrategyDemo.svelte';
	import { scenarios, type Step } from './strategies/scenarios';

	const STEP_MS = 1500;
	const DEMO = 'strategy_simulation' as const;

	let op = $state<OperationType>('paid_launch');
	let shown = $state(0);
	let status = $state<'preview' | 'running' | 'done'>('preview');
	let manual = $state(false);

	let runId = 0;
	let startedAt = 0;
	let maxStep = 0;
	let onScreen = true;
	let timer: ReturnType<typeof setTimeout> | undefined;

	const scenario = $derived(scenarios.find((item) => item.id === op) ?? scenarios[0]);

	onMount(() => {
		manual = prefersReducedMotion();
		return () => clearTimeout(timer);
	});

	const schedule = () => {
		clearTimeout(timer);
		if (!onScreen || status !== 'running') return;
		timer = setTimeout(advance, STEP_MS);
	};

	function advance() {
		const total = scenario.steps.length;
		shown += 1;
		if (shown > maxStep) {
			maxStep = shown;
			track('DemoProgress', {
				demoType: DEMO,
				operationType: op,
				scenario: scenario.scenario,
				step: shown,
				maxStep,
				totalSteps: total,
				value: runId
			});
		}
		if (shown >= total) {
			status = 'done';
			track('DemoCompleted', {
				demoType: DEMO,
				operationType: op,
				scenario: scenario.scenario,
				durationMs: Date.now() - startedAt,
				maxStep,
				totalSteps: total,
				value: runId
			});
			return;
		}
		if (!manual) schedule();
	}

	const begin = (replay: boolean) => {
		clearTimeout(timer);
		runId += 1;
		shown = 0;
		maxStep = 0;
		startedAt = Date.now();
		status = 'running';
		if (replay) {
			track('DemoReplay', {
				demoType: DEMO,
				operationType: op,
				scenario: scenario.scenario,
				ctaSource: 'strategies_replay',
				value: runId
			});
		} else {
			track('DemoPlay', {
				demoType: DEMO,
				operationType: op,
				scenario: scenario.scenario,
				ctaSource: 'strategies_simulate',
				totalSteps: scenario.steps.length,
				value: runId
			});
		}
		if (manual) {
			advance();
			return;
		}
		timer = setTimeout(advance, 400);
	};

	const visibility = (visible: boolean) => {
		onScreen = visible;
		if (!visible) clearTimeout(timer);
		else if (status === 'running' && !manual) schedule();
	};

	const choose = (id: string) => {
		const found = scenarios.find((item) => item.id === id);
		if (!found || found.id === op) return;
		clearTimeout(timer);
		shown = 0;
		maxStep = 0;
		status = 'preview';
		op = found.id;
		track('OperationTypeSelected', { operationType: found.id, scenario: found.scenario });
	};

	const explore = (step: Step) => {
		track('FeatureExplore', {
			featureId: step.feature,
			operationType: op,
			scenario: scenario.scenario,
			detail: step.id
		});
	};
</script>

<section
	class="cl-sec cl-a-strat"
	id="estrategias"
	tabindex="-1"
	aria-labelledby="cl-strat-title"
	use:section={{ id: 'strategies' }}
>
	<div class="cl-wrap">
		<header class="cl-head" use:reveal>
			<p class="cl-eyebrow">NA PRÁTICA</p>
			<h2 id="cl-strat-title">Imagine a Pulse trabalhando na sua operação.</h2>
			<p class="cl-sub">
				Escolha sua estratégia e descubra como dados, inteligência e automações podem trabalhar
				juntos.
			</p>
		</header>

		<div class="cl-st" style="--cl-accent:{scenario.accent};--cl-accent-soft:{scenario.accent}26">
			<SegmentedControl
				id="cl-op"
				label="Tipo de operação"
				options={scenarios.map(({ id, label }) => ({ id, label }))}
				value={op}
				onchoose={choose}
			/>

			<div class="cl-st-grid">
				<div class="cl-st-stack">
					{#each scenarios as item (item.id)}
						<article
							class="cl-st-ctx"
							class:is-on={item.id === op}
							aria-hidden={item.id === op ? undefined : 'true'}
							style="--cl-accent:{item.accent};--cl-accent-soft:{item.accent}26"
						>
							<p class="cl-st-name">{item.name}</p>
							<h3>{item.title}</h3>
							<p class="cl-st-text">{item.context}</p>
							<div class="cl-st-benefit">
								<small>Benefício operacional</small>
								<p>{item.benefit}</p>
							</div>
						</article>
					{/each}
				</div>

				<div
					class="cl-st-demo cl-st-stack"
					use:watchVisible={{ onchange: visibility, threshold: 0.25 }}
				>
					{#each scenarios as item (item.id)}
						<div
							class="cl-st-pane"
							class:is-on={item.id === op}
							aria-hidden={item.id === op ? undefined : 'true'}
							style="--cl-accent:{item.accent};--cl-accent-soft:{item.accent}26"
						>
							<StrategyDemo
								scenario={item}
								active={item.id === op}
								{shown}
								{status}
								{manual}
								onplay={() => begin(false)}
								onreplay={() => begin(true)}
								onnext={advance}
								onexplore={explore}
							/>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<IntermediateCta
			label="Conhecer os planos"
			kind="pricing"
			target="planos"
			ctaSource="strategies_cta"
		/>
	</div>
</section>
