<script lang="ts">
	import Icon from './Icon.svelte';
	import { countUp } from './motion';

	let { id }: { id: string } = $props();

	const leads = [
		{ initials: 'SC', name: 'Stefani Costa', signal: 'Voltou à página da oferta', when: 'há 12 min', level: 'Alta', heat: 5, h: 290 },
		{ initials: 'RL', name: 'Rafael Lima', signal: 'Clicou no link da aula', when: 'há 34 min', level: 'Alta', heat: 4, h: 210 },
		{ initials: 'CD', name: 'Camila Duarte', signal: 'Abriu o convite 2 vezes', when: 'há 2 h', level: 'Média', heat: 3, h: 330 },
		{ initials: 'BA', name: 'Bruno Alves', signal: 'Cadastrou-se na aula', when: 'ontem', level: 'Média', heat: 2, h: 20 },
		{ initials: 'JR', name: 'Júlia Ramos', signal: 'Recebeu o convite', when: 'ontem', level: 'Baixa', heat: 1, h: 160 }
	];

	const hourly = [4, 3, 2, 2, 1, 2, 5, 8, 12, 15, 18, 22, 20, 17, 24, 28, 31, 26, 38, 44, 52, 41, 30, 18];
	const hourlyMax = Math.max(...hourly);

	const timeline = [
		{ icon: 'target', title: 'Voltou à página da oferta', meta: 'Segunda visita', when: 'há 12 min' },
		{ icon: 'click', title: 'Clicou no link da aula', meta: 'Reel · Aula gratuita', when: 'há 28 min' },
		{ icon: 'mail', title: 'Abriu o convite', meta: 'E-mail de lembrete', when: 'há 1 h' },
		{ icon: 'user', title: 'Cadastrou-se na aula gratuita', meta: 'Instagram · Reel', when: 'ontem' }
	];

	const segments = [
		{ name: 'Convite entregue · sem clique', value: 240, w: 100 },
		{ name: 'Clicou no link · não voltou', value: 156, w: 65 },
		{ name: 'Voltou à página da oferta', value: 72, w: 30 },
		{ name: 'Assistiu à aula · sem compra', value: 48, w: 20 }
	];
</script>

<div class="lp-win dark">
	<div class="lp-bar">
		<span class="lp-dots"><i></i><i></i><i></i></span>
		<span>Pulse Heat · Aula gratuita</span>
	</div>
	<div class="lp-body">
		{#if id === 'ranking'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="flame" /></span>
					<div>Quem está quente agora<small>Últimas 24 horas</small></div>
				</div>
				<span class="lp-chip green">12 com alta atividade</span>
			</div>
			<div class="lp-grid2">
				<div class="lp-card lp-pop" style="--i: 1">
					<p class="lp-label">Leads por atividade</p>
					<ul class="lp-list">
						{#each leads as lead, index}
							<li class="lead" class:top={index === 0} style="--i: {index + 2}">
								<span class="lp-avatar" style="--h: {lead.h}">{lead.initials}</span>
								<span class="lead-copy"><b>{lead.name}</b><small>{lead.signal} · {lead.when}</small></span>
								<span class="lp-meter">
									{#each Array(5) as _, bar}<i class:on={bar < lead.heat}></i>{/each}
								</span>
							</li>
						{/each}
					</ul>
				</div>
				<div class="lp-card lp-pop" style="--i: 2">
					<p class="lp-label">Sinais hoje</p>
					<div class="lp-row">
						<span class="lp-big" use:countUp={{ to: 187, duration: 1400 }}>187</span>
						<span class="lp-chip green">+24%</span>
					</div>
					<p class="lp-muted" style="margin: 6px 0 14px">Cliques, visitas e aberturas de todos os leads.</p>
					<div class="hours" aria-hidden="true">
						{#each hourly as value, index}
							<i style="--h: {(value / hourlyMax) * 100}%; --o: {0.35 + (value / hourlyMax) * 0.65}; --d: {index * 25}ms"></i>
						{/each}
					</div>
					<div class="hours-axis"><span>0h</span><span>12h</span><span>23h</span></div>
				</div>
			</div>
		{:else if id === 'sinais'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-avatar lg" style="--h: 290">SC</span>
					<div>Stefani Costa<small>Lead desde 14 mai 2024 · Instagram</small></div>
				</div>
				<span class="lp-chip pink">Alta atividade</span>
			</div>
			<div class="lp-grid2">
				<div class="lp-card lp-pop" style="--i: 1">
					<p class="lp-label">Por que ela está em destaque</p>
					<ol class="lp-list timeline">
						{#each timeline as item, index}
							<li style="--i: {index + 2}">
								<span class="t-ico"><Icon name={item.icon} size={15} /></span>
								<span class="t-copy"><b>{item.title}</b><small>{item.meta}</small></span>
								<small class="t-when">{item.when}</small>
							</li>
						{/each}
					</ol>
				</div>
				<div class="lp-card lp-pop" style="--i: 2">
					<p class="lp-label">Atividade por hora</p>
					<div class="hours tall" aria-hidden="true">
						{#each hourly as value, index}
							<i style="--h: {(value / hourlyMax) * 100}%; --o: {0.35 + (value / hourlyMax) * 0.65}; --d: {index * 25}ms"></i>
						{/each}
					</div>
					<div class="hours-axis"><span>0h</span><span>12h</span><span>23h</span></div>
					<div class="lp-row" style="margin-top: 16px">
						<div><span class="lp-big" use:countUp={{ to: 4, duration: 900 }}>4</span><p class="lp-muted" style="margin: 4px 0 0">sinais em 24 h</p></div>
						<div><span class="lp-big" use:countUp={{ to: 2, duration: 900 }}>2</span><p class="lp-muted" style="margin: 4px 0 0">visitas à oferta</p></div>
					</div>
				</div>
			</div>
		{:else if id === 'proximo'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="target" /></span>
					<div>Próximo passo sugerido<small>Para Stefani Costa</small></div>
				</div>
				<span class="lp-chip">Hoje</span>
			</div>
			<div class="suggest lp-pop" style="--i: 1">
				<small>PRÓXIMO PASSO SUGERIDO</small>
				<strong>Priorizar o contato sobre a oferta</strong>
			</div>
			<div class="lp-grid2">
				<div class="lp-card lp-pop" style="--i: 2">
					<p class="lp-label">Por que agora</p>
					<ul class="lp-list reasons">
						<li style="--i: 3"><Icon name="check" size={15} />2 acessos à oferta em 30 min</li>
						<li style="--i: 4"><Icon name="check" size={15} />Clicou no link da aula hoje</li>
						<li style="--i: 5"><Icon name="check" size={15} />Ainda sem compra registrada</li>
					</ul>
				</div>
				<div class="lp-card lp-pop" style="--i: 3">
					<p class="lp-label">Mensagem sugerida</p>
					<p class="draft">Oi, Stefani! Vi que você passou pela página da oferta. Posso te ajudar com alguma dúvida?</p>
					<div class="lp-row" style="justify-content: flex-start; flex-wrap: wrap; gap: 8px; margin-top: 12px">
						<span class="lp-btn primary">Abrir conversa</span>
						<span class="lp-btn">Marcar contatada</span>
					</div>
				</div>
			</div>
		{:else}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="filter" /></span>
					<div>Segmentos para atenção<small>Lançamento atual</small></div>
				</div>
				<span class="lp-chip"><span use:countUp={{ to: 516, duration: 1200 }}>516</span>&nbsp;leads</span>
			</div>
			<div class="lp-card lp-pop" style="--i: 1">
				<ul class="lp-list segs">
					{#each segments as segment, index}
						<li style="--i: {index + 2}">
							<div class="lp-row"><b>{segment.name}</b><span class="lp-muted">{segment.value} leads</span></div>
							<div class="lp-track"><i style="--w: {segment.w}%; --i: {index}"></i></div>
						</li>
					{/each}
				</ul>
				<div class="lp-row" style="margin-top: 18px">
					<span class="lp-muted">Segmento mais crítico: convite entregue sem clique</span>
					<span class="lp-btn primary">Ver leads →</span>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.lead {
		display: grid;
		grid-template-columns: 38px 1fr auto;
		gap: 12px;
		align-items: center;
		padding: 9px 10px;
		border-radius: 14px;
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.lead.top {
		background: rgba(168, 85, 247, 0.14);
		box-shadow: inset 0 0 0 1px rgba(196, 160, 255, 0.35);
	}
	.lead-copy b {
		display: block;
		font-size: 14px;
	}
	.lead-copy small {
		color: var(--w-muted);
		font-size: 12px;
	}
	.hours {
		display: flex;
		align-items: flex-end;
		gap: 3px;
		height: 74px;
	}
	.hours.tall {
		height: 120px;
	}
	.hours i {
		flex: 1;
		height: var(--h);
		border-radius: 3px;
		background: linear-gradient(180deg, #ff6bd0, #8b5bff);
		opacity: var(--o);
		transform-origin: bottom;
		animation: lp-rise-bar 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
		animation-delay: calc(var(--d) + 250ms);
	}
	.hours-axis {
		display: flex;
		justify-content: space-between;
		margin-top: 6px;
		color: var(--w-muted);
		font-size: 11px;
	}
	.timeline li {
		display: grid;
		grid-template-columns: 30px 1fr auto;
		gap: 10px;
		align-items: center;
		padding: 8px 4px;
		border-bottom: 1px solid var(--w-line);
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.timeline li:last-child {
		border-bottom: 0;
	}
	.t-ico {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--w-chip);
		color: var(--w-accent);
	}
	.t-copy b {
		display: block;
		font-size: 13px;
	}
	.t-copy small,
	.t-when {
		color: var(--w-muted);
		font-size: 11px;
	}
	.suggest {
		padding: 20px 22px;
		border-radius: 20px;
		border: 1px solid rgba(214, 140, 255, 0.4);
		background: linear-gradient(135deg, rgba(112, 69, 255, 0.34), rgba(212, 67, 216, 0.18));
	}
	.suggest small {
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.14em;
		color: #d9bfff;
	}
	.suggest strong {
		display: block;
		margin-top: 6px;
		font-size: 26px;
		line-height: 1.15;
		letter-spacing: -0.03em;
	}
	.reasons li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 9px 12px;
		border-radius: 12px;
		background: var(--w-chip);
		font-size: 13px;
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.reasons :global(svg) {
		color: #8be5b4;
	}
	.draft {
		margin: 0;
		padding: 12px 14px;
		border-radius: 14px;
		background: var(--w-chip);
		font-size: 13px;
		line-height: 1.55;
	}
	.segs {
		gap: 18px;
	}
	.segs li {
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.segs .lp-row {
		margin-bottom: 8px;
		font-size: 14px;
	}
</style>
