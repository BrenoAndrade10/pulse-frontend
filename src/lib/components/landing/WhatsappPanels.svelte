<script lang="ts">
	import Icon from './Icon.svelte';
	import { countUp } from './motion';

	let { id }: { id: string } = $props();

	const clickers = [
		{ initials: 'SC', name: 'Stefani Costa', when: 'há 4 min', h: 290 },
		{ initials: 'RL', name: 'Rafael Lima', when: 'há 9 min', h: 210 },
		{ initials: 'CD', name: 'Camila Duarte', when: 'há 14 min', h: 330 }
	];
</script>

<div class="lp-win">
	<div class="lp-bar">
		<span class="lp-dots"><i></i><i></i><i></i></span>
		<span>WhatsApp · Lembretes por etapa</span>
	</div>
	<div class="lp-body">
		{#if id === 'lembrete'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico wa"><Icon name="clock" /></span>
					<div>Lembrete da aula<small>Automação por etapa</small></div>
				</div>
				<span class="lp-chip amber">Em breve</span>
			</div>
			<div class="lp-grid2 cols">
				<div class="lp-card lp-pop" style="--i: 1">
					<ul class="lp-list flow">
						<li style="--i: 2"><span class="n">1</span><div><b>Gatilho</b><small>30 minutos antes da aula</small></div></li>
						<li style="--i: 3"><span class="n">2</span><div><b>Público</b><small>Inscritos na aula · 412 leads</small></div></li>
						<li style="--i: 4"><span class="n">3</span><div><b>Canal</b><small>WhatsApp</small></div></li>
					</ul>
					<div class="lp-row" style="margin-top: 14px">
						<span class="lp-muted">Quem deve receber o lembrete</span>
						<span class="toggle on" aria-hidden="true"><i></i></span>
					</div>
				</div>
				<div class="lp-phone lp-pop" style="--i: 2">
					<div class="lp-screen wa">
						<div class="lp-screen-head">
							<span class="lp-avatar" style="--h: 150">P</span>
							<span>Pulse Lead<small>conta comercial</small></span>
						</div>
						<div class="lp-msg in lp-pop" style="--i: 4">
							Sua aula começa em 30 minutos. Acesse pelo link:
							<span class="lp-linkcard"><b>Aula gratuita</b><small>pulselead.com/aula</small></span>
							<time>19:30</time>
						</div>
					</div>
				</div>
			</div>
		{:else if id === 'conversa'}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico wa"><Icon name="comment" /></span>
					<div>Conversa<small>Mensagem entregue e lida</small></div>
				</div>
				<span class="lp-chip amber">Em breve</span>
			</div>
			<div class="lp-grid2 cols">
				<div class="lp-phone lp-pop" style="--i: 1">
					<div class="lp-screen wa">
						<div class="lp-screen-head">
							<span class="lp-avatar" style="--h: 150">P</span>
							<span>Pulse Lead<small>online</small></span>
						</div>
						<div class="lp-msg in lp-pop" style="--i: 3">
							Sua aula começa em 30 minutos.
							<time>19:30</time>
						</div>
						<div class="lp-msg out lp-pop" style="--i: 5">Estou a caminho! <time>19:31 ✓✓</time></div>
						<div class="lp-msg in lp-pop" style="--i: 7">
							Perfeito. O link também está aqui:
							<span class="lp-linkcard"><b>Entrar na aula</b><small>pulselead.com/aula</small></span>
							<time>19:31</time>
						</div>
					</div>
				</div>
				<div class="stack-col">
					<div class="lp-card lp-pop" style="--i: 2">
						<p class="lp-label">Mensagens entregues</p>
						<span class="lp-big"><span use:countUp={{ to: 98, duration: 1300 }}>98</span>%</span>
					</div>
					<div class="lp-card lp-pop" style="--i: 3">
						<p class="lp-label">Lidas em até 5 min</p>
						<span class="lp-big"><span use:countUp={{ to: 87, duration: 1300 }}>87</span>%</span>
					</div>
				</div>
			</div>
		{:else}
			<div class="lp-head lp-pop">
				<div class="lp-title">
					<span class="lp-ico wa"><Icon name="chart" /></span>
					<div>Resultado do lembrete<small>Aula gratuita · 412 enviados</small></div>
				</div>
				<span class="lp-chip amber">Em breve</span>
			</div>
			<div class="lp-card lp-pop" style="--i: 1">
				<ul class="lp-list bars">
					<li style="--i: 2"><div class="lp-row"><b>Entregues</b><span class="lp-muted">98%</span></div><div class="lp-track"><i style="--w: 98%; --i: 0"></i></div></li>
					<li style="--i: 3"><div class="lp-row"><b>Lidas</b><span class="lp-muted">87%</span></div><div class="lp-track"><i style="--w: 87%; --i: 1"></i></div></li>
					<li style="--i: 4"><div class="lp-row"><b>Cliques no link</b><span class="lp-muted">41%</span></div><div class="lp-track"><i style="--w: 41%; --i: 2"></i></div></li>
				</ul>
			</div>
			<div class="lp-card lp-pop" style="--i: 2">
				<p class="lp-label">Quem clicou agora</p>
				<ul class="lp-list">
					{#each clickers as person, index}
						<li class="who" style="--i: {index + 3}">
							<span class="lp-avatar" style="--h: {person.h}">{person.initials}</span>
							<b>{person.name}</b>
							<small>{person.when}</small>
						</li>
					{/each}
				</ul>
			</div>
		{/if}
	</div>
</div>

<style>
	.cols {
		align-items: start;
	}
	.lp-ico.wa {
		background: #dff7e6;
		color: #168050;
	}
	.flow li {
		display: grid;
		grid-template-columns: 30px 1fr;
		gap: 12px;
		align-items: center;
		padding: 10px 4px;
		border-bottom: 1px solid var(--w-line);
		animation: lp-rise 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
		animation-delay: calc(var(--i, 0) * 75ms + 80ms);
	}
	.flow li:last-child {
		border-bottom: 0;
	}
	.flow .n {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: #dff7e6;
		color: #168050;
		font-weight: 700;
		font-size: 13px;
	}
	.flow b {
		display: block;
		font-size: 14px;
	}
	.flow small {
		color: var(--w-muted);
		font-size: 12px;
	}
	.toggle {
		position: relative;
		width: 42px;
		height: 24px;
		border-radius: 999px;
		background: var(--w-line);
	}
	.toggle.on {
		background: #25a463;
	}
	.toggle i {
		position: absolute;
		top: 3px;
		left: 3px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #fff;
		transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
	}
	.toggle.on i {
		transform: translateX(18px);
	}
	.stack-col {
		display: grid;
		gap: 14px;
		align-content: start;
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
	.who small {
		color: var(--w-muted);
		font-size: 12px;
	}
</style>
