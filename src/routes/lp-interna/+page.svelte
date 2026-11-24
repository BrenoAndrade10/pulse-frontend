<script lang="ts">
	import LandingHeader from '#lib/components/landing/LandingHeader.svelte';
	import LandingHero from '#lib/components/landing/LandingHero.svelte';
	import TrackingSection from '#lib/components/landing/TrackingSection.svelte';
	import PulseHeatSection from '#lib/components/landing/PulseHeatSection.svelte';
	import ChannelsSection from '#lib/components/landing/ChannelsSection.svelte';
	import HowItWorksSection from '#lib/components/landing/HowItWorksSection.svelte';
	import PricingSection from '#lib/components/landing/PricingSection.svelte';
	import FaqSection from '#lib/components/landing/FaqSection.svelte';
	import FinalCta from '#lib/components/landing/FinalCta.svelte';
	import '#lib/components/landing/landing.css';
	import '#lib/components/landing/panels.css';
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
	<title>Pulse Lead — Gestão de lançamentos digitais</title>
	<meta
		name="description"
		content="Acompanhe o funil do seu lançamento e descubra quais leads precisam de atenção."
	/>
	<meta property="og:title" content="Pulse Lead — Gestão de lançamentos digitais" />
	<meta property="og:description" content="Seu lançamento, da captação à próxima decisão." />
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/brand/pulse-logo-dark-trim.png" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="landing-page">
	<LandingHeader />
	<main>
		<LandingHero />
		<TrackingSection />
		<PulseHeatSection />
		<ChannelsSection />
		<HowItWorksSection />
		<PricingSection />
		<FaqSection />
		<FinalCta />
	</main>
</div>
