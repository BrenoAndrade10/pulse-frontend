<script lang="ts">
	import HeroShowcase from './HeroShowcase.svelte';
</script>

<section class="hero">
	<div class="container hero-content">
		<div class="hero-copy reveal">
			<p class="eyebrow">GESTÃO DE LANÇAMENTOS DIGITAIS</p>
			<h1>Seu lançamento, da captação à <span>próxima decisão.</span></h1>
			<p class="hero-subtitle">Acompanhe o funil e veja quais leads precisam de atenção.</p>
			<div class="hero-actions">
				<a class="button hero-primary" href="/register">Começar agora</a>
				<a class="hero-secondary" href="#como-funciona"
					>Veja como funciona <span aria-hidden="true">→</span></a
				>
			</div>
		</div>
	</div>
	<div class="hero-stage">
		<HeroShowcase />
	</div>
</section>
