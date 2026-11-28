<script lang="ts">
	import { section, track } from '../analytics/index.ts';
	import Icon from './Icon.svelte';
	import { countUp, live, parallax } from './motion';
	import { anchorClick } from './nav';

	const journey = [
		{ label: 'Cadastro', when: '09:13' },
		{ label: 'Mensagem recebida', when: '19:45' },
		{ label: 'Clique na oferta', when: '20:34' }
	];

	const explore = (event: MouseEvent) => {
		track('HeroCTAClick', { ctaSource: 'hero_primary' });
		anchorClick(event, 'problema');
	};
	const plans = (event: MouseEvent) => {
		track('HeroCTAClick', { ctaSource: 'hero_secondary' });
		track('PricingClick', { ctaSource: 'hero_secondary' });
		anchorClick(event, 'planos');
	};
</script>

<section
	class="cl-sec cl-hero cl-a-hero"
	id="inicio"
	tabindex="-1"
	aria-labelledby="cl-hero-title"
	use:section={{ id: 'hero' }}
>
	<div class="cl-wrap cl-hero-grid">
		<div class="cl-hero-copy">
			<p class="cl-hero-badge">
				<span class="cl-seal-dot" aria-hidden="true"></span>Plataforma em desenvolvimento · acesso
				antecipado
			</p>
			<h1 id="cl-hero-title">Toda a sua operação digital. Finalmente conectada.</h1>
			<p class="cl-lead">
				Descubra quais leads demonstram mais interesse, acompanhe suas jornadas e automatize
				ofertas, disparos e comunicações em um único ecossistema.
			</p>
			<div class="cl-cta-row">
				<a class="cl-btn cl-btn-primary" href="#problema" onclick={explore}>Conhecer a Pulse</a>
				<a class="cl-btn cl-btn-ghost" href="#planos" onclick={plans}>Ver planos</a>
			</div>
			<p class="cl-hero-sign">Rastreie. Entenda. Automatize. Venda.</p>
		</div>

		<div class="cl-hv-wrap" use:live use:parallax>
			<div
				class="cl-hv"
				role="img"
				aria-label="Prévia conceitual da interface da Pulse: a jornada do lead alimenta o Pulse Heat, que aciona uma automação e uma comunicação personalizada, com dados fictícios."
			>
				<div class="cl-hv-frame" aria-hidden="true">
					<div class="cl-hv-bar">
						<span class="cl-hv-dots"><i></i><i></i><i></i></span>
						<span class="cl-hv-title">Visão geral</span>
						<em class="cl-tag">Prévia conceitual</em>
					</div>
					<div class="cl-hv-kpis">
						<div><small>Leads captados</small><b use:countUp={{ to: 1284 }}>1.284</b></div>
						<div><small>Visitas à oferta</small><b use:countUp={{ to: 612 }}>612</b></div>
						<div>
							<small>Leads quentes</small><b use:countUp={{ to: 47, duration: 1100 }}>47</b>
						</div>
					</div>
					<div class="cl-hv-cols">
						<div class="cl-hv-card">
							<p class="cl-hv-label"><span class="cl-hv-n">1</span>Jornada do lead</p>
							<ol class="cl-hv-journey">
								{#each journey as item, index (item.label)}
									<li style="--i:{index}">
										<i></i><span>{item.label}</span><small>{item.when}</small>
									</li>
								{/each}
							</ol>
						</div>
						<div class="cl-hv-card cl-hv-heat">
							<p class="cl-hv-label"><span class="cl-hv-n">2</span>Pulse Heat</p>
							<div class="cl-hv-ring">
								<svg viewBox="0 0 80 80" width="84" height="84">
									<circle class="cl-hv-track" cx="40" cy="40" r="32" />
									<circle class="cl-hv-arc" cx="40" cy="40" r="32" pathLength="100" />
								</svg>
								<b use:countUp={{ to: 75, duration: 1500 }}>75</b>
							</div>
							<span class="cl-chip cl-chip-hot">Quente</span>
						</div>
					</div>
					<div class="cl-hv-auto">
						<span class="cl-hv-auto-ico"><Icon name="bolt" size={16} /></span>
						<div>
							<p><span class="cl-hv-n">3</span>Heat ≥ 75, ainda sem compra</p>
							<small>Aciona uma oferta personalizada</small>
						</div>
					</div>
					<div class="cl-hv-msg">
						<span class="cl-chip cl-chip-wa"><Icon name="chat" size={13} />4 · WhatsApp</span>
						<p>“Oi, Lucas! Vimos que você voltou à oferta. Posso tirar alguma dúvida?”</p>
					</div>
				</div>
			</div>
			<p class="cl-seal">
				<span class="cl-seal-dot" aria-hidden="true"></span>Prévia do produto em desenvolvimento.
			</p>
		</div>
	</div>
</section>
