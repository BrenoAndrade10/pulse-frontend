<script lang="ts">
	import { track } from '../../analytics/index.ts';
	import Choice from '../Choice.svelte';
	import Icon from '../Icon.svelte';
	import {
		LEADS,
		VARIABLE_LABELS,
		fill,
		variablesIn,
		type Segment,
		type VariableValues
	} from '../messages';
	import { reveal } from '../motion';
	import ChannelHead from './ChannelHead.svelte';
	import {
		ITEMS,
		MODES,
		RULER,
		itemsFor,
		statsOf,
		type ModeId,
		type SequenceItem
	} from './sequence-data';

	const DEMO = 'email_sequence';
	const FOOTER = ['{{etapa_da_jornada}}', '{{link_personalizado}}'];
	const fmt = new Intl.NumberFormat('pt-BR');
	const leadOptions = LEADS.map((entry) => ({ id: entry.id, label: entry.firstName }));
	const viewOptions = (name: string) => [
		{ id: 'campaign', label: 'Campanha' },
		{ id: 'lead', label: `Jornada de ${name}` }
	];

	let modeId = $state<ModeId>('scheduled');
	let itemId = $state(ITEMS[0].id);
	let leadId = $state(LEADS[0].id);
	let pick = $state('');
	let view = $state<'campaign' | 'lead'>('campaign');
	let seen = $state<string[]>([]);
	let startedAt = 0;

	const lead = $derived(LEADS.find((entry) => entry.id === leadId) ?? LEADS[0]);
	const list = $derived(itemsFor(modeId));
	const item = $derived(ITEMS.find((entry) => entry.id === itemId) ?? ITEMS[0]);
	const fixed = $derived(list.filter((entry) => entry.group === 'fixed'));
	const ruler = $derived(list.filter((entry) => entry.group === 'ruler'));
	const values = $derived<VariableValues>({ ...lead.values, etapa_da_jornada: item.stage });
	const stats = $derived(statsOf(item));
	const used = $derived(variablesIn([item.subject, ...item.paragraphs, ...FOOTER]));
	const subject = $derived(
		fill(item.subject, values)
			.map((segment) => segment.text)
			.join('')
	);
	const paragraphs = $derived(item.paragraphs.map((paragraph) => fill(paragraph, values)));
	const footer = $derived(FOOTER.map((entry) => fill(entry, values)[0]));
	const activeMode = $derived(MODES.find((entry) => entry.id === modeId) ?? MODES[0]);

	const metrics = $derived([
		{ label: 'Envios', value: fmt.format(stats.sent) },
		{ label: 'Entregues', value: fmt.format(stats.delivered) },
		{ label: 'Aberturas estimadas', value: `~${fmt.format(stats.opens)}` },
		{ label: 'Cliques rastreados', value: fmt.format(stats.clicks), key: true },
		{ label: 'Falhas de entrega', value: fmt.format(stats.failed) },
		{ label: 'Descadastros', value: fmt.format(stats.unsubs) },
		{ label: 'Conversões associadas', value: fmt.format(stats.conversions), key: true }
	]);

	const journey = $derived([
		{ label: 'E-mail enviado e entregue', hot: false },
		{ label: `Clique rastreado: ${item.signal}`, hot: true },
		{ label: `Registrado na jornada de ${lead.firstName}`, hot: false },
		{ label: `Sinal no Pulse Heat de ${lead.firstName}`, hot: true }
	]);

	const progress = (id: string) => {
		if (modeId !== 'scheduled' || !RULER.some((entry) => entry.id === id)) return;
		const props = {
			demoType: DEMO as typeof DEMO,
			scenario: 'email_sequences' as const,
			totalSteps: RULER.length
		};
		if (seen.length === 0) {
			startedAt = Date.now();
			track('DemoPlay', { ...props, ctaSource: 'email_sequence_stage', value: 1 });
		}
		if (seen.includes(id)) return;
		seen = [...seen, id];
		track('DemoProgress', { ...props, step: seen.length, maxStep: seen.length, value: 1 });
		if (seen.length === RULER.length)
			track('DemoCompleted', {
				...props,
				maxStep: seen.length,
				durationMs: Date.now() - startedAt,
				value: 1
			});
	};

	const choose = (entry: SequenceItem) => {
		if (entry.id === itemId) return;
		itemId = entry.id;
		pick = '';
		track('FeatureExplore', {
			featureId: 'email',
			scenario: 'email_sequences',
			detail: `stage_${entry.id}`
		});
		progress(entry.id);
	};

	const chooseMode = (id: string) => {
		if (id === modeId) return;
		modeId = id as ModeId;
		itemId = itemsFor(modeId)[0].id;
		pick = '';
		track('FeatureExplore', {
			featureId: 'email',
			scenario: 'email_sequences',
			detail: `mode_${id}`
		});
	};

	const chooseLead = (id: string) => {
		if (id === leadId) return;
		leadId = id;
		track('FeatureExplore', {
			featureId: 'email',
			scenario: 'email_personalization',
			detail: 'lead_change'
		});
	};

	const pickVariable = (variable: string) => {
		pick = pick === variable ? '' : variable;
		if (pick)
			track('FeatureExplore', {
				featureId: 'email',
				scenario: 'email_personalization',
				detail: `var_${variable}`
			});
	};

	const chooseView = (id: string) => {
		if (id === view) return;
		view = id as 'campaign' | 'lead';
		track('FeatureExplore', {
			featureId: 'email',
			scenario: 'email_campaigns',
			detail: `view_${id}`
		});
	};
</script>

{#snippet text(parts: Segment[])}
	{#each parts as part, at (at)}
		{#if part.variable}<mark class="cl-var" class:is-pick={pick === part.variable}>{part.text}</mark
			>{:else}{part.text}{/if}
	{/each}
{/snippet}

<div class="cl-sub-block cl-ch-block-em">
	<ChannelHead
		channel="email"
		icon="mail"
		kicker="E-mail · nutrição e relacionamento contínuo"
		title="Cada lead tem uma jornada. Sua comunicação também deveria ter."
		desc="Crie campanhas e sequências de e-mails que acompanham o momento de cada lead, conectando relacionamento, comportamento e oportunidades comerciais."
	/>

	<div class="cl-card cl-em" use:reveal>
		<div class="cl-em-top">
			<div class="cl-em-modes" role="tablist" aria-label="Tipo de comunicação por e-mail">
				{#each MODES as entry (entry.id)}
					<button
						type="button"
						role="tab"
						class="cl-choice-item"
						class:is-on={entry.id === modeId}
						id="cl-em-mode-{entry.id}"
						aria-selected={entry.id === modeId}
						aria-controls="cl-em-panel"
						tabindex={entry.id === modeId ? 0 : -1}
						onclick={() => chooseMode(entry.id)}
						onkeydown={(event) => {
							if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
							event.preventDefault();
							const next = MODES.find((m) => m.id !== entry.id) ?? entry;
							chooseMode(next.id);
							document.getElementById(`cl-em-mode-${next.id}`)?.focus();
						}}
						><span class="cl-em-long">{entry.label}</span><span class="cl-em-short"
							>{entry.short}</span
						></button
					>
				{/each}
			</div>
			<p class="cl-em-blurb">{activeMode.blurb}</p>
			<em class="cl-tag cl-em-tag">Prévia conceitual</em>
		</div>

		<div id="cl-em-panel" role="tabpanel" aria-labelledby="cl-em-mode-{modeId}">
			<div class="cl-em-lines">
				{#if modeId === 'scheduled'}
					<ol class="cl-em-line" aria-label="Régua de e-mails">
						{#each ruler as entry (entry.id)}
							<li>
								<button
									type="button"
									class="cl-em-node"
									class:is-on={entry.id === itemId}
									aria-pressed={entry.id === itemId}
									onclick={() => choose(entry)}
								>
									<i aria-hidden="true"></i>
									<b>{entry.tag}</b>
									<span>{entry.short}</span>
								</button>
							</li>
						{/each}
					</ol>
					<div class="cl-em-fixed">
						<span>Datas fixas</span>
						{#each fixed as entry (entry.id)}
							<button
								type="button"
								class="cl-em-chip"
								class:is-on={entry.id === itemId}
								aria-pressed={entry.id === itemId}
								onclick={() => choose(entry)}>{entry.short}</button
							>
						{/each}
					</div>
				{:else}
					<ul class="cl-em-rules" aria-label="Regras comportamentais">
						{#each list as entry (entry.id)}
							<li>
								<button
									type="button"
									class="cl-em-rule"
									class:is-on={entry.id === itemId}
									aria-pressed={entry.id === itemId}
									onclick={() => choose(entry)}
								>
									<small>Se</small>
									<b>{entry.short}</b>
									<Icon name="arrow" size={14} />
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<div class="cl-em-grid">
				<div class="cl-em-main">
					<div class="cl-em-leadbar">
						<p class="cl-em-when"><b>{item.title}</b><span>{item.when}</span></p>
						<div class="cl-em-lead">
							<Choice
								mode="radio"
								id="cl-em-lead"
								label="Lead de exemplo"
								options={leadOptions}
								value={leadId}
								onchoose={chooseLead}
							/>
						</div>
					</div>

					<article class="cl-em-mail" aria-label="Prévia do e-mail">
						<div class="cl-em-mail-top">
							<span class="cl-em-av" aria-hidden="true">{values.nome_do_expert.slice(0, 1)}</span>
							<div>
								<b>{values.nome_do_expert} · {values.nome_do_produto}</b>
								<small>para {lead.firstName}</small>
							</div>
						</div>
						<h4>{@render text(fill(item.subject, values))}</h4>
						<div class="cl-em-copy">
							{#each paragraphs as parts, at (at)}<p>{@render text(parts)}</p>{/each}
							<span class="cl-em-cta">{item.cta}</span>
							<p class="cl-em-link">{@render text([footer[1]])}</p>
						</div>
						<p class="cl-em-foot">
							<span class="cl-em-stage">Etapa da jornada: {@render text([footer[0]])}</span>
							<span>Cancelar inscrição</span>
						</p>
					</article>
					<p class="cl-sr" aria-live="polite">Assunto: {subject}</p>

					<div class="cl-em-vars" role="group" aria-label="Variáveis dinâmicas deste e-mail">
						{#each used as variable (variable)}
							<button
								type="button"
								class="cl-em-var"
								class:is-on={pick === variable}
								aria-pressed={pick === variable}
								onclick={() => pickVariable(variable)}
							>
								<span>{VARIABLE_LABELS[variable] ?? variable}</span>
								<b>{values[variable]}</b>
							</button>
						{/each}
					</div>
				</div>

				<aside class="cl-em-track" aria-label="Acompanhamento ilustrativo da campanha">
					<div class="cl-em-track-top">
						<p>Acompanhamento <em class="cl-tag">Dados ilustrativos</em></p>
						<Choice
							mode="radio"
							id="cl-em-view"
							label="Visão do acompanhamento"
							options={viewOptions(lead.firstName)}
							value={view}
							onchoose={chooseView}
						/>
					</div>
					<div class="cl-em-body">
						{#if view === 'campaign'}
							<dl class="cl-em-metrics">
								{#each metrics as metric (metric.label)}
									<div class:is-key={metric.key}>
										<dt>{metric.label}</dt>
										<dd>{metric.value}</dd>
									</div>
								{/each}
							</dl>
							<p class="cl-em-fine">
								Aberturas são estimativas e não provam leitura nem intenção. Cliques e conversões
								são os sinais mais confiáveis.
							</p>
						{:else}
							<ol class="cl-em-journey">
								{#each journey as step (step.label)}
									<li class:is-hot={step.hot}>{step.label}</li>
								{/each}
							</ol>
							<p class="cl-em-fine">
								Cada clique rastreado entra na jornada individual e alimenta o Pulse Heat.
							</p>
						{/if}
					</div>
					<p class="cl-em-fine cl-em-fine-dim">
						Quando os dados estiverem disponíveis. Números fictícios, não são resultados de
						clientes.
					</p>
				</aside>
			</div>
		</div>
	</div>
</div>
