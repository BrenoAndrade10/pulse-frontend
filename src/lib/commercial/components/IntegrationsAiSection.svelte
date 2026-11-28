<script lang="ts">
	import '../styles/future.css';
	import { onVisible, section, track } from '../analytics/index.ts';
	import Choice from './Choice.svelte';
	import Icon from './Icon.svelte';
	import { reveal } from './motion';

	const integrations = [
		{ id: 'hotmart', label: 'Hotmart', text: 'Dados de vendas e eventos de checkout.' },
		{ id: 'kiwify', label: 'Kiwify', text: 'Dados de vendas e eventos de checkout.' },
		{ id: 'meta', label: 'Meta Ads', text: 'Origem e campanhas conectadas aos leads.' },
		{ id: 'telegram', label: 'Telegram', text: 'Mais um canal de comunicação.' },
		{ id: 'webinar', label: 'Webinar', text: 'Plataformas de webinar e participação em eventos.' },
		{ id: 'others', label: 'Outras', text: 'Novas conexões, conforme a evolução da plataforma.' }
	];

	const uses = [
		{
			id: 'data',
			label: 'Interpretar dados',
			text: 'Interpretar os dados da operação.',
			ask: 'Como foi a captação desta semana?'
		},
		{
			id: 'patterns',
			label: 'Padrões',
			text: 'Identificar padrões comportamentais.',
			ask: 'O que os leads engajados têm em comum?'
		},
		{
			id: 'opportunities',
			label: 'Oportunidades',
			text: 'Sugerir oportunidades.',
			ask: 'Quem devo abordar primeiro hoje?'
		},
		{
			id: 'segments',
			label: 'Segmentações',
			text: 'Auxiliar na criação de segmentações.',
			ask: 'Liste quem viu a oferta e ainda não comprou.'
		},
		{
			id: 'actions',
			label: 'Ações comerciais',
			text: 'Recomendar ações comerciais.',
			ask: 'O que ajustar nos próximos envios?'
		}
	];

	let integration = $state('hotmart');
	let useCase = $state('data');

	const chooseIntegration = (id: string) => {
		if (id === integration) return;
		integration = id;
		track('FeatureExplore', { featureId: 'integrations', detail: id });
	};
	const chooseUse = (id: string) => {
		if (id === useCase) return;
		useCase = id;
		track('FeatureExplore', { featureId: 'ai', detail: id });
	};
</script>

<section
	class="cl-sec cl-a-future"
	id="integracoes-ia"
	tabindex="-1"
	aria-labelledby="cl-future-title"
	use:section={{ id: 'integrations_ai', featureId: 'integrations' }}
>
	<div class="cl-wrap">
		<header class="cl-head" use:reveal>
			<p class="cl-eyebrow">INTEGRAÇÕES E IA <em class="cl-tag cl-tag-plan">Planejado</em></p>
			<h2 id="cl-future-title">Um ecossistema preparado para evoluir com você.</h2>
			<p class="cl-sub">Conexões externas e IA são visão de futuro: ainda não estão disponíveis.</p>
		</header>

		<div class="cl-future-grid">
			<div class="cl-card" use:reveal>
				<div class="cl-card-head">
					<p class="cl-card-title"><Icon name="plug" size={18} />Integrações</p>
					<em class="cl-tag cl-tag-plan">Planejado</em>
				</div>
				<Choice
					mode="tabs"
					id="cl-int"
					label="Integrações planejadas"
					options={integrations}
					value={integration}
					onchoose={chooseIntegration}
				/>
				<div
					role="tabpanel"
					id="cl-int-panel"
					aria-labelledby="cl-int-tab-{integration}"
					class="cl-future-panel"
				>
					{#each integrations as item (item.id)}
						<div
							class="cl-future-item"
							class:is-on={item.id === integration}
							aria-hidden={item.id === integration ? undefined : 'true'}
						>
							<b>{item.label}<em class="cl-tag cl-tag-plan">Planejado</em></b>
							<p>{item.text}</p>
						</div>
					{/each}
				</div>
			</div>

			<div
				class="cl-card cl-a-ai"
				use:reveal={{ delay: 120 }}
				use:onVisible={{ event: 'FeatureView', props: { featureId: 'ai' }, ratio: 0.5, once: true }}
			>
				<div class="cl-card-head">
					<p class="cl-card-title"><Icon name="spark" size={18} />Inteligência artificial</p>
					<em class="cl-tag cl-tag-plan">Em desenvolvimento</em>
				</div>
				<Choice
					mode="tabs"
					id="cl-ai"
					label="Usos planejados da IA"
					options={uses}
					value={useCase}
					onchoose={chooseUse}
				/>
				<div
					role="tabpanel"
					id="cl-ai-panel"
					aria-labelledby="cl-ai-tab-{useCase}"
					class="cl-future-panel"
				>
					{#each uses as item (item.id)}
						<div
							class="cl-future-item"
							class:is-on={item.id === useCase}
							aria-hidden={item.id === useCase ? undefined : 'true'}
						>
							<b>{item.text}</b>
							<p class="cl-ask">
								<Icon name="chat" size={14} />Exemplo de pergunta: “{item.ask}”
							</p>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<p class="cl-future-note">
			Nomes de plataformas são citados apenas como referência de visão futura, sem parceria ou
			certificação. Nenhuma funcionalidade de IA está disponível hoje.
		</p>
	</div>
</section>
