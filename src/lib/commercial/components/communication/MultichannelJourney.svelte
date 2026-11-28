<script lang="ts">
	import { onMount } from 'svelte';
	import { Tween } from 'svelte/motion';
	import { track } from '../../analytics/index.ts';
	import '../../styles/multichannel.css';
	import Icon from '../Icon.svelte';
	import { prefersReducedMotion, reveal } from '../motion';

	type Kind = 'instagram' | 'tracking' | 'email' | 'heat' | 'sales' | 'auto' | 'whatsapp';
	type Step = {
		id: string;
		kind: Kind;
		icon: string;
		short: string;
		channel: string;
		title: string;
		text: string;
		event: string;
		data: [string, string][];
		snippet?: string;
		log: string;
		score: number | null;
	};

	const steps: Step[] = [
		{
			id: 'comment',
			kind: 'instagram',
			icon: 'instagram',
			short: 'Comentário',
			channel: 'Instagram',
			title: 'Mariana comenta AULA em uma publicação',
			text: 'A palavra-chave configurada inicia o fluxo. Só interações elegíveis, iniciadas pelo contato, podem receber resposta.',
			event: 'comentou_palavra_chave',
			data: [
				['Palavra-chave', 'AULA'],
				['Identificador', '@mariana.exemplo']
			],
			snippet: 'AULA',
			log: 'Comentou AULA no Instagram',
			score: null
		},
		{
			id: 'dm',
			kind: 'instagram',
			icon: 'send',
			short: 'Mensagem',
			channel: 'Instagram',
			title: 'Recebe uma mensagem privada com link rastreado',
			text: 'A resposta à interação leva a um link com identificação de origem, que une os próximos passos ao mesmo contato.',
			event: 'link_rastreado_enviado',
			data: [
				['Origem do link', 'instagram / comentário'],
				['Destino', 'página de captura']
			],
			snippet: 'Oi, Mariana! Aqui está o link da aula: exemplo.com/aula',
			log: 'Recebeu mensagem privada com link rastreado',
			score: null
		},
		{
			id: 'capture',
			kind: 'tracking',
			icon: 'target',
			short: 'Captura',
			channel: 'Tracking',
			title: 'Inscreve-se na página de captura',
			text: 'Ao clicar no link e informar o e-mail, o cadastro é associado ao mesmo perfil, com a origem preservada.',
			event: 'lead_capturado',
			data: [
				['Origem preservada', 'instagram / comentário'],
				['Associação', 'link rastreado + e-mail informado']
			],
			log: 'Inscreveu-se na página de captura',
			score: 18
		},
		{
			id: 'email',
			kind: 'email',
			icon: 'mail',
			short: 'E-mail',
			channel: 'E-mail',
			title: 'Recebe a sequência de conteúdos e interage com os links',
			text: 'Aberturas e cliques nos links rastreados são registrados no perfil, com o consentimento do contato.',
			event: 'email_link_clicado',
			data: [
				['Sequência', '3 conteúdos'],
				['Sinal', 'cliques nos links da oferta']
			],
			snippet: 'Aula 2: como estruturar sua oferta',
			log: 'Abriu e-mails e clicou nos links',
			score: 41
		},
		{
			id: 'heat',
			kind: 'heat',
			icon: 'flame',
			short: 'Pulse Heat',
			channel: 'Pulse Heat',
			title: 'A pontuação evolui conforme os sinais registrados',
			text: 'Cada sinal soma ao interesse de Mariana. Rótulos e pontos desta prévia são fictícios.',
			event: 'heat_atualizado',
			data: [
				['Inscrição na captura', '+18'],
				['E-mails e cliques', '+23'],
				['Visita à página de vendas', '+22']
			],
			log: 'Pulse Heat atualizado',
			score: 63
		},
		{
			id: 'sales',
			kind: 'sales',
			icon: 'cart',
			short: 'Checkout',
			channel: 'Página de vendas',
			title: 'Inicia o checkout na página de vendas',
			text: 'O início do checkout é um sinal forte de interesse e exige integração com o checkout.',
			event: 'checkout_iniciado',
			data: [
				['Sinal', 'checkout iniciado'],
				['Pulse Heat', '+15']
			],
			log: 'Iniciou o checkout',
			score: 78
		},
		{
			id: 'check',
			kind: 'auto',
			icon: 'repeat',
			short: 'Verificação',
			channel: 'Automação',
			title: 'Verifica se a compra ainda não foi identificada',
			text: 'Após o intervalo configurado, a automação consulta de novo. Se a compra aparecer, o fluxo é encerrado.',
			event: 'compra_nao_identificada',
			data: [
				['Intervalo', '30 minutos (configurável)'],
				['Resultado', 'compra não identificada']
			],
			log: 'Compra não identificada após o intervalo',
			score: 78
		},
		{
			id: 'whatsapp',
			kind: 'whatsapp',
			icon: 'chat',
			short: 'WhatsApp',
			channel: 'WhatsApp',
			title: 'Recebe a comunicação privada de recuperação, se apta',
			text: 'Só segue se houver consentimento e elegibilidade. Caso contrário, nada é enviado.',
			event: 'recuperacao_elegivel',
			data: [
				['Consentimento', 'confirmado (simulado)'],
				['Mensagem', 'modelo aprovado']
			],
			snippet: 'Oi, Mariana! Sua inscrição ainda não foi concluída. Quer retomar?',
			log: 'Comunicação de recuperação elegível no WhatsApp',
			score: 78
		}
	];

	const TOTAL = steps.length;
	const STEP_MS = 3200;
	const DEMO = 'multichannel_journey';

	let index = $state(0);
	let playing = $state(false);
	let runs = $state(0);
	let maxStep = $state(0);
	let completed = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let startedAt = 0;
	let runId = 0;
	let runCounter = 0;

	const current = $derived(steps[index]);
	const atEnd = $derived(index === TOTAL - 1);
	const identified = $derived(index >= 2);
	const progress = $derived(((index + 0.5) / TOTAL) * 100);
	const targetScore = $derived(
		[...steps.slice(0, index + 1)].reverse().find((item) => item.score !== null)?.score ?? null
	);
	const gauge = new Tween(0, { duration: prefersReducedMotion() ? 0 : 700 });
	const shown = $derived(Math.round(gauge.current));
	const heatClass = $derived(shown >= 70 ? 'is-hot' : shown >= 40 ? 'is-warm' : 'is-cold');

	$effect(() => {
		gauge.target = targetScore ?? 0;
	});

	const clear = () => {
		clearTimeout(timer);
		timer = undefined;
	};

	const begin = (source: string) => {
		runCounter += 1;
		runId = runCounter;
		startedAt = Date.now();
		maxStep = 1;
		completed = false;
		track(runs > 0 ? 'DemoReplay' : 'DemoPlay', {
			demoType: DEMO,
			scenario: DEMO,
			ctaSource: source,
			totalSteps: TOTAL,
			value: runId
		});
		runs += 1;
	};

	const reached = (at: number) => {
		const step = at + 1;
		if (step > maxStep) {
			maxStep = step;
			track('DemoProgress', {
				demoType: DEMO,
				scenario: DEMO,
				step,
				maxStep: step,
				totalSteps: TOTAL,
				value: runId
			});
		}
		if (at === TOTAL - 1 && !completed) {
			completed = true;
			track('DemoCompleted', {
				demoType: DEMO,
				scenario: DEMO,
				durationMs: Date.now() - startedAt,
				maxStep: TOTAL,
				totalSteps: TOTAL,
				value: runId
			});
		}
	};

	const schedule = () => {
		clear();
		if (!playing) return;
		timer = setTimeout(() => {
			if (index >= TOTAL - 1) {
				playing = false;
				return;
			}
			index += 1;
			reached(index);
			if (index >= TOTAL - 1) playing = false;
			else schedule();
		}, STEP_MS);
	};

	const play = () => {
		if (playing) {
			playing = false;
			clear();
			return;
		}
		if (atEnd) {
			index = 0;
			begin('journey_play');
		} else if (runs === 0 || runId === 0) {
			begin('journey_play');
		}
		playing = true;
		schedule();
	};

	const next = () => {
		if (atEnd) return;
		playing = false;
		clear();
		if (runId === 0) begin('journey_next');
		index += 1;
		reached(index);
	};

	const prev = () => {
		if (index === 0) return;
		playing = false;
		clear();
		index -= 1;
	};

	const jump = (at: number) => {
		playing = false;
		clear();
		if (at === index) return;
		index = at;
		track('FeatureExplore', {
			featureId: 'lead_journey',
			scenario: DEMO,
			detail: `step_${at + 1}_${steps[at].id}`
		});
	};

	onMount(() => clear);

	const playLabel = $derived(playing ? 'Pausar' : atEnd ? 'Reproduzir de novo' : 'Reproduzir');
</script>

<div class="cl-mj" id="jornada-multicanal" aria-labelledby="cl-mj-title" use:reveal>
	<header class="cl-mj-head">
		<h3 id="cl-mj-title">
			O poder não está apenas nos canais. Está em como eles trabalham juntos.
		</h3>
		<p>
			Uma única jornada fictícia, de Mariana, atravessando Instagram, tracking, e-mail, Pulse Heat,
			automação e WhatsApp.
		</p>
	</header>

	<div class="cl-mj-stage">
		<div
			class="cl-mj-rail cl-mj-k-{current.kind}"
			role="group"
			aria-label="Etapas da jornada de Mariana"
			style="--p:{progress}%"
		>
			<span class="cl-mj-line" aria-hidden="true"></span>
			<span class="cl-mj-fill" aria-hidden="true"></span>
			<span class="cl-mj-pulse cl-mj-k-{current.kind}" aria-hidden="true"></span>
			{#each steps as step, at (step.id)}
				<button
					type="button"
					class="cl-mj-node cl-mj-k-{step.kind}"
					class:is-on={at === index}
					class:is-done={at < index}
					aria-pressed={at === index}
					aria-label="Etapa {at + 1}: {step.channel}, {step.short}"
					onclick={() => jump(at)}
				>
					<span class="cl-mj-dot"><Icon name={step.icon} size={16} /></span>
					<span class="cl-mj-lab">{step.short}</span>
				</button>
			{/each}
		</div>

		<div class="cl-mj-grid">
			<article class="cl-mj-card cl-mj-k-{current.kind}" aria-label="Etapa selecionada">
				{#key current.id}
					<div class="cl-mj-in">
						<p class="cl-mj-kicker">
							<span class="cl-mj-badge"
								><Icon name={current.icon} size={13} />{current.channel}</span
							>
							<span>Etapa {index + 1} de {TOTAL}</span>
						</p>
						<h4>{current.title}</h4>
						<p class="cl-mj-text">{current.text}</p>
						{#if current.snippet}
							<p class="cl-mj-snip">{current.snippet}</p>
						{/if}
						<dl class="cl-mj-data">
							<div>
								<dt>Evento</dt>
								<dd><code>{current.event}</code></dd>
							</div>
							{#each current.data as [label, value] (label)}
								<div>
									<dt>{label}</dt>
									<dd>{value}</dd>
								</div>
							{/each}
						</dl>
					</div>
				{/key}
			</article>

			<aside class="cl-mj-profile" aria-label="Perfil unificado de Mariana">
				<div class="cl-mj-ph">
					<span class="cl-mj-av" aria-hidden="true">M</span>
					<div>
						<b>Perfil unificado de Mariana</b>
						<small>
							{identified
								? 'Identidade associada pelo e-mail informado'
								: 'Identificada só pelo Instagram'}
						</small>
					</div>
				</div>
				<div class="cl-mj-heat {heatClass}">
					<div class="cl-mj-heat-top">
						<span>Pulse Heat</span>
						<b>{targetScore === null ? '—' : shown}</b>
					</div>
					<span class="cl-mj-bar" aria-hidden="true"><i style="width:{shown}%"></i></span>
				</div>
				<ol class="cl-mj-log" aria-label="Eventos acumulados no perfil">
					{#each steps as step, at (step.id)}
						<li class="cl-mj-k-{step.kind}" class:is-on={at === index} class:is-in={at <= index}>
							<span class="cl-mj-tick" aria-hidden="true"></span>
							<span>{step.log}</span>
						</li>
					{/each}
				</ol>
			</aside>
		</div>

		<div class="cl-mj-ctrl">
			<button
				type="button"
				class="cl-btn cl-btn-ghost cl-btn-sm"
				onclick={prev}
				disabled={index === 0}
			>
				<span class="cl-mj-flip"><Icon name="arrow" size={15} /></span>Voltar
			</button>
			<button
				type="button"
				class="cl-btn cl-btn-primary cl-btn-sm"
				onclick={play}
				aria-pressed={playing}
			>
				{playLabel}
			</button>
			<button type="button" class="cl-btn cl-btn-ghost cl-btn-sm" onclick={next} disabled={atEnd}>
				Avançar<Icon name="arrow" size={15} />
			</button>
			<span class="cl-mj-count" aria-live="polite">Etapa {index + 1} de {TOTAL}</span>
		</div>
	</div>

	<p class="cl-mj-note">
		<em class="cl-tag">Prévia conceitual</em>
		Dados fictícios, nada é enviado. Unir canais depende de mecanismos válidos de associação, como o link
		rastreado ou o e-mail que o próprio contato informa. O Instagram não entrega dados pessoais automaticamente.
	</p>
</div>
