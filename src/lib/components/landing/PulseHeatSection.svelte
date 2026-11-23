<script lang="ts">
	import FeatureTabs from './FeatureTabs.svelte';
	import HeatPanels from './HeatPanels.svelte';

	const items = [
		{
			id: 'ranking',
			icon: 'flame',
			title: 'Quem está quente agora',
			text: 'Veja os leads com mais atividade, do mais ao menos engajado.',
			meta: 'Agora'
		},
		{
			id: 'sinais',
			icon: 'list',
			title: 'Por que essa lead',
			text: 'Cada prioridade vem com os sinais que a explicam.',
			meta: '12 min'
		},
		{
			id: 'proximo',
			icon: 'target',
			title: 'Próximo passo sugerido',
			text: 'Saiba o que fazer agora e com quem falar primeiro.',
			meta: 'Hoje'
		},
		{
			id: 'segmentos',
			icon: 'filter',
			title: 'Segmentos para atenção',
			text: 'Agrupe quem recebeu o convite e ainda não agiu.',
			meta: 'Semana'
		}
	];
</script>

<section class="heat-section section-pad" id="pulse-heat">
	<div class="heat-orb orb-one"></div>
	<div class="heat-orb orb-two"></div>
	<div class="container">
		<div class="section-copy light-copy centered reveal">
			<p class="eyebrow">PULSE HEAT</p>
			<h2>Saiba quem priorizar — e por quê.</h2>
			<p>Sinais de interesse, não previsão de compra. Escolha um momento e veja como a Pulse ajuda.</p>
		</div>
		<FeatureTabs {items} dark label="Funcionalidades do Pulse Heat">
			{#snippet panel(id)}
				<HeatPanels {id} />
			{/snippet}
		</FeatureTabs>
	</div>
</section>
