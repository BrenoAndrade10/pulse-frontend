<script lang="ts">
	import { onMount } from 'svelte';
	import { onVisible, section, track } from '../analytics/index.ts';
	import Icon from './Icon.svelte';
	import { prefersReducedMotion, reveal, whenVisible } from './motion';
	import '../styles/tracking.css';

	type Step = {
		id: string;
		icon: string;
		title: string;
		integration?: boolean;
		fields: { label: string; value: string }[];
	};

	const steps: Step[] = [
		{
			id: 'origin',
			icon: 'link',
			title: 'Lead originado de uma campanha',
			fields: [
				{ label: 'Origem', value: 'Anúncio no Instagram' },
				{ label: 'Campanha', value: 'Lançamento · captação' },
				{ label: 'Horário', value: 'Seg · 09:12' },
				{ label: 'Página', value: 'Página de captura' },
				{ label: 'Interação', value: 'Clique no anúncio' },
				{ label: 'Situação comercial', value: 'Visitante' }
			]
		},
		{
			id: 'signup',
			icon: 'user',
			title: 'Cadastro realizado',
			fields: [
				{ label: 'Origem', value: 'Anúncio no Instagram' },
				{ label: 'Campanha', value: 'Lançamento · captação' },
				{ label: 'Horário', value: 'Seg · 09:13' },
				{ label: 'Página', value: 'Página de captura' },
				{ label: 'Interação', value: 'Formulário enviado' },
				{ label: 'Situação comercial', value: 'Lead identificado' }
			]
		},
		{
			id: 'comm',
			icon: 'send',
			title: 'Interação com uma comunicação',
			fields: [
				{ label: 'Origem', value: 'Mensagem de WhatsApp' },
				{ label: 'Campanha', value: 'Sequência de boas-vindas' },
				{ label: 'Horário', value: 'Seg · 19:45' },
				{ label: 'Página', value: 'Link da aula' },
				{ label: 'Interação', value: 'Clique na mensagem' },
				{ label: 'Situação comercial', value: 'Engajado' }
			]
		},
		{
			id: 'sales',
			icon: 'eye',
			title: 'Acesso à página de vendas',
			fields: [
				{ label: 'Origem', value: 'Link rastreado' },
				{ label: 'Campanha', value: 'Lançamento · captação' },
				{ label: 'Horário', value: 'Ter · 20:30' },
				{ label: 'Página', value: 'Página de vendas' },
				{ label: 'Interação', value: 'Visita à oferta' },
				{ label: 'Situação comercial', value: 'Interessado' }
			]
		},
		{
			id: 'checkout',
			icon: 'cart',
			title: 'Início do checkout',
			integration: true,
			fields: [
				{ label: 'Origem', value: 'Página de vendas' },
				{ label: 'Campanha', value: 'Lançamento · captação' },
				{ label: 'Horário', value: 'Ter · 20:34' },
				{ label: 'Página', value: 'Checkout' },
				{ label: 'Interação', value: 'Checkout iniciado' },
				{ label: 'Situação comercial', value: 'Em checkout' }
			]
		},
		{
			id: 'outcome',
			icon: 'target',
			title: 'Compra identificada ou recuperação',
			integration: true,
			fields: [
				{ label: 'Origem', value: 'Checkout' },
				{ label: 'Campanha', value: 'Lançamento · captação' },
				{ label: 'Horário', value: 'Ter · 20:51' },
				{ label: 'Página', value: 'Checkout' },
				{ label: 'Interação', value: 'Pagamento aprovado ou não concluído' },
				{ label: 'Situação comercial', value: 'Compra ou recuperação' }
			]
		}
	];

	let active = $state(steps.length - 1);
	let started = $state(true);
	let timers: ReturnType<typeof setTimeout>[] = [];
	let note = $state(false);
	let touched = false;

	const stopIntro = () => {
		timers.forEach(clearTimeout);
		timers = [];
	};

	onMount(() => {
		if (!prefersReducedMotion()) {
			started = false;
			active = 0;
		}
		return stopIntro;
	});

	const intro = () => {
		if (prefersReducedMotion() || touched) return;
		started = true;
		active = 0;
		stopIntro();
		timers = steps
			.slice(1)
			.map((_, index) => setTimeout(() => (active = index + 1), (index + 1) * 650));
	};

	const pick = (index: number) => {
		touched = true;
		stopIntro();
		started = true;
		active = index;
		track('FeatureExplore', {
			featureId: 'lead_journey',
			scenario: 'lead_journey',
			detail: steps[index].id
		});
	};

	const toggleNote = () => {
		note = !note;
		if (note)
			track('FeatureExplore', {
				featureId: 'tracking',
				scenario: 'lead_journey',
				detail: 'identification_note'
			});
	};
</script>

<section
	class="cl-sec cl-a-tracking"
	id="tracking"
	tabindex="-1"
	aria-labelledby="cl-tracking-title"
	use:section={{ id: 'tracking', featureId: 'tracking' }}
>
	<div class="cl-wrap">
		<header class="cl-tj-head" use:reveal>
			<p class="cl-eyebrow">TRACKING</p>
			<h2 id="cl-tracking-title">Entenda o que acontece com seus leads em cada etapa.</h2>
			<p class="cl-sub">Veja de onde veio cada lead, o que ele fez e em que etapa está.</p>
		</header>

		<div
			class="cl-tj"
			use:reveal={{ delay: 100 }}
			use:onVisible={{
				event: 'FeatureView',
				props: { featureId: 'lead_journey' },
				ratio: 0.5,
				once: true
			}}
		>
			<div class="cl-tj-top">
				<span class="cl-tj-who">
					<span class="cl-avatar" aria-hidden="true"><Icon name="user" size={16} /></span>
					<b>Lead de exemplo</b>
				</span>
				<em class="cl-tag">Prévia conceitual</em>
			</div>

			<div class="cl-tj-body">
				<ol class="cl-tj-list" use:whenVisible={{ onenter: intro, threshold: 0.5 }}>
					{#each steps as step, index (step.id)}
						<li
							class:is-done={started && index <= active}
							class:is-last={index === steps.length - 1}
						>
							<button
								type="button"
								class="cl-tj-item"
								class:is-active={started && index === active}
								aria-current={index === active ? 'step' : undefined}
								onclick={() => pick(index)}
							>
								<span class="cl-tj-dot"><Icon name={step.icon} size={15} /></span>
								<span class="cl-tj-copy">
									<small
										>Etapa {index + 1}{#if step.integration}<span class="cl-tj-int"
												>com integração</span
											>{/if}</small
									>
									<b>{step.title}</b>
								</span>
							</button>
						</li>
					{/each}
				</ol>

				<div class="cl-tj-panels" aria-live="polite">
					{#each steps as step, index (step.id)}
						<div class="cl-tj-panel" class:is-on={index === active} inert={index !== active}>
							<div class="cl-tj-panel-head">
								<b>{step.title}</b>
								{#if step.integration}<span class="cl-tj-int">com integração</span>{/if}
							</div>
							<dl class="cl-tj-fields">
								{#each step.fields as field (field.label)}
									<div>
										<dt>{field.label}</dt>
										<dd>{field.value}</dd>
									</div>
								{/each}
							</dl>
							{#if step.integration}
								<p class="cl-tj-dep">
									Depende da integração com o checkout ou gateway de pagamento.
								</p>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="cl-tj-foot">
				<button
					type="button"
					class="cl-tj-more"
					aria-expanded={note}
					aria-controls="cl-tj-note"
					onclick={toggleNote}
				>
					<Icon name="eye" size={14} />Anônimo ou identificado?
					<span class="cl-tj-caret" aria-hidden="true">{note ? '−' : '+'}</span>
				</button>
				<p id="cl-tj-note" class="cl-tj-note" hidden={!note}>
					Antes do cadastro, a visita é anônima. A jornada individual depende dos dados do lead,
					como o cadastro em uma página conectada. A Pulse não identifica visitantes anônimos
					automaticamente.
				</p>
				<small class="cl-tj-demo">Dados fictícios.</small>
			</div>
		</div>
	</div>
</section>
