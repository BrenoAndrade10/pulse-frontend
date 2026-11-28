<script lang="ts">
	import { onMount } from 'svelte';
	import { initAnalytics } from '#lib/commercial/analytics/index.ts';
	import '#lib/commercial/styles/base.css';
	import '#lib/commercial/styles/hero.css';
	import '#lib/commercial/styles/sections.css';
	import AutomationsSection from '#lib/commercial/components/AutomationsSection.svelte';
	import ConsentNotice from '#lib/commercial/components/ConsentNotice.svelte';
	import CommercialFooter from '#lib/commercial/components/CommercialFooter.svelte';
	import CommercialHeader from '#lib/commercial/components/CommercialHeader.svelte';
	import CommunicationSection from '#lib/commercial/components/CommunicationSection.svelte';
	import HeatSection from '#lib/commercial/components/HeatSection.svelte';
	import HeroSection from '#lib/commercial/components/HeroSection.svelte';
	import IntegrationsAiSection from '#lib/commercial/components/IntegrationsAiSection.svelte';
	import PricingSection from '#lib/commercial/components/PricingSection.svelte';
	import ProblemSection from '#lib/commercial/components/ProblemSection.svelte';
	import SignupModal from '#lib/commercial/components/SignupModal.svelte';
	import StrategiesSection from '#lib/commercial/components/StrategiesSection.svelte';
	import TrackingSection from '#lib/commercial/components/TrackingSection.svelte';

	onMount(() => initAnalytics());
</script>

<svelte:head>
	<title>Pulse Lead — Rastreie. Entenda. Automatize. Venda.</title>
	<meta
		name="description"
		content="A Pulse conecta tracking, jornada dos leads, Pulse Heat, automações e comunicação para lançamentos e vendas no perpétuo. Conheça a prévia do produto em desenvolvimento."
	/>
	<meta property="og:title" content="Pulse Lead — Rastreie. Entenda. Automatize. Venda." />
	<meta
		property="og:description"
		content="Toda a sua operação digital. Finalmente conectada: tracking, Pulse Heat, automações e comunicação em um só ecossistema."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/brand/pulse-lead-og.svg" />
	<meta name="twitter:card" content="summary_large_image" />
	<link rel="canonical" href={import.meta.env.PUBLIC_SITE_URL || ''} />
</svelte:head>

<div class="cl-page">
	<CommercialHeader />
	<main>
		<HeroSection />
		<ProblemSection />
		<TrackingSection />
		<HeatSection />
		<AutomationsSection />
		<CommunicationSection />
		<StrategiesSection />
		<IntegrationsAiSection />
		<PricingSection />
	</main>
	<CommercialFooter />
</div>
<SignupModal />
<ConsentNotice />
