<script lang="ts">
	const faqs = [
		{
			q: 'Para quem é a Pulse?',
			a: 'Para especialistas, infoprodutores e times que querem operar lançamentos com mais clareza, contexto e consistência.'
		},
		{
			q: 'Como a Pulse sabe de onde vêm meus leads?',
			a: 'Você cria um link rastreado para cada anúncio, Reel ou mensagem. Cliques, visitas e cadastros ficam ligados à origem e à campanha, e você acompanha tudo em um só lugar.'
		},
		{
			q: 'O Pulse Heat prevê quem vai comprar?',
			a: 'Não. Ele mostra sinais de interesse, como cliques e retornos à página da oferta, e explica por que um lead merece atenção agora. A decisão de contato continua com você.'
		},
		{
			q: 'Como funciona a automação do Instagram?',
			a: 'A pessoa comenta a palavra-chave no seu Reel, a Pulse envia o convite com o link rastreado por mensagem privada e acompanha o clique e o cadastro que vêm depois.'
		},
		{
			q: 'WhatsApp e e-mail já estão disponíveis?',
			a: 'Ainda não. Os lembretes por etapa no WhatsApp e o acompanhamento por e-mail estão planejados. Quando forem liberados, você será avisado.'
		},
		{
			q: 'Preciso conectar minhas contas para ver o exemplo?',
			a: 'Não. A Pulse apresenta dados de exemplo para você entender a experiência antes de conectar qualquer canal.'
		},
		{
			q: 'Quanto custa?',
			a: 'Os planos Pulse Starter, Pulse Advanced e Pulse Enterprise estão com valores e condições em definição. Se quiser saber mais agora, escreva para oi@pulselead.com.'
		},
		{
			q: 'Como começo?',
			a: 'Crie sua conta, conecte seus canais quando estiver pronto e comece a acompanhar o próximo lançamento em um só lugar.'
		}
	];

	let open = $state(0);

	function toggle(index: number) {
		open = open === index ? -1 : index;
	}

	function onKeydown(event: KeyboardEvent, index: number) {
		const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
		if (!keys.includes(event.key)) return;
		event.preventDefault();
		const last = faqs.length - 1;
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? last
					: event.key === 'ArrowDown'
						? (index + 1) % faqs.length
						: (index - 1 + faqs.length) % faqs.length;
		document.getElementById(`faq-button-${next}`)?.focus();
	}
</script>

<section class="section-pad faq-section" id="faq">
	<div class="container faq-grid">
		<div class="section-copy reveal">
			<p class="eyebrow">DÚVIDAS FREQUENTES</p>
			<h2>O começo pode ser simples.</h2>
			<p>Se a sua pergunta não estiver aqui, fale com a gente.</p>
			<a class="text-link" href="mailto:oi@pulselead.com">oi@pulselead.com ↗</a>
		</div>
		<div class="faq-list reveal reveal-delay">
			{#each faqs as faq, i}
				<div class="faq-item" class:open={open === i}>
					<h3>
						<button
							type="button"
							id="faq-button-{i}"
							aria-expanded={open === i}
							aria-controls="faq-panel-{i}"
							onclick={() => toggle(i)}
							onkeydown={(event) => onKeydown(event, i)}
						>
							<span>{faq.q}</span>
							<span class="faq-plus" aria-hidden="true"></span>
						</button>
					</h3>
					<div
						class="faq-answer"
						id="faq-panel-{i}"
						role="region"
						aria-labelledby="faq-button-{i}"
						inert={open !== i}
					>
						<div><p>{faq.a}</p></div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
