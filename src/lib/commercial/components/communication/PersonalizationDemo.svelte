<script lang="ts">
	import { onMount } from 'svelte';
	import { track } from '../../analytics/index.ts';
	import Choice from '../Choice.svelte';
	import Icon from '../Icon.svelte';
	import { LEADS, MESSAGE_MODELS, fill } from '../messages';
	import PhoneChat, { type PhoneMessage } from '../PhoneChat.svelte';
	import { prefersReducedMotion, reveal } from '../motion';

	const DEMO = 'message_personalization';
	const ORDER = ['primeiro_nome', 'horario', 'tema_da_aula'];
	const STEP_MS = 640;
	const model = MESSAGE_MODELS.variables_model;
	const leadOptions = LEADS.map((lead) => ({ id: lead.id, label: lead.firstName }));

	let filled = $state(0);
	let runs = $state(0);
	let running = $state(false);
	let active = $state(LEADS[0].id);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let runId = 0;
	let startedAt = 0;

	onMount(() => () => timers.forEach(clearTimeout));

	const messageFor = (index: number): PhoneMessage => ({
		id: 'variables-model',
		from: 'brand',
		text: '',
		time: '08:00',
		rich: {
			paragraphs: model.paragraphs.map((paragraph) =>
				fill(paragraph, LEADS[index].values, (variable) => ORDER.indexOf(variable) < filled)
			),
			cta: model.cta
		}
	});

	const props = (extra: Record<string, number | string>) => ({
		demoType: DEMO as typeof DEMO,
		scenario: 'whatsapp_personalization' as const,
		totalSteps: ORDER.length,
		...extra
	});

	const personalize = () => {
		if (running) return;
		timers.forEach(clearTimeout);
		runId += 1;
		startedAt = Date.now();
		const replay = runs > 0;
		runs += 1;
		filled = 0;
		track(replay ? 'DemoReplay' : 'DemoPlay', {
			...props({}),
			ctaSource: 'communication_personalize',
			value: runId
		});
		const reach = (step: number) => {
			filled = step;
			track('DemoProgress', { ...props({ step, maxStep: step }), value: runId });
			if (step === ORDER.length) {
				running = false;
				track('DemoCompleted', {
					...props({ maxStep: step }),
					durationMs: Date.now() - startedAt,
					value: runId
				});
			}
		};
		running = true;
		if (prefersReducedMotion()) {
			ORDER.forEach((_, index) => reach(index + 1));
			return;
		}
		timers = ORDER.map((_, index) => setTimeout(() => reach(index + 1), (index + 1) * STEP_MS));
	};

	const chooseLead = (id: string) => {
		active = id;
		track('FeatureExplore', {
			featureId: 'whatsapp',
			scenario: 'whatsapp_personalization',
			detail: 'lead_change'
		});
	};
</script>

<div class="cl-card cl-pz" use:reveal>
	<div class="cl-pz-top">
		<div class="cl-pz-copy">
			<p class="cl-pz-title">
				Um modelo. Uma versão para cada lead. <em class="cl-tag">Prévia conceitual</em>
			</p>
			<p class="cl-pz-sub">O mesmo modelo, com os dados de cada lead.</p>
		</div>
		<button
			type="button"
			class="cl-btn cl-btn-primary cl-btn-sm"
			onclick={personalize}
			disabled={running}
		>
			<Icon name="spark" size={16} />{runs > 0 && !running
				? 'Personalizar de novo'
				: 'Personalizar para 3 leads'}
		</button>
	</div>

	<div class="cl-pz-tabs">
		<Choice
			mode="radio"
			id="cl-pz-lead"
			label="Lead de exemplo"
			options={leadOptions}
			value={active}
			onchoose={chooseLead}
		/>
	</div>

	<div class="cl-pz-grid">
		{#each LEADS as lead, index (lead.id)}
			<div class="cl-pz-col" class:is-off={lead.id !== active}>
				<p class="cl-pz-lead"><i aria-hidden="true"></i>{lead.firstName}</p>
				<PhoneChat channel="whatsapp" compact bare label="" messages={[messageFor(index)]} />
			</div>
		{/each}
	</div>
</div>
