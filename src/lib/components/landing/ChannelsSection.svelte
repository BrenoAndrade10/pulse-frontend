<script lang="ts">
	import FeatureTabs from './FeatureTabs.svelte';
	import Icon from './Icon.svelte';
	import InstagramPanels from './InstagramPanels.svelte';
	import WhatsappPanels from './WhatsappPanels.svelte';
	import EmailPanels from './EmailPanels.svelte';

	type Channel = 'instagram' | 'whatsapp' | 'email';

	const channels: { id: Channel; label: string; icon: string; soon: boolean }[] = [
		{ id: 'instagram', label: 'Instagram', icon: 'instagram', soon: false },
		{ id: 'whatsapp', label: 'WhatsApp', icon: 'comment', soon: true },
		{ id: 'email', label: 'E-mail', icon: 'mail', soon: true }
	];

	const steps = {
		instagram: [
			{ id: 'comentario', icon: 'comment', title: 'Comentário no Reel', text: 'A pessoa comenta a palavra-chave e a Pulse identifica na hora.', meta: '1' },
			{ id: 'direct', icon: 'send', title: 'Convite no Direct', text: 'O link rastreado chega por mensagem privada, sem ação manual.', meta: '2' },
			{ id: 'clique', icon: 'click', title: 'Clique no link', text: 'Cada clique e visita fica ligado à publicação de origem.', meta: '3' },
			{ id: 'cadastro', icon: 'user', title: 'Cadastro identificado', text: 'O lead entra com origem, campanha e palavra-chave.', meta: '4' }
		],
		whatsapp: [
			{ id: 'lembrete', icon: 'clock', title: 'Lembrete por etapa', text: 'Escolha quem deve receber e quando, antes da aula.', meta: '1' },
			{ id: 'conversa', icon: 'comment', title: 'Mensagem na conversa', text: 'O lembrete chega com o link rastreado da aula.', meta: '2' },
			{ id: 'resultado', icon: 'chart', title: 'Entregas e cliques', text: 'Acompanhe quem recebeu, leu e clicou.', meta: '3' }
		],
		email: [
			{ id: 'compor', icon: 'mail', title: 'Campanha para um segmento', text: 'Envie o replay a quem não assistiu, pelo seu domínio.', meta: '1' },
			{ id: 'entrega', icon: 'chart', title: 'Entrega com saúde', text: 'Acompanhe entregas, cliques e a autenticação do domínio.', meta: '2' },
			{ id: 'cliques', icon: 'click', title: 'Cliques por link', text: 'Veja quais links geraram ação e quem clicou.', meta: '3' }
		]
	};

	let channel = $state<Channel>('instagram');
</script>

<section class="section-pad channels-section" id="canais">
	<div class="container">
		<div class="section-copy centered reveal">
			<p class="eyebrow">CANAIS</p>
			<h2>Cada canal conversa com o mesmo lead.</h2>
			<p>Do comentário ao e-mail, tudo no mesmo histórico. Escolha um canal e veja o caminho.</p>
		</div>

		<div class="channel-switch" role="tablist" aria-label="Canais">
			{#each channels as item}
				<button
					type="button"
					role="tab"
					class="channel-pill"
					class:active={channel === item.id}
					aria-selected={channel === item.id}
					onclick={() => (channel = item.id)}
				>
					<Icon name={item.icon} size={16} />
					{item.label}
					{#if item.soon}<em>Em breve</em>{/if}
				</button>
			{/each}
		</div>

		{#key channel}
			<FeatureTabs items={steps[channel]} label="Etapas do canal {channel}">
				{#snippet panel(id)}
					{#if channel === 'instagram'}
						<InstagramPanels {id} />
					{:else if channel === 'whatsapp'}
						<WhatsappPanels {id} />
					{:else}
						<EmailPanels {id} />
					{/if}
				{/snippet}
			</FeatureTabs>
		{/key}
	</div>
</section>

<style>
	.channel-switch {
		display: flex;
		justify-content: center;
		gap: 6px;
		width: fit-content;
		max-width: 100%;
		margin: 36px auto 0;
		padding: 6px;
		border-radius: 999px;
		background: #fff;
		border: 1px solid #e7e4ee;
		box-shadow: 0 8px 24px rgba(40, 24, 90, 0.07);
		overflow-x: auto;
	}
	.channel-pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 11px 20px;
		border: 0;
		border-radius: 999px;
		background: transparent;
		color: #6a6579;
		font: inherit;
		font-size: 14px;
		font-weight: 650;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background 0.3s ease,
			color 0.3s ease,
			box-shadow 0.3s ease;
	}
	.channel-pill:hover {
		color: #14121f;
	}
	.channel-pill:focus-visible {
		outline: 2px solid #7045ff;
		outline-offset: 2px;
	}
	.channel-pill.active {
		background: #14121f;
		color: #fff;
		box-shadow: 0 8px 20px rgba(20, 18, 31, 0.25);
	}
	.channel-pill em {
		padding: 2px 8px;
		border-radius: 999px;
		background: #fff1d6;
		color: #a1650a;
		font-size: 10px;
		font-style: normal;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
</style>
