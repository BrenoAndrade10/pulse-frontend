<script lang="ts">
	import { onMount } from 'svelte';
	import { track } from '../../analytics/index.ts';
	import type { FeatureId, ScenarioId } from '../../contract.ts';
	import {
		LEADS,
		MESSAGE_MODELS,
		VARIABLE_LABELS,
		fill,
		variablesIn,
		type MessageModelId
	} from '../messages';
	import PhoneChat, { type PhoneMessage } from '../PhoneChat.svelte';
	import { prefersReducedMotion, reveal } from '../motion';

	type ModeId = 'scheduled' | 'event' | 'behavior';
	type Item = {
		id: string;
		when: string;
		title: string;
		whenLong: string;
		audience: string;
		model: MessageModelId;
		time: string;
	};

	const lead = LEADS[0];

	const modes: {
		id: ModeId;
		label: string;
		short?: string;
		featureId: FeatureId;
		scenario?: ScenarioId;
		blurb: string;
		items: Item[];
	}[] = [
		{
			id: 'scheduled',
			label: 'Data fixa',
			featureId: 'scheduled_messages',
			scenario: 'scheduled_messages',
			blurb: 'Disparos em data e hora definidas. Ex.: lembrete da aula na segunda, às 19h45.',
			items: [
				{
					id: 'cpl1',
					when: 'Seg 08h00',
					title: 'Lembrete do CPL 1',
					whenLong: 'Segunda-feira, 08h00',
					audience: 'Inscritos no treinamento gratuito',
					model: 'variables_model',
					time: '08:00'
				},
				{
					id: 'live',
					when: 'Seg 19h45',
					title: 'Começamos em 15 minutos',
					whenLong: 'Segunda-feira, 19h45',
					audience: 'Inscritos no treinamento gratuito',
					model: 'starting_soon',
					time: '19:45'
				},
				{
					id: 'cart',
					when: 'Qui 09h00',
					title: 'Abertura do carrinho',
					whenLong: 'Quinta-feira, 09h00',
					audience: 'Inscritos no treinamento gratuito',
					model: 'cart_open',
					time: '09:00'
				},
				{
					id: 'offer',
					when: 'Sex 18h00',
					title: 'Oferta segmentada',
					whenLong: 'Sexta-feira, 18h00',
					audience: 'Quem acompanhou as aulas e ainda não se inscreveu',
					model: 'segmented_followup',
					time: '18:00'
				}
			]
		},
		{
			id: 'event',
			label: 'Por evento',
			short: 'Evento',
			featureId: 'event_automations',
			blurb: 'Dispara quando algo acontece na jornada. Ex.: checkout iniciado (com integração).',
			items: [
				{
					id: 'ev-signup',
					when: 'Inscrição',
					title: 'Boas-vindas',
					whenLong: 'Quando o lead se inscreve',
					audience: 'Quem acabou de se inscrever',
					model: 'welcome',
					time: 'agora'
				},
				{
					id: 'ev-checkout',
					when: 'Checkout',
					title: 'Recuperação de checkout',
					whenLong: 'Checkout iniciado, compra não identificada',
					audience: 'Quem iniciou o checkout e não comprou',
					model: 'checkout_recovery',
					time: 'agora'
				},
				{
					id: 'ev-paid',
					when: 'Evento pago',
					title: 'Confirmação do evento',
					whenLong: 'Quando a inscrição no evento é confirmada',
					audience: 'Inscritos no evento',
					model: 'paid_confirmation',
					time: 'agora'
				}
			]
		},
		{
			id: 'behavior',
			label: 'Comportamento',
			featureId: 'behavioral_automations',
			scenario: 'behavioral_automations',
			blurb: 'Dispara pelo comportamento, como o interesse medido pelo Pulse Heat.',
			items: [
				{
					id: 'bh-heat',
					when: 'Pulse Heat',
					title: 'Interesse em alta',
					whenLong: 'Quando o Pulse Heat cruza o limite definido',
					audience: 'Leads com interesse alto, sem compra identificada',
					model: 'reengagement',
					time: 'agora'
				},
				{
					id: 'bh-page',
					when: 'Página',
					title: 'Visitou a inscrição',
					whenLong: 'Quando visita a página de inscrição',
					audience: 'Quem visitou e não iniciou o checkout',
					model: 'cart_open',
					time: 'agora'
				}
			]
		}
	];

	let modeId = $state<ModeId>('scheduled');
	let itemId = $state('cpl1');
	let typing = $state(false);
	let shown = $state(true);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const mode = $derived(modes.find((entry) => entry.id === modeId) ?? modes[0]);
	const item = $derived(mode.items.find((entry) => entry.id === itemId) ?? mode.items[0]);
	const model = $derived(MESSAGE_MODELS[item.model]);

	const chosen = $derived(variablesIn(model.paragraphs));

	const message = $derived<PhoneMessage[]>([
		{
			id: `${item.id}-wa`,
			from: 'brand',
			text: '',
			time: item.time,
			rich: {
				paragraphs: model.paragraphs.map((paragraph) => fill(paragraph, lead.values)),
				cta: model.cta
			}
		}
	]);

	const present = () => {
		clearTimeout(timer);
		if (prefersReducedMotion()) {
			typing = false;
			shown = true;
			return;
		}
		shown = false;
		typing = true;
		timer = setTimeout(() => {
			typing = false;
			shown = true;
		}, 650);
	};

	onMount(() => () => clearTimeout(timer));

	const chooseMode = (id: ModeId) => {
		if (id === modeId) return;
		const next = modes.find((entry) => entry.id === id) ?? modes[0];
		modeId = id;
		itemId = next.items[0].id;
		present();
		track('FeatureExplore', {
			featureId: next.featureId,
			scenario: next.scenario,
			detail: `mode_${id}`
		});
	};

	const pick = (id: string) => {
		if (id === itemId) return;
		itemId = id;
		present();
		track('FeatureExplore', {
			featureId: mode.featureId,
			scenario: mode.scenario,
			detail: id
		});
	};

	const onkey = (
		event: KeyboardEvent,
		list: string[],
		current: string,
		apply: (id: string) => void
	) => {
		const last = list.length - 1;
		const at = list.indexOf(current);
		let next = -1;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = at === last ? 0 : at + 1;
		else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = at === 0 ? last : at - 1;
		if (next < 0) return;
		event.preventDefault();
		apply(list[next]);
		(event.currentTarget as HTMLElement)
			.closest('[role=tablist]')
			?.querySelectorAll<HTMLElement>('[role=tab]')
			[next]?.focus();
	};
</script>

<div class="cl-card cl-dx" use:reveal>
	<div class="cl-dx-top">
		<div class="cl-dx-modes" role="tablist" aria-label="Tipos de comunicação">
			{#each modes as entry (entry.id)}
				<button
					type="button"
					role="tab"
					class="cl-choice-item"
					class:is-on={entry.id === modeId}
					id="cl-dx-mode-{entry.id}"
					aria-selected={entry.id === modeId}
					aria-controls="cl-dx-panel"
					tabindex={entry.id === modeId ? 0 : -1}
					onclick={() => chooseMode(entry.id)}
					onkeydown={(event) =>
						onkey(
							event,
							modes.map((m) => m.id),
							modeId,
							(id) => chooseMode(id as ModeId)
						)}
					>{#if entry.short}<span class="cl-dx-long">{entry.label}</span><span class="cl-dx-short"
							>{entry.short}</span
						>{:else}{entry.label}{/if}</button
				>
			{/each}
		</div>
		<p class="cl-dx-blurb">{mode.blurb}</p>
		<em class="cl-tag cl-dx-tag">Prévia conceitual</em>
	</div>

	<div class="cl-dx-grid" role="tabpanel" id="cl-dx-panel" aria-labelledby="cl-dx-mode-{modeId}">
		<ol class="cl-dx-rail" aria-label="Disparos">
			{#each mode.items as entry (entry.id)}
				<li>
					<button
						type="button"
						class="cl-dx-item"
						class:is-on={entry.id === itemId}
						aria-pressed={entry.id === itemId}
						onclick={() => pick(entry.id)}
					>
						<b>{entry.when}</b>
						<span>{entry.title}</span>
					</button>
				</li>
			{/each}
		</ol>

		<div class="cl-dx-detail">
			<dl class="cl-dx-facts">
				<div>
					<dt>Data e horário</dt>
					<dd>{item.whenLong}</dd>
				</div>
				<div>
					<dt>Público</dt>
					<dd>{item.audience}</dd>
				</div>
				<div>
					<dt>Modelo</dt>
					<dd>{model.label}</dd>
				</div>
				<div class="is-wide">
					<dt>Variáveis</dt>
					<dd class="cl-dx-vars">
						{#each chosen as variable (variable)}<code>{VARIABLE_LABELS[variable] ?? variable}</code
							>{/each}
					</dd>
				</div>
			</dl>
		</div>

		<div class="cl-dx-chat">
			<PhoneChat
				channel="whatsapp"
				compact
				bare
				label=""
				messages={shown ? message : []}
				{typing}
			/>
		</div>
	</div>
</div>
