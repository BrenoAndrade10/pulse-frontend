<script lang="ts">
	import '../styles/communication.css';
	import '../styles/channels.css';
	import { section } from '../analytics/index.ts';
	import ChannelHead from './communication/ChannelHead.svelte';
	import DispatchExplorer from './communication/DispatchExplorer.svelte';
	import EmailSequence from './communication/EmailSequence.svelte';
	import InstagramAutomation from './communication/InstagramAutomation.svelte';
	import MultichannelJourney from './communication/MultichannelJourney.svelte';
	import PersonalizationDemo from './communication/PersonalizationDemo.svelte';
	import IntermediateCta from './IntermediateCta.svelte';
	import { CONSENT_NOTE } from './messages';
	import { reveal } from './motion';
</script>

<section
	class="cl-sec cl-a-comm"
	id="comunicacao"
	tabindex="-1"
	aria-labelledby="cl-comm-title"
	use:section={{ id: 'communication' }}
>
	<div class="cl-wrap">
		<header class="cl-head" use:reveal>
			<p class="cl-eyebrow">COMUNICAÇÃO</p>
			<h2 id="cl-comm-title">Diferentes canais. Uma única jornada.</h2>
			<p class="cl-sub">
				Conecte suas interações no Instagram, suas campanhas de e-mail e suas comunicações pelo
				WhatsApp para construir uma experiência mais relevante para cada lead.
			</p>
		</header>

		<div class="cl-cm-stack">
			<InstagramAutomation />
			<EmailSequence />
			<div class="cl-sub-block cl-ch-block-wa">
				<ChannelHead
					channel="whatsapp"
					icon="chat"
					kicker="WhatsApp · proximidade e conversão"
					title="Uma campanha. Uma conversa para cada lead."
					desc="Mensagens individuais, programadas ou acionadas pelo comportamento, com o contexto de cada lead."
				/>
				<div class="cl-wa-stack">
					<PersonalizationDemo />
					<DispatchExplorer />
				</div>
			</div>
		</div>

		<MultichannelJourney />

		<div class="cl-cm-foot">
			<IntermediateCta
				label="Conhecer os planos"
				kind="pricing"
				target="planos"
				ctaSource="communication_cta"
			/>
			<p class="cl-cm-note">{CONSENT_NOTE} Dados fictícios.</p>
		</div>
	</div>
</section>
