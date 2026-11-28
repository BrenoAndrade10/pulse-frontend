<script lang="ts">
	import '../styles/future.css';
	import { onVisible, section, track } from '../analytics/index.ts';
	import { signup } from '../signup.svelte.ts';
	import Icon from './Icon.svelte';
	import { reveal, stagger } from './motion';

	const plan = { planId: 'pulse_starter', displayedPrice: 299, currency: 'BRL' };

	const benefits = [
		'Gestão de operações digitais',
		'Tracking',
		'Jornada dos leads',
		'Pulse Heat',
		'Automações',
		'Comunicação integrada',
		'Indicadores centralizados'
	];

	const interest = () => {
		track('PlanInterest', { ...plan, ctaSource: 'pricing_card' });
		signup.open({ source: 'pricing', ...plan });
	};
</script>

<section
	class="cl-sec cl-a-plan"
	id="planos"
	tabindex="-1"
	aria-labelledby="cl-plan-title"
	use:section={{ id: 'pricing' }}
>
	<div class="cl-wrap">
		<header class="cl-head cl-head-center" use:reveal>
			<p class="cl-eyebrow">PLANOS</p>
			<h2 id="cl-plan-title">Comece pelo Pulse Starter.</h2>
		</header>

		<div class="cl-card cl-plan" use:reveal>
			<div class="cl-plan-top">
				<p class="cl-plan-name">Pulse Starter</p>
				<em class="cl-tag">Acesso antecipado</em>
			</div>
			<div
				class="cl-price"
				use:onVisible={{
					event: 'ViewPricing',
					props: { ...plan },
					ratio: 0.6,
					once: true
				}}
			>
				<b>R$ 299</b><span>/mês</span>
			</div>
			<p class="cl-price-note">Preço estimado de lançamento, sujeito a alterações.</p>
			<p class="cl-plan-sub">Benefícios planejados</p>
			<ul class="cl-checks" use:stagger={{ step: 70 }}>
				{#each benefits as benefit (benefit)}
					<li><Icon name="check" size={18} />{benefit}</li>
				{/each}
			</ul>
			<button type="button" class="cl-btn cl-btn-primary cl-btn-block" onclick={interest}>
				Tenho interesse neste plano
			</button>
			<p class="cl-note">
				Condições comerciais, limites e eventuais custos de comunicação serão detalhados antes da
				contratação. Nenhuma cobrança é feita agora.
			</p>
		</div>
	</div>
</section>
