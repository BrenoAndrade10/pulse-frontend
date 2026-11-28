<script lang="ts">
	import { onMount } from 'svelte';
	import { section, track } from '../analytics/index.ts';
	import type { DemoType, ScenarioId } from '../contract.ts';
	import '../styles/automations.css';
	import Choice from './Choice.svelte';
	import Icon from './Icon.svelte';
	import IntermediateCta from './IntermediateCta.svelte';
	import { CONSENT_NOTE, EMAIL_MODELS, LEADS, MESSAGE_MODELS, fill, variablesIn } from './messages';
	import PhoneChat, { type PhoneMessage } from './PhoneChat.svelte';
	import { prefersReducedMotion, reveal } from './motion';

	type Trigger = 'checkout' | 'heat' | 'multi' | 'instagram';
	type ActionId = 'email' | 'whatsapp' | 'instagram' | 'wait' | 'verify' | 'segment' | 'stop';

	const triggers = [
		{ id: 'checkout', label: 'Checkout' },
		{ id: 'heat', label: 'Heat' },
		{ id: 'multi', label: 'Multicanal' },
		{ id: 'instagram', label: 'Instagram' }
	];

	const finals = [
		{ id: 'whatsapp', label: 'WhatsApp' },
		{ id: 'email', label: 'E-mail' }
	];

	const igTriggers = [
		{ id: 'comment', label: 'Comentou AULA' },
		{ id: 'message', label: 'Enviou mensagem' }
	];

	const igModel = {
		id: 'ig_reply',
		paragraphs: ['Oi, {{primeiro_nome}}! Aqui está o link da aula que você pediu.'],
		cta: 'Acessar a aula',
		ctaVariable: 'link_de_inscricao'
	};

	const actions: {
		id: ActionId;
		label: string;
		tone: string;
		text: string;
		fits: Trigger[];
		used: (trigger: Trigger, final: string) => boolean;
		why?: string;
	}[] = [
		{
			id: 'email',
			label: 'Enviar e-mail',
			tone: '#60a5fa',
			text: 'Envia e-mail personalizado a quem aceitou receber, para apresentar a oferta ou recuperar o checkout.',
			fits: ['checkout', 'heat', 'multi'],
			used: (trigger) => trigger === 'multi',
			why: 'O e-mail do contato só existe depois que ele se cadastra. A partir de um comentário, não se aplica.'
		},
		{
			id: 'whatsapp',
			label: 'Enviar mensagem pelo WhatsApp',
			tone: '#25d366',
			text: 'Comunicação privada, só para quem tem consentimento e elegibilidade, com modelos aprovados.',
			fits: ['checkout', 'heat', 'multi'],
			used: (trigger, final) =>
				trigger === 'checkout' ||
				trigger === 'heat' ||
				(trigger === 'multi' && final === 'whatsapp'),
			why: 'WhatsApp exige consentimento e telefone informado. Um comentário não fornece nenhum dos dois.'
		},
		{
			id: 'instagram',
			label: 'Responder interação no Instagram',
			tone: '#f472b6',
			text: 'Responde a um comentário com palavra-chave ou a uma mensagem recebida, quando elegível. Nunca envia mensagem para qualquer lead.',
			fits: ['instagram'],
			used: (trigger) => trigger === 'instagram',
			why: 'Só vale para comentário com palavra-chave ou mensagem recebida. Veja o exemplo Instagram.'
		},
		{
			id: 'wait',
			label: 'Aguardar período',
			tone: '#ad96ff',
			text: 'Define o intervalo antes da próxima etapa. Pode ser editado na etapa de espera.',
			fits: ['checkout', 'heat', 'multi'],
			used: (trigger) => trigger !== 'instagram',
			why: 'A resposta a um comentário ou mensagem é imediata. Neste exemplo não há espera.'
		},
		{
			id: 'verify',
			label: 'Verificar condição',
			tone: '#ad96ff',
			text: 'Consulta uma condição de novo antes de agir, como a compra ainda não identificada.',
			fits: ['checkout', 'heat', 'multi', 'instagram'],
			used: () => true
		},
		{
			id: 'segment',
			label: 'Alterar segmentação',
			tone: '#ad96ff',
			text: 'Move o contato entre listas e segmentos conforme o que ele fez.',
			fits: ['checkout', 'heat', 'multi', 'instagram'],
			used: (trigger) => trigger === 'instagram'
		},
		{
			id: 'stop',
			label: 'Interromper sequência',
			tone: '#ad96ff',
			text: 'Encerra a automação quando o objetivo foi atingido, como a compra identificada.',
			fits: ['checkout', 'heat', 'multi', 'instagram'],
			used: () => true
		}
	];

	const waits = [
		{ id: '15', label: '15 min', minutes: 15, text: '15 minutos' },
		{ id: '30', label: '30 min', minutes: 30, text: '30 minutos' },
		{ id: '60', label: '1 hora', minutes: 60, text: '1 hora' },
		{ id: '120', label: '2 horas', minutes: 120, text: '2 horas' }
	];

	const outcomes = [
		{ id: 'open', label: 'Não identificada' },
		{ id: 'bought', label: 'Identificada' }
	];

	const igOutcomes = [
		{ id: 'open', label: 'Primeira resposta' },
		{ id: 'bought', label: 'Já respondida' }
	];

	const leadOptions = LEADS.map((lead) => ({ id: lead.id, label: lead.firstName }));

	const chips: { key: string; label: string }[] = [
		{ key: 'primeiro_nome', label: 'Primeiro nome' },
		{ key: 'nome_do_produto', label: 'Produto' },
		{ key: 'nome_do_expert', label: 'Expert' },
		{ key: 'nome_do_evento', label: 'Evento' },
		{ key: 'link_de_inscricao', label: 'Link de inscrição' },
		{ key: 'link_de_recuperacao', label: 'Link de recuperação' },
		{ key: 'data_e_horario', label: 'Data e horário' },
		{ key: 'informacoes_da_operacao', label: 'Operação' }
	];

	const TOTAL = 5;
	const STEP_MS = 760;

	let trigger = $state<Trigger>('checkout');
	let score = $state(75);
	let wait = $state('30');
	let outcome = $state('open');
	let leadId = $state('mariana');
	let picked = $state('');
	let final = $state('whatsapp');
	let igTrigger = $state('comment');
	let action = $state<ActionId | ''>('');
	let actsOpen = $state(false);
	let simStep = $state(-1);
	let runs = $state(0);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let startedAt = 0;

	let runCounter = 0;
	let runId = 0;

	const scenarioOf = (id: Trigger): ScenarioId =>
		id === 'checkout'
			? 'checkout_recovery'
			: id === 'heat'
				? 'behavioral_automations'
				: 'multichannel_automation';

	const scenario = $derived(scenarioOf(trigger));
	const isNew = $derived(trigger === 'multi' || trigger === 'instagram');
	const demo = $derived<DemoType>(isNew ? 'multichannel_automation' : 'automation_builder');
	const channel = $derived<'whatsapp' | 'email' | 'instagram'>(
		trigger === 'instagram'
			? 'instagram'
			: trigger === 'multi' && final === 'email'
				? 'email'
				: 'whatsapp'
	);
	const running = $derived(simStep >= 0 && simStep < TOTAL);
	const finished = $derived(simStep >= TOTAL);
	const bought = $derived(outcome === 'bought');
	const lead = $derived(LEADS.find((item) => item.id === leadId) ?? LEADS[0]);
	const waitItem = $derived(waits.find((item) => item.id === wait) ?? waits[1]);
	const model = $derived<{
		id: string;
		paragraphs: string[];
		cta: string;
		ctaVariable?: string;
		subject?: string;
	}>(
		trigger === 'instagram'
			? igModel
			: channel === 'email'
				? { ...EMAIL_MODELS.checkout_recovery, ctaVariable: 'link_de_recuperacao' }
				: MESSAGE_MODELS[trigger === 'heat' ? 'reengagement' : 'checkout_recovery']
	);
	const used = $derived([
		...variablesIn(model.paragraphs),
		...(model.ctaVariable ? [model.ctaVariable] : [])
	]);

	const sentAt = $derived.by(() => {
		if (trigger === 'instagram') return '19:21';
		const total = 19 * 60 + 20 + waitItem.minutes;
		const hours = Math.floor(total / 60) % 24;
		return `${String(hours).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
	});

	const message = $derived<PhoneMessage>({
		id: `${model.id}-msg`,
		from: 'brand',
		text: '',
		time: sentAt,
		subject: model.subject,
		sender: 'Equipe do expert',
		rich: {
			paragraphs: model.paragraphs.map((paragraph) => fill(paragraph, lead.values)),
			cta: model.cta,
			ctaVariable: model.ctaVariable
		}
	});

	const leadMessage = $derived<PhoneMessage>(
		igTrigger === 'comment'
			? { id: 'ig-comment', from: 'lead', kind: 'comment', text: 'AULA', time: '19:20' }
			: { id: 'ig-dm', from: 'lead', text: 'Quero a aula', time: '19:20' }
	);
	const showMessage = $derived(simStep === -1 || (finished && !bought));
	const thread = $derived<PhoneMessage[]>(
		trigger === 'instagram'
			? [leadMessage, ...(showMessage ? [message] : [])]
			: showMessage
				? [message]
				: []
	);
	const stopText = $derived(
		trigger === 'instagram'
			? 'Interação já respondida. Nenhuma mensagem enviada.'
			: 'Compra identificada antes do disparo. Nenhuma mensagem enviada.'
	);
	const chatName = $derived(trigger === 'instagram' ? 'Perfil do expert' : 'Equipe do expert');
	const chatStatus = $derived(
		channel === 'instagram'
			? 'Resposta à interação'
			: channel === 'email'
				? 'E-mail'
				: 'WhatsApp privado'
	);
	const actionItem = $derived(actions.find((item) => item.id === action));
	const actionFits = $derived(actionItem ? actionItem.fits.includes(trigger) : false);
	const actionUsed = $derived(actionItem ? actionItem.used(trigger, final) : false);
	const halted = $derived(bought && simStep >= 3);
	const typing = $derived(simStep === 4 && !bought);
	const emptyText = $derived(bought && simStep >= 3 ? stopText : '');

	const pickedValue = $derived(picked ? (lead.values[picked] ?? '') : '');
	const pickedUsed = $derived(picked ? used.includes(picked) : false);

	const stopSim = () => {
		timers.forEach(clearTimeout);
		timers = [];
	};

	onMount(() => stopSim);

	const resetSim = () => {
		stopSim();
		simStep = -1;
	};

	const interact = (detail: string, value: string | number | boolean) =>
		track('AutomationDemoInteraction', {
			detail,
			scenario,
			value,
			...(isNew ? { demoType: demo } : {})
		});

	const reach = (step: number) => {
		simStep = step;
		if (step < TOTAL) {
			track('DemoProgress', {
				demoType: demo,
				scenario,
				step: step + 1,
				maxStep: step + 1,
				totalSteps: TOTAL,
				value: runId
			});
		} else {
			track('DemoCompleted', {
				demoType: demo,
				scenario,
				durationMs: Date.now() - startedAt,
				maxStep: TOTAL,
				totalSteps: TOTAL,
				value: runId
			});
		}
	};

	const simulate = () => {
		if (running) return;
		stopSim();
		runCounter += 1;
		runId = runCounter;
		startedAt = Date.now();
		const replay = runs > 0;
		runs += 1;
		track(replay ? 'DemoReplay' : 'DemoPlay', {
			demoType: demo,
			scenario,
			ctaSource: 'automations_simulate',
			totalSteps: TOTAL,
			value: runId
		});
		if (prefersReducedMotion()) {
			reach(TOTAL - 1);
			reach(TOTAL);
			return;
		}
		reach(0);
		timers = [1, 2, 3, 4, 5].map((step) => setTimeout(() => reach(step), step * STEP_MS));
	};

	const chooseTrigger = (id: string) => {
		if (id === trigger) return;
		trigger = id as Trigger;
		picked = '';
		action = '';
		outcome = 'open';
		resetSim();
		track('AutomationDemoInteraction', {
			detail: 'trigger',
			scenario: scenarioOf(trigger),
			value: id,
			...(isNew ? { demoType: demo } : {})
		});
	};
	const chooseFinal = (id: string) => {
		if (id === final) return;
		final = id;
		picked = '';
		resetSim();
		interact('channel_action', id);
	};
	const chooseIgTrigger = (id: string) => {
		if (id === igTrigger) return;
		igTrigger = id;
		resetSim();
		interact('instagram_trigger', id === 'comment' ? 'comment_keyword' : 'message_received');
	};
	const pickAction = (id: ActionId) => {
		action = action === id ? '' : id;
		interact('action_explore', id);
	};
	const commitScore = () => {
		resetSim();
		interact('score', score);
	};
	const chooseWait = (id: string) => {
		wait = id;
		resetSim();
		interact('wait', id);
	};
	const chooseOutcome = (id: string) => {
		if (id === outcome) return;
		outcome = id;
		resetSim();
		interact(
			'condition',
			trigger === 'instagram'
				? id === 'bought'
					? 'already_replied'
					: 'first_reply'
				: id === 'bought'
					? 'purchase_identified'
					: 'purchase_not_identified'
		);
	};
	const chooseLead = (id: string) => {
		if (id === leadId) return;
		leadId = id;
		track('FeatureExplore', {
			featureId: 'automations',
			scenario: 'personalized_messaging',
			detail: 'lead_change'
		});
	};
	const pickVariable = (key: string) => {
		picked = picked === key ? '' : key;
		track('FeatureExplore', {
			featureId: 'automations',
			scenario: 'personalized_messaging',
			detail: 'variable'
		});
	};

	const stepState = (index: number) => ({
		now: running && simStep === index && !(halted && index > 3),
		done: simStep > index && !(halted && index >= 3),
		stop: halted && index === 3,
		skip: halted && index === 4
	});
</script>

<section
	class="cl-sec cl-feature cl-a-auto"
	id="automacoes"
	tabindex="-1"
	aria-labelledby="cl-auto-title"
	use:section={{ id: 'automations', featureId: 'automations' }}
>
	<div class="cl-wrap">
		<header class="cl-head" use:reveal>
			<p class="cl-eyebrow">AUTOMAÇÕES</p>
			<h2 id="cl-auto-title">Não apenas identifique oportunidades. Aja sobre elas.</h2>
			<p class="cl-sub">
				O tracking gera dados, o Pulse Heat os transforma em inteligência e as automações
				transformam inteligência em ação.
			</p>
		</header>

		<div class="cl-card cl-ab" use:reveal>
			<div class="cl-ab-top">
				<Choice
					mode="radio"
					id="cl-ab-trigger"
					label="Exemplo de automação"
					options={triggers}
					value={trigger}
					onchoose={chooseTrigger}
				/>
				<em class="cl-tag">Prévia conceitual</em>
			</div>
			<p class="cl-ab-hint" class:is-heat={trigger === 'heat'} class:is-multi={isNew}>
				{#if trigger === 'checkout'}
					<b>Recuperação de checkout.</b> Parte de quem iniciou o checkout e ainda não comprou.
				{:else if trigger === 'multi'}
					<b>E-mail e WhatsApp.</b> O e-mail apresenta a oferta. O WhatsApp só entra se o lead estiver
					apto a recebê-lo.
				{:else if trigger === 'instagram'}
					<b>Resposta no Instagram.</b> Só responde interações iniciadas pelo contato e elegíveis, nunca
					qualquer lead.
				{:else}
					<b>Por interesse.</b> O Pulse Heat mede interesse, não início de compra. A mensagem não cita
					checkout.
				{/if}
			</p>

			<div class="cl-ab-grid">
				<div class="cl-ab-left">
					<ol class="cl-st-list" aria-label="Etapas da automação">
						{#snippet row(index: number, icon: string, kind: string)}
							{@const state = stepState(index)}
							<li
								class="cl-st"
								class:is-now={state.now}
								class:is-done={state.done}
								class:is-stop={state.stop}
								class:is-skip={state.skip}
							>
								<span class="cl-st-dot"><Icon name={icon} size={14} /></span>
								<div class="cl-st-body">
									<p class="cl-st-kind">{kind}</p>
									{#if index === 0}
										{#if trigger === 'checkout'}
											<p class="cl-st-text"><b>Checkout iniciado</b></p>
											<p class="cl-st-meta">Requer integração com o checkout</p>
										{:else if trigger === 'multi'}
											<p class="cl-st-text"><b>Clicou no e-mail e iniciou o checkout</b></p>
											<p class="cl-st-meta">
												Após o e-mail de apresentação. Requer integração com o checkout
											</p>
										{:else if trigger === 'instagram'}
											<Choice
												mode="radio"
												id="cl-ab-igtrig"
												label="Gatilho do Instagram"
												options={igTriggers}
												value={igTrigger}
												onchoose={chooseIgTrigger}
											/>
										{:else}
											<p class="cl-st-text">Pulse Heat de <b>{score}</b> pontos ou mais</p>
											<label class="cl-ab-range">
												<span class="cl-sr">Pontuação mínima do Pulse Heat</span>
												<input
													type="range"
													min="50"
													max="100"
													step="5"
													bind:value={score}
													onchange={commitScore}
													aria-valuetext="{score} pontos"
												/>
											</label>
										{/if}
									{:else if index === 1}
										{#if trigger === 'instagram'}
											<p class="cl-st-text"><b>Interação elegível</b></p>
											<p class="cl-st-meta">Iniciada pelo contato, dentro da janela do canal</p>
										{:else if trigger === 'multi'}
											<p class="cl-st-text"><b>Não concluiu a compra</b></p>
										{:else}
											<p class="cl-st-text"><b>Compra ainda não identificada</b></p>
										{/if}
									{:else if index === 2 && trigger === 'instagram'}
										<p class="cl-st-text"><b>Adicionar ao segmento</b> "Interessados na aula"</p>
									{:else if index === 2}
										<Choice
											mode="radio"
											id="cl-ab-wait"
											label="Tempo de espera"
											options={waits}
											value={wait}
											onchoose={chooseWait}
										/>
									{:else if index === 3}
										<p class="cl-st-text">
											{#if trigger === 'instagram'}
												Já respondeu esta interação? Então <b>automação encerrada</b>.
											{:else}
												Compra identificada? Então <b>automação encerrada</b>.
											{/if}
										</p>
									{:else if trigger === 'instagram'}
										<p class="cl-st-text"><b>Responder a interação pelo Instagram</b></p>
										<p class="cl-st-meta">Resposta a interação elegível, sem envio em massa</p>
									{:else if trigger === 'multi'}
										<p class="cl-st-text"><b>Se apto, enviar recuperação por</b></p>
										<Choice
											mode="radio"
											id="cl-ab-final"
											label="Canal da comunicação de recuperação"
											options={finals}
											value={final}
											onchoose={chooseFinal}
										/>
									{:else}
										<p class="cl-st-text">
											<b>Enviar comunicação personalizada pelo WhatsApp privado</b>
										</p>
									{/if}
								</div>
							</li>
						{/snippet}
						{@render row(
							0,
							trigger === 'checkout'
								? 'cart'
								: trigger === 'heat'
									? 'flame'
									: trigger === 'multi'
										? 'mail'
										: 'instagram',
							'Gatilho'
						)}
						{@render row(1, 'filter', 'Condição')}
						{@render row(
							2,
							trigger === 'instagram' ? 'layers' : 'clock',
							trigger === 'instagram' ? 'Segmentação' : 'Espera'
						)}
						{@render row(3, 'repeat', 'Verificação')}
						{@render row(
							4,
							channel === 'instagram' ? 'instagram' : channel === 'email' ? 'mail' : 'send',
							'Ação'
						)}
					</ol>

					<div class="cl-ab-run">
						<div class="cl-ab-run-opt">
							<span class="cl-ab-run-label"
								>{trigger === 'instagram' ? 'Interação na simulação' : 'Compra na simulação'}</span
							>
							<Choice
								mode="radio"
								id="cl-ab-outcome"
								label={trigger === 'instagram'
									? 'Situação da interação durante a simulação'
									: 'Situação da compra durante a espera'}
								options={trigger === 'instagram' ? igOutcomes : outcomes}
								value={outcome}
								onchoose={chooseOutcome}
							/>
						</div>
						<button
							type="button"
							class="cl-btn cl-btn-primary cl-btn-sm"
							onclick={simulate}
							disabled={running}
						>
							<Icon name="bolt" size={16} />{finished ? 'Executar de novo' : 'Executar simulação'}
						</button>
					</div>
					<p class="cl-ab-status" aria-live="polite">
						{#if simStep === -1}
							Veja a regra percorrer cada etapa.
						{:else if running}
							Etapa {simStep + 1} de {TOTAL}...
						{:else if bought}
							{trigger === 'instagram'
								? 'Interação já respondida: automação encerrada.'
								: 'Compra identificada: automação encerrada.'}
						{:else}
							Simulação concluída. Nada foi enviado.
						{/if}
					</p>
					<details class="cl-ab-acts" bind:open={actsOpen}>
						<summary class="cl-ab-run-label">Explorar ações da automação</summary>
						<div class="cl-ab-acts-list" role="group" aria-label="Ações da automação">
							{#each actions as item (item.id)}
								<button
									type="button"
									class="cl-actchip"
									class:is-on={action === item.id}
									class:is-used={item.used(trigger, final)}
									class:is-off={!item.fits.includes(trigger)}
									style="--ac:{item.tone}"
									aria-pressed={action === item.id}
									onclick={() => pickAction(item.id)}>{item.label}</button
								>
							{/each}
						</div>
						<p class="cl-ab-read cl-ab-act-read" aria-live="polite">
							{#if actionItem}
								<b>{actionItem.label}.</b>
								{actionFits ? actionItem.text : actionItem.why}
								<span
									>{actionFits
										? actionUsed
											? 'Usada neste exemplo'
											: 'Disponível, fora deste exemplo'
										: 'Não se aplica a este exemplo'}</span
								>
							{:else}
								Toque em uma ação para ver quando ela se aplica a cada canal.
							{/if}
						</p>
					</details>
				</div>

				<div class="cl-ab-right">
					<div class="cl-ab-leads">
						<span class="cl-ab-run-label">Lead fictício</span>
						<Choice
							mode="radio"
							id="cl-ab-lead"
							label="Lead de exemplo"
							options={leadOptions}
							value={leadId}
							onchoose={chooseLead}
						/>
					</div>
					<div class="cl-ab-chat" style="--ph-h:322px">
						<PhoneChat
							{channel}
							compact
							label=""
							name={chatName}
							status={typing ? 'digitando…' : chatStatus}
							messages={thread}
							{typing}
							{emptyText}
							highlight={picked}
						/>
					</div>
					<div class="cl-ab-vars" role="group" aria-label="Variáveis dinâmicas">
						{#each chips as chip (chip.key)}
							<button
								type="button"
								class="cl-vchip"
								class:is-on={picked === chip.key}
								class:is-used={used.includes(chip.key)}
								aria-pressed={picked === chip.key}
								onclick={() => pickVariable(chip.key)}>{chip.label}</button
							>
						{/each}
					</div>
					<p class="cl-ab-read" aria-live="polite">
						{#if picked}
							<code>{`{{${picked}}}`}</code> → <b>{pickedValue}</b>
							<span>{pickedUsed ? 'usada nesta mensagem' : 'disponível, fora desta mensagem'}</span>
						{:else}
							Toque em uma variável para ver onde ela entra e o valor do lead.
						{/if}
					</p>
				</div>
			</div>
			<p class="cl-demo-note">
				Prévia conceitual com dados fictícios, sem resultado de vendas. {CONSENT_NOTE}
			</p>
		</div>

		<IntermediateCta
			label="Quero utilizar a Pulse na minha operação"
			kind="signup"
			ctaSource="automations_cta"
		/>
	</div>
</section>
