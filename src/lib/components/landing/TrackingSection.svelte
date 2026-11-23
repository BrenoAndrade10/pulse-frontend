<script lang="ts">
	import FeatureTabs from './FeatureTabs.svelte';

	const items = [
		{
			id: 'gerar',
			icon: 'link',
			title: 'Gere um link por campanha',
			text: 'Um link para cada anúncio, Reel ou mensagem, em segundos.',
			meta: '1'
		},
		{
			id: 'origens',
			icon: 'chart',
			title: 'Compare as origens',
			text: 'Veja qual publicação ou anúncio mais traz cliques e cadastros.',
			meta: '2'
		},
		{
			id: 'jornada',
			icon: 'trend',
			title: 'Acompanhe a jornada',
			text: 'Do clique ao cadastro, com o que cada lead fez no caminho.',
			meta: '3'
		}
	];

	const origins = [
		{ name: 'Instagram · Reel', clicks: 560, signups: 280, width: 100 },
		{ name: 'Instagram · Stories', clicks: 342, signups: 141, width: 61 },
		{ name: 'Link da bio', clicks: 198, signups: 72, width: 35 },
		{ name: 'Anúncio pago', clicks: 126, signups: 38, width: 23 }
	];
</script>

<section class="section-pad tracking-section" id="tracking">
	<div class="container">
		<div class="section-copy centered reveal">
			<p class="eyebrow">TRACKING PARA LANÇAMENTOS</p>
			<h2>Saiba de onde vêm seus leads e o que fazem depois.</h2>
			<p>Crie um link por anúncio, Reel ou mensagem e acompanhe cliques, visitas e cadastros.</p>
		</div>
		<FeatureTabs {items} label="Funcionalidades de tracking">
			{#snippet panel(id)}
				<div class="fm-card">
					<div class="fm-head">
						<div class="fm-title"><span class="fm-dot"></span><b>Links rastreados</b></div>
						<span class="fm-tag">Dados de exemplo</span>
					</div>
					{#if id === 'gerar'}
						<div class="fm-form">
							<label style="--i: 0"><small>Origem</small><span class="fm-input">Instagram <em>⌄</em></span></label>
							<label style="--i: 1"><small>Campanha</small><span class="fm-input">Aula gratuita</span></label>
							<span class="fm-btn fm-btn-primary fm-btn-block" style="--i: 2">Gerar link</span>
						</div>
						<div class="fm-result" style="--i: 3">
							<small>Link pronto para usar</small>
							<b>pulselead.com/aula?origem=instagram&amp;camp=aula-gratuita</b>
						</div>
					{:else if id === 'origens'}
						<p class="fm-label">Cliques e cadastros por origem · lançamento atual</p>
						<ul class="fm-segments fm-segments-light">
							{#each origins as origin, index}
								<li style:--i={index}>
									<div><b>{origin.name}</b><span>{origin.clicks} cliques · {origin.signups} cadastros</span></div>
									<i style:--w="{origin.width}%"></i>
								</li>
							{/each}
						</ul>
					{:else}
						<div class="fm-journey">
							<div style="--i: 0">
								<span>01</span><b>Link rastreado</b><small>instagram.com/pulselead</small>
							</div>
							<i aria-hidden="true"></i>
							<div style="--i: 1"><span>02</span><b>Página</b><small>pulselead.com/aula</small></div>
							<i aria-hidden="true"></i>
							<div style="--i: 2"><span>03</span><b>Cadastro</b><small>Lead identificado</small></div>
						</div>
						<p class="fm-label">Stefani Costa · histórico</p>
						<ol class="fm-timeline fm-timeline-light">
							<li style="--i: 0"><b>Cadastrou-se na aula gratuita</b><small>ontem · 19:43</small></li>
							<li style="--i: 1"><b>Visitou a página da aula</b><small>ontem · 19:42</small></li>
							<li style="--i: 2"><b>Clicou no link do Reel</b><small>ontem · 19:42</small></li>
						</ol>
					{/if}
				</div>
			{/snippet}
		</FeatureTabs>
	</div>
</section>
