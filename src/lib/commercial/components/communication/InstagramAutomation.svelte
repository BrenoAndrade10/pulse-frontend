<script lang="ts">
	import { onMount } from 'svelte';
	import { track } from '../../analytics/index.ts';
	import Choice from '../Choice.svelte';
	import Icon from '../Icon.svelte';
	import {
		INSTAGRAM_DM,
		INSTAGRAM_KEYWORDS,
		LEADS,
		fill,
		type InstagramKeyword
	} from '../messages';
	import PhoneChat, { type PhoneMessage } from '../PhoneChat.svelte';
	import { prefersReducedMotion, reveal } from '../motion';
	import ChannelHead from './ChannelHead.svelte';

	const DEMO = 'instagram_automation';
	const STEP_MS = 760;
	const lead = LEADS[0];
	const keywordOptions = INSTAGRAM_KEYWORDS.map((word) => ({ id: word, label: word }));

	const steps = [
		'Usuário comenta a palavra',
		'Pulse identifica a palavra-chave configurada',
		'Automação acionada',
		'Mensagem privada enviada, conforme as permissões e políticas aplicáveis',
		'Usuário recebe o link rastreado',
		'Ao se cadastrar, a jornada pode ser associada à operação quando houver dados suficientes'
	];
	const trail = [
		{ label: 'Link rastreado', at: 5 },
		{ label: 'Página de captura', at: 6 },
		{ label: 'Jornada na Pulse', at: 6 },
		{ label: 'E-mail e WhatsApp', at: 6 }
	];

	let keyword = $state<InstagramKeyword>('AULA');
	let step = $state(0);
	let runs = $state(0);
	let running = $state(false);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let runId = 0;
	let startedAt = 0;

	onMount(() => () => timers.forEach(clearTimeout));

	const props = (extra: Record<string, number | string>) => ({
		demoType: DEMO as typeof DEMO,
		scenario: 'instagram_automation' as const,
		totalSteps: steps.length,
		...extra
	});

	const dm = $derived<PhoneMessage[]>(
		step >= 4
			? [
					{
						id: 'ig-dm',
						from: 'brand',
						text: '',
						time: 'agora',
						rich: {
							paragraphs: INSTAGRAM_DM.paragraphs.map((paragraph) => fill(paragraph, lead.values)),
							cta: INSTAGRAM_DM.cta
						}
					}
				]
			: []
	);

	const simulate = () => {
		if (running) return;
		timers.forEach(clearTimeout);
		runId += 1;
		startedAt = Date.now();
		const replay = runs > 0;
		runs += 1;
		step = 0;
		track(replay ? 'DemoReplay' : 'DemoPlay', {
			...props({}),
			ctaSource: 'instagram_simulate',
			value: runId
		});
		const reach = (next: number) => {
			step = next;
			track('DemoProgress', { ...props({ step: next, maxStep: next }), value: runId });
			if (next === steps.length) {
				running = false;
				track('DemoCompleted', {
					...props({ maxStep: next }),
					durationMs: Date.now() - startedAt,
					value: runId
				});
			}
		};
		running = true;
		if (prefersReducedMotion()) {
			steps.forEach((_, index) => reach(index + 1));
			return;
		}
		timers = steps.map((_, index) => setTimeout(() => reach(index + 1), (index + 1) * STEP_MS));
	};

	const chooseKeyword = (id: string) => {
		if (id === keyword) return;
		timers.forEach(clearTimeout);
		running = false;
		step = 0;
		keyword = id as InstagramKeyword;
		track('FeatureExplore', {
			featureId: 'instagram',
			scenario: 'instagram_keyword',
			detail: `keyword_${id.toLowerCase()}`
		});
	};
</script>

<div class="cl-sub-block cl-ch-block-ig">
	<ChannelHead
		channel="instagram"
		icon="instagram"
		kicker="Instagram · aquisição e relacionamento"
		title="Transforme interações em novas oportunidades."
		desc="Conecte suas publicações e transforme comentários e interações em oportunidades de relacionamento com seus leads."
	/>

	<div class="cl-card cl-ig" use:reveal>
		<div class="cl-ig-side">
			<div class="cl-ig-ctrl">
				<p class="cl-ig-label">
					Palavra-chave <em class="cl-tag">Prévia conceitual</em>
				</p>
				<div class="cl-ig-kw">
					<Choice
						mode="radio"
						id="cl-ig-kw"
						label="Palavra-chave do comentário"
						options={keywordOptions}
						value={keyword}
						onchoose={chooseKeyword}
					/>
				</div>
				<button
					type="button"
					class="cl-btn cl-btn-primary cl-btn-sm"
					onclick={simulate}
					disabled={running}
				>
					<Icon name="click" size={16} />{runs > 0 && !running
						? 'Simular de novo'
						: 'Simular interação'}
				</button>
			</div>

			<ol class="cl-ig-steps" aria-label="Sequência da automação">
				{#each steps as text, index (index)}
					<li class:is-done={step > index + 1} class:is-now={step === index + 1}>
						<b>{index + 1}</b>
						<span>{text}</span>
					</li>
				{/each}
			</ol>
			<p class="cl-ig-now" aria-live="polite">
				{step > 0
					? `${step}. ${steps[step - 1]}`
					: 'Escolha a palavra e toque em Simular interação.'}
			</p>
		</div>

		<div class="cl-ig-stage">
			<div class="cl-ig-pair">
				<figure class="cl-ig-post" aria-label="Publicação de exemplo no Instagram">
					<div class="cl-ig-post-top">
						<span class="cl-ig-av" aria-hidden="true"></span>
						<div>
							<b>@expert.exemplo</b>
							<small>Reels · conteúdo fictício</small>
						</div>
					</div>
					<div class="cl-ig-media" aria-hidden="true">
						<span class="cl-ig-play"></span>
						<strong>Aula gratuita</strong>
					</div>
					<p class="cl-ig-cap">
						Quer participar da minha próxima aula gratuita? Comente
						<mark class="cl-ig-kwmark">{keyword}</mark> que enviaremos o acesso no seu privado.
					</p>
					<div class="cl-ig-comment" class:is-on={step >= 1}>
						{#if step >= 1}
							<span class="cl-comment-avatar" aria-hidden="true"></span>
							<div>
								<b>mariana.exemplo</b>
								<p><mark class="cl-ig-kwmark">{keyword}</mark></p>
							</div>
							{#if step >= 2}<em class="cl-ig-seen"><Icon name="check" size={12} />detectada</em
								>{/if}
						{:else}
							<p class="cl-ig-hint">O comentário aparece aqui.</p>
						{/if}
					</div>
				</figure>

				<PhoneChat
					channel="instagram"
					compact
					label=""
					name="@expert.exemplo"
					status={step === 3 ? 'automação em andamento' : 'ativo agora'}
					messages={dm}
					typing={step === 3}
					emptyText={step >= 1 && step < 4 ? '' : 'A conversa privada aparece após a simulação.'}
				/>
			</div>

			<div class="cl-ig-trail" aria-label="Depois do envio">
				<p>A automação não termina no envio</p>
				<ol>
					{#each trail as node (node.label)}
						<li class:is-on={step >= node.at}>{node.label}</li>
					{/each}
				</ol>
			</div>
		</div>

		<p class="cl-ig-note">
			Depende de interação elegível e das políticas da Meta. Nenhum dado pessoal é identificado
			automaticamente. Dados fictícios.
		</p>
	</div>
</div>
