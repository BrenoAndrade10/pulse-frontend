<script lang="ts">
	import Icon from './Icon.svelte';
	import { countUp } from './motion';

	let { id }: { id: string } = $props();

	const links = [
		{ name: 'Ver replay', clicks: 89, w: 100 },
		{ name: 'Material de apoio', clicks: 31, w: 35 },
		{ name: 'Falar com a equipe', clicks: 12, w: 14 }
	];

	const hourly = [3, 5, 4, 9, 14, 22, 31, 40, 36, 28, 19, 12];
	const hourlyMax = Math.max(...hourly);

	const recent = [
		{ initials: 'SC', name: 'Stefani Costa', link: 'Ver replay', when: 'há 3 min', h: 290 },
		{ initials: 'RL', name: 'Rafael Lima', link: 'Ver replay', when: 'há 8 min', h: 210 },
		{ initials: 'CD', name: 'Camila Duarte', link: 'Material de apoio', when: 'há 15 min', h: 330 }
	];
</script>

<div class="lp-win">
	<div class="lp-bar">
		<span class="lp-dots"><i></i><i></i><i></i></span>
		<span>E-mail · Acompanhe depois da aula</span>
	</div>
	<div class="lp-body">
		{#if id === 'compor'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="mail" /></span>
					<div>Campanha de e-mail<small>Replay da aula</small></div>
				</div>
				<span class="lp-chip amber">Em breve</span>
			</div>
			<div class="lp-grid2 cols">
				<div class="lp-card lp-mail lp-pop" style="--i: 1">
					<div class="lp-mail-head">
						<span>De: Equipe · contato@seudominio.com</span>
						<span>Para: Inscritos que não assistiram · 240</span>
						<b>O replay já está disponível</b>
					</div>
					<div class="lp-mail-body">
						<p style="margin: 0 0 10px">Oi, <span class="var">{'{{nome}}'}</span>,</p>
						<p style="margin: 0">A aula já está no ar para você assistir quando quiser.</p>
						<span class="lp-mail-cta">Ver replay</span>
					</div>
				</div>
				<div class="stack-col">
					<div class="lp-card lp-pop" style="--i: 2">
						<p class="lp-label">Segmento</p>
						<b>Inscritos que não assistiram</b>
						<p class="lp-muted" style="margin: 4px 0 0">240 leads · Pulse Heat</p>
					</div>
					<div class="lp-card lp-pop" style="--i: 3">
						<p class="lp-label">Envio</p>
						<b>Hoje às 19:00</b>
						<div class="lp-row" style="margin-top: 10px; justify-content: flex-start; gap: 6px">
							<span class="lp-chip">{'{{nome}}'}</span><span class="lp-chip">{'{{link_replay}}'}</span>
						</div>
					</div>
				</div>
			</div>
		{:else if id === 'entrega'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="chart" /></span>
					<div>Entrega<small>O replay já está disponível</small></div>
				</div>
				<span class="lp-chip amber">Em breve</span>
			</div>
			<div class="stats4 lp-pop" style="--i: 1">
				<div class="lp-card"><p class="lp-label">Enviados</p><span class="lp-big" use:countUp={{ to: 240, duration: 1200 }}>240</span></div>
				<div class="lp-card"><p class="lp-label">Entregues</p><span class="lp-big"><span use:countUp={{ to: 98.8, decimals: 1, duration: 1300 }}>98,8</span>%</span></div>
				<div class="lp-card"><p class="lp-label">Cliques</p><span class="lp-big"><span use:countUp={{ to: 37, duration: 1300 }}>37</span>%</span></div>
				<div class="lp-card"><p class="lp-label">Descadastros</p><span class="lp-big"><span use:countUp={{ to: 0.4, decimals: 1, duration: 1300 }}>0,4</span>%</span></div>
			</div>
			<div class="lp-card lp-pop" style="--i: 2">
				<p class="lp-label">Autenticação do domínio</p>
				<div class="auth">
					<span class="lp-chip green"><Icon name="check" size={12} /> DKIM</span>
					<span class="lp-chip green"><Icon name="check" size={12} /> SPF</span>
					<span class="lp-chip green"><Icon name="check" size={12} /> DMARC</span>
					<span class="lp-muted">Enviado pelo seu domínio verificado</span>
				</div>
			</div>
			<div class="lp-card lp-pop" style="--i: 3">
				<p class="lp-label">Cliques ao longo do dia</p>
				<div class="hours" aria-hidden="true">
					{#each hourly as value, index}
						<i style="--h: {(value / hourlyMax) * 100}%; --d: {index * 40}ms"></i>
					{/each}
				</div>
			</div>
		{:else}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="click" /></span>
					<div>Cliques do e-mail<small>Quais links geraram ação</small></div>
				</div>
				<span class="lp-chip amber">Em breve</span>
			</div>
			<div class="lp-grid2 cols">
				<div class="lp-card lp-pop" style="--i: 1">
					<p class="lp-label">Links mais clicados</p>
					<ul class="lp-list bars">
						{#each links as link, index}
							<li style="--i: {index + 2}">
								<div class="lp-row"><b>{link.name}</b><span class="lp-muted">{link.clicks} cliques</span></div>
								<div class="lp-track"><i style="--w: {link.w}%; --i: {index}"></i></div>
							</li>
						{/each}
					</ul>
				</div>
				<div class="lp-card lp-pop" style="--i: 2">
					<p class="lp-label">Quem clicou agora</p>
					<ul class="lp-list">
						{#each recent as person, index}
							<li class="who" style="--i: {index + 3}">
								<span class="lp-avatar" style="--h: {person.h}">{person.initials}</span>
								<span><b>{person.name}</b><small>{person.link}</small></span>
								<small>{person.when}</small>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	.cols {
		align-items: start;
	}
	.var {
		padding: 1px 6px;
		border-radius: 6px;
		background: var(--w-chip);
		color: var(--w-accent);
		font-weight: 650;
	}
	.stack-col {
		display: grid;
		gap: 14px;
		align-content: start;
	}
	.stats4 {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
	}
	.hours {
		display: flex;
		align-items: flex-end;
		gap: 6px;
		height: 84px;
	}
	.hours i {
		flex: 1;
		height: var(--h);
		border-radius: 6px 6px 3px 3px;
		background: linear-gradient(180deg, #a653ff, #7045ff);
		transform-origin: bottom;
		animation: lp-rise-bar 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards;
		animation-delay: calc(var(--d) + 300ms);
	}
	.auth {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.bars {
		gap: 18px;
	}
	.bars li {
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.bars .lp-row {
		margin-bottom: 8px;
		font-size: 14px;
	}
	.who {
		display: grid;
		grid-template-columns: 38px 1fr auto;
		gap: 12px;
		align-items: center;
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.who b {
		display: block;
		font-size: 13px;
	}
	.who small {
		color: var(--w-muted);
		font-size: 12px;
	}
	@media (max-width: 720px) {
		.stats4 {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
