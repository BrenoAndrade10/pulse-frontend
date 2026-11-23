<script lang="ts">
	let annual = false;
	const plans = [
		{ name: 'Pulse Starter', desc: 'Para sua primeira operação', featured: false },
		{ name: 'Pulse Advanced', desc: 'Para operações em crescimento', featured: true },
		{ name: 'Pulse Enterprise', desc: 'Para operações maiores', featured: false }
	];
</script>

<section class="section-pad pricing-section" id="planos">
	<div class="container">
		<div class="section-copy centered reveal">
			<p class="eyebrow">PLANOS</p>
			<h2>Comece no tamanho do seu próximo lançamento.</h2>
			<p>Escolha o ritmo que faz sentido para a sua operação.</p>
			<div class="billing-toggle" role="group" aria-label="Periodicidade de cobrança">
				<button class:active={!annual} onclick={() => (annual = false)}>Mensal</button><button
					class:active={annual}
					onclick={() => (annual = true)}>Anual <span>-20%</span></button
				>
			</div>
		</div>
		<div class="plans-grid">
			{#each plans as plan}<article class:featured={plan.featured} class="plan-card reveal">
					<div class="plan-head">
						<h3>{plan.name}</h3>
						{#if plan.featured}<span class="popular-badge">Mais escolhido</span>{/if}
					</div>
					<p>{plan.desc}</p>
					<div class="plan-price">Preço a definir</div>
					<div class="plan-period">{annual ? 'Cobrança anual' : 'Cobrança mensal'}</div>
					<a class:button-primary={plan.featured} class="button plan-button" href="/register"
						>Começar agora <span>↗</span></a
					>
				</article>{/each}
		</div>
		<p class="pricing-note">Valores e condições em definição.</p>
	</div>
</section>
