<script lang="ts">
	import Icon from './Icon.svelte';
	import { countUp } from './motion';
	import { buildChart } from './chart';

	let { id }: { id: string } = $props();

	const comments = [
		{ user: 'camila.duarte', text: 'Adorei a ideia!', hit: false, h: 330 },
		{ user: 'stefani.costa', text: 'QUERO', hit: true, h: 290 },
		{ user: 'rafael.lima', text: 'QUERO!!', hit: true, h: 210 },
		{ user: 'bruno.alves', text: 'Que horas começa?', hit: false, h: 20 }
	];

	const chart = buildChart([38, 44, 41, 56, 63, 59, 72, 68, 84, 91, 86, 103, 98, 112], 520, 170);

	const journey = [
		{ icon: 'comment', title: 'Comentou QUERO', when: '19:42' },
		{ icon: 'send', title: 'Recebeu o convite', when: '19:42' },
		{ icon: 'click', title: 'Clicou no link', when: '19:43' },
		{ icon: 'user', title: 'Cadastrou-se', when: '19:44' }
	];
</script>

<div class="lp-win">
	<div class="lp-bar">
		<span class="lp-dots"><i></i><i></i><i></i></span>
		<span>Instagram · Reel Aula gratuita</span>
	</div>
	<div class="lp-body">
		{#if id === 'comentario'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="comment" /></span>
					<div>Comentários no Reel<small>Palavra-chave: QUERO</small></div>
				</div>
				<span class="lp-chip green">Automação ativa</span>
			</div>
			<div class="lp-grid2 cols">
				<div class="reel lp-pop" style="--i: 1">
					<span class="reel-tag">Reel</span>
					<div class="reel-copy">
						<b>Aula gratuita</b>
						<small>Comente QUERO e receba o link no Direct.</small>
					</div>
					<div class="reel-actions">
						<span><Icon name="heart" size={16} /> 1,2 mil</span>
						<span><Icon name="comment" size={16} /> 48</span>
					</div>
				</div>
				<div class="lp-card lp-pop" style="--i: 2">
					<p class="lp-label">Comentários recentes</p>
					<ul class="lp-list">
						{#each comments as comment, index}
							<li class="comment" class:hit={comment.hit} style="--i: {index + 3}">
								<span class="lp-avatar" style="--h: {comment.h}">{comment.user[0].toUpperCase()}</span>
								<span class="c-copy"><b>{comment.user}</b><span>{comment.text}</span></span>
								{#if comment.hit}<span class="lp-chip solid">Detectado</span>{/if}
							</li>
						{/each}
					</ul>
					<div class="lp-row" style="margin-top: 14px">
						<span class="lp-muted"><b class="inline" use:countUp={{ to: 31, duration: 1200 }}>31</b> de 48 usaram a palavra-chave</span>
					</div>
				</div>
			</div>
		{:else if id === 'direct'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="send" /></span>
					<div>Convite no Direct<small>Enviado automaticamente</small></div>
				</div>
				<span class="lp-chip green">Entregue</span>
			</div>
			<div class="lp-grid2 cols">
				<div class="lp-phone lp-pop" style="--i: 1">
					<div class="lp-screen">
						<div class="lp-screen-head">
							<span class="lp-avatar" style="--h: 270">P</span>
							<span>pulselead<small>Instagram Direct</small></span>
						</div>
						<div class="lp-msg in lp-pop" style="--i: 3">Comentei QUERO no Reel <time>19:42</time></div>
						<div class="lp-msg out lp-pop" style="--i: 5">
							Oi, Stefani! Aqui está o link da aula gratuita:
							<span class="lp-linkcard"><b>Aula gratuita</b><small>pulselead.com/aula</small></span>
							<time>19:42 ✓✓</time>
						</div>
					</div>
				</div>
				<div class="stack-col">
					<div class="lp-card lp-pop" style="--i: 2">
						<p class="lp-label">Convites enviados</p>
						<span class="lp-big" use:countUp={{ to: 800, duration: 1400 }}>800</span>
						<p class="lp-muted" style="margin: 6px 0 0">88% de entrega</p>
					</div>
					<div class="lp-card lp-pop" style="--i: 3">
						<p class="lp-label">Tempo até o envio</p>
						<span class="lp-big">&lt; 5 s</span>
						<p class="lp-muted" style="margin: 6px 0 0">Sem ação manual</p>
					</div>
				</div>
			</div>
		{:else if id === 'clique'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico"><Icon name="click" /></span>
					<div>Cliques no link<small>Reel · Aula gratuita</small></div>
				</div>
				<span class="lp-chip green">+18,4%</span>
			</div>
			<div class="stats3 lp-pop" style="--i: 1">
				<div class="lp-card"><p class="lp-label">Cliques</p><span class="lp-big" use:countUp={{ to: 560, duration: 1300 }}>560</span></div>
				<div class="lp-card"><p class="lp-label">Visitas à página</p><span class="lp-big" use:countUp={{ to: 412, duration: 1300 }}>412</span></div>
				<div class="lp-card"><p class="lp-label">Taxa de clique</p><span class="lp-big"><span use:countUp={{ to: 56, duration: 1300 }}>56</span>%</span></div>
			</div>
			<div class="lp-card lp-pop" style="--i: 2">
				<p class="lp-label">Cliques por dia</p>
				<svg viewBox="0 0 520 170" preserveAspectRatio="none" class="spark" aria-hidden="true">
					<defs>
						<linearGradient id="igArea" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stop-color="#7045ff" stop-opacity="0.22" />
							<stop offset="1" stop-color="#7045ff" stop-opacity="0" />
						</linearGradient>
					</defs>
					<path d={chart.area} fill="url(#igArea)" class="spark-area" />
					<path d={chart.line} class="spark-line" pathLength="1" />
				</svg>
			</div>
		{:else}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-avatar lg" style="--h: 290">SC</span>
					<div>Stefani Costa<small>Novo lead identificado</small></div>
				</div>
				<span class="lp-chip green">Cadastrada</span>
			</div>
			<div class="journey lp-pop" style="--i: 1">
				{#each journey as step, index}
					<div class="step" style="--i: {index + 2}">
						<span class="step-ico"><Icon name={step.icon} size={16} /></span>
						<b>{step.title}</b>
						<small>{step.when}</small>
					</div>
				{/each}
			</div>
			<div class="lp-card lp-pop" style="--i: 3">
				<dl class="fields">
					<div><dt>Origem</dt><dd>Instagram · Reel</dd></div>
					<div><dt>Campanha</dt><dd>Aula gratuita</dd></div>
					<div><dt>Palavra-chave</dt><dd>QUERO</dd></div>
					<div><dt>Primeiro clique</dt><dd>Hoje · 19:43</dd></div>
				</dl>
			</div>
		{/if}
	</div>
</div>

<style>
	.cols {
		align-items: start;
	}
	.reel {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		gap: 10px;
		min-height: 300px;
		padding: 18px;
		border-radius: 22px;
		background: linear-gradient(165deg, #7045ff 0%, #d443d8 60%, #ff8a4c 110%);
		color: #fff;
		box-shadow: 0 24px 50px -22px rgba(112, 69, 255, 0.6);
	}
	.reel-tag {
		position: absolute;
		top: 16px;
		left: 16px;
		padding: 4px 10px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.22);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.reel-copy b {
		display: block;
		font-size: 26px;
		line-height: 1.1;
		letter-spacing: -0.03em;
	}
	.reel-copy small {
		display: block;
		margin-top: 6px;
		font-size: 13px;
		opacity: 0.9;
	}
	.reel-actions {
		display: flex;
		gap: 16px;
		font-size: 13px;
		font-weight: 650;
	}
	.reel-actions span {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.comment {
		display: grid;
		grid-template-columns: 34px 1fr auto;
		gap: 10px;
		align-items: center;
		padding: 8px 10px;
		border-radius: 14px;
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.comment.hit {
		background: #efe9ff;
		box-shadow: inset 0 0 0 1px rgba(112, 69, 255, 0.3);
	}
	.comment .lp-avatar {
		width: 34px;
		height: 34px;
	}
	.c-copy b {
		display: block;
		font-size: 13px;
	}
	.c-copy span {
		color: var(--w-muted);
		font-size: 13px;
	}
	.inline {
		color: var(--w-ink);
		font-weight: 700;
	}
	.stack-col {
		display: grid;
		gap: 14px;
		align-content: start;
	}
	.stats3 {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
	}
	.spark {
		display: block;
		width: 100%;
		height: 150px;
	}
	.spark-line {
		fill: none;
		stroke: #7045ff;
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		vector-effect: non-scaling-stroke;
		animation: draw 1.6s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
	}
	.spark-area {
		opacity: 0;
		animation: fadein 1s ease 1.2s forwards;
	}
	.journey {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		position: relative;
	}
	.step {
		display: grid;
		gap: 4px;
		justify-items: start;
		padding: 14px;
		border-radius: 18px;
		background: var(--w-card);
		border: 1px solid var(--w-line);
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 90ms + 80ms);
	}
	.step-ico {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: linear-gradient(135deg, #7045ff, #d443d8);
		color: #fff;
	}
	.step b {
		font-size: 13px;
	}
	.step small {
		color: var(--w-muted);
		font-size: 11px;
	}
	.fields {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin: 0;
	}
	.fields div {
		padding: 12px 14px;
		border-radius: 14px;
		background: var(--w-chip);
	}
	.fields dt {
		color: var(--w-muted);
		font-size: 11px;
		font-weight: 650;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.fields dd {
		margin: 4px 0 0;
		font-size: 14px;
		font-weight: 650;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes fadein {
		to {
			opacity: 1;
		}
	}
	@media (max-width: 720px) {
		.journey,
		.fields,
		.stats3 {
			grid-template-columns: 1fr 1fr;
		}
		.stats3 {
			grid-template-columns: 1fr;
		}
	}
</style>
