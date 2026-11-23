<script lang="ts">
	import { countUp, inview, scrollTilt } from './motion';

	const modules = ['Lançamento', 'Leads', 'Pulse Heat', 'Links', 'Integrações'];

	const kpis = [
		{ label: 'Convites entregues', to: 800, prefix: '' },
		{ label: 'Cliques no convite', to: 560, prefix: '' },
		{ label: 'Cadastros', to: 412, prefix: '' },
		{ label: 'Vendas', to: 280, prefix: '' }
	];

	const clicks = [38, 44, 41, 56, 63, 59, 72, 68, 84, 91, 86, 103, 98, 112];
	const plot = { left: 44, right: 548, top: 18, bottom: 168, max: 130 };

	const points = clicks.map((value, index) => ({
		x: plot.left + (index / (clicks.length - 1)) * (plot.right - plot.left),
		y: plot.bottom - (value / plot.max) * (plot.bottom - plot.top)
	}));

	function smooth(items: { x: number; y: number }[]) {
		let path = `M ${items[0].x} ${items[0].y}`;
		for (let index = 1; index < items.length; index++) {
			const previous = items[index - 1];
			const current = items[index];
			const midX = (previous.x + current.x) / 2;
			path += ` C ${midX} ${previous.y}, ${midX} ${current.y}, ${current.x} ${current.y}`;
		}
		return path;
	}

	const linePath = smooth(points);
	const areaPath = `${linePath} L ${points[points.length - 1].x} ${plot.bottom} L ${points[0].x} ${plot.bottom} Z`;
	const last = points[points.length - 1];
	const gridValues = [0, 50, 100];

	const ring = { radius: 54, value: 0.56 };
	const circumference = 2 * Math.PI * ring.radius;

	const sources = [
		{ name: 'Instagram · Reel', value: '560 cliques', tone: 'ig' },
		{ name: 'Instagram · Stories', value: '342 cliques', tone: 'violet' },
		{ name: 'Link da bio', value: '198 cliques', tone: 'ink' },
		{ name: 'Anúncio pago', value: '126 cliques', tone: 'soft' }
	];
</script>

<div class="stage" use:inview={{ threshold: 0.12 }}>
	<div class="tilt" use:scrollTilt>
		<div class="frame" aria-label="Simulação da tela de lançamento da Pulse Lead">
			<div class="chrome">
				<span class="dots"><i></i><i></i><i></i></span>
				<span class="chrome-title">Seu escritório · Pulse Lead</span>
			</div>

			<div class="app">
				<header class="topbar pop" style="--i: 0">
					<img src="/brand/pulse-logo-dark-trim.png" alt="Pulse Lead" />
					<nav class="modules" aria-label="Módulos">
						{#each modules as name, index}
							<span class="module" class:active={index === 0}>{name}</span>
						{/each}
					</nav>
					<div class="topbar-actions">
						<span class="select">Aula gratuita <em>⌄</em></span>
						<span class="avatar">S</span>
					</div>
				</header>

				<div class="body">
					<aside class="rail pop" style="--i: 1" aria-hidden="true">
						<span class="rail-item on"
							><svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg></span
						>
						<span class="rail-item"
							><svg viewBox="0 0 24 24"
								><circle cx="9" cy="8" r="3.2" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M17 11a3 3 0 1 0 0-6" /></svg
							></span
						>
						<span class="rail-item"
							><svg viewBox="0 0 24 24"
								><path d="M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.3.5-2.2 1.2-3C9 9.5 9 11 9.8 11c-.5-3 .8-6 2.2-8Z" /></svg
							></span
						>
						<span class="rail-item"
							><svg viewBox="0 0 24 24"
								><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></svg
							></span
						>
					</aside>

					<section class="board">
						<div class="metric pop" style="--i: 2">
							<div class="metric-head">
								<small>LEADS CAPTADOS</small>
								<span>Lançamento atual</span>
							</div>
							<div class="metric-value">
								<strong class="big" use:countUp={{ to: 1000, duration: 1900, delay: 250 }}>1.000</strong>
								<em class="chip">+18,4% vs. anterior</em>
							</div>
							<dl class="kpis">
								{#each kpis as kpi, index}
									<div class="kpi pop" style="--i: {3 + index}">
										<dt>{kpi.label}</dt>
										<dd use:countUp={{ to: kpi.to, duration: 1500, delay: 500 + index * 120 }}>
											{kpi.to}
										</dd>
									</div>
								{/each}
							</dl>
						</div>

						<aside class="insight pop" style="--i: 4">
							<span class="insight-avatar">SC</span>
							<div class="bubble">
								<div class="bubble-head">
									<b>Stefani Costa</b>
									<small>Pulse Heat · Alta atividade</small>
								</div>
								<p>Voltou à página da oferta duas vezes na última hora. Vale priorizar o contato.</p>
								<div class="bubble-foot">
									<span><i></i> Próximo passo sugerido</span>
									<span>19:42 ✓✓</span>
								</div>
							</div>
							<span class="insight-link">Ver leads <i>→</i></span>
						</aside>

						<div class="cards">
							<article class="card chart pop" style="--i: 6">
								<header>
									<span class="card-icon"
										><svg viewBox="0 0 24 24"><path d="M3 3v16a2 2 0 0 0 2 2h16M18 17V9M13 17V5M8 17v-3" /></svg></span
									>
									<div><b>Cliques por dia</b><small>Últimos 14 dias</small></div>
									<span class="card-arrow">↗</span>
								</header>
								<div class="chart-wrap">
									<svg viewBox="0 0 560 200" preserveAspectRatio="none" class="chart-svg" aria-hidden="true">
										<defs>
											<linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
												<stop offset="0" stop-color="#7045ff" stop-opacity="0.22" />
												<stop offset="1" stop-color="#7045ff" stop-opacity="0" />
											</linearGradient>
										</defs>
										{#each gridValues as value}
											{@const y = plot.bottom - (value / plot.max) * (plot.bottom - plot.top)}
											<line x1={plot.left} x2={plot.right} y1={y} y2={y} class="grid" />
											<text x="0" y={y + 4} class="axis">{value}</text>
										{/each}
										<path d={areaPath} class="area" fill="url(#area)" />
										<path d={linePath} class="line" pathLength="1" />
									</svg>
									<span class="marker" style="left: {(last.x / 560) * 100}%; top: {(last.y / 200) * 100}%"></span>
									<span class="tooltip" style="left: {(last.x / 560) * 100}%; top: {(last.y / 200) * 100}%"
										>hoje · 112 cliques</span
									>
								</div>
							</article>

							<article class="card donut pop" style="--i: 7">
								<header>
									<span class="card-icon"
										><svg viewBox="0 0 24 24"
											><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /></svg
										></span
									>
									<div><b>Taxa de clique</b><small>Convites com clique</small></div>
									<span class="card-arrow">↗</span>
								</header>
								<div class="ring-wrap">
									<svg viewBox="0 0 140 140" aria-hidden="true">
										<circle cx="70" cy="70" r={ring.radius} class="ring-bg" />
										<circle
											cx="70"
											cy="70"
											r={ring.radius}
											class="ring-fg"
											style="--c: {circumference}; --o: {circumference * (1 - ring.value)}"
										/>
									</svg>
									<div class="ring-label">
										<strong use:countUp={{ to: 56, duration: 1700, delay: 700 }}>56</strong><span>%</span>
									</div>
								</div>
							</article>

							<article class="card stack pop" style="--i: 8">
								<header>
									<span class="card-icon"
										><svg viewBox="0 0 24 24"
											><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3A4 4 0 0 0 11 18.7l1-1" /></svg
										></span
									>
									<div><b>Origens</b><small>De onde vêm seus leads</small></div>
									<span class="card-arrow">↗</span>
								</header>
								<div class="origin-stack">
									{#each sources as source, index}
										<div class="origin {source.tone}" style="--k: {index}">
											<b>{source.name}</b>
											<span>{source.value}</span>
										</div>
									{/each}
								</div>
							</article>
						</div>
					</section>
				</div>
			</div>
		</div>
	</div>
	<p class="sample-note">Dados de exemplo</p>
</div>

<style>
	.stage {
		--ink: #14121f;
		--muted: #7b768a;
		--line: #e7e4ee;
		--purple: #7045ff;
		--pink: #d443d8;
		--ease: cubic-bezier(0.22, 1, 0.36, 1);
		position: relative;
		width: min(1160px, calc(100% - 48px));
		margin: 0 auto;
	}
	.tilt {
		perspective: 1800px;
	}
	.frame {
		transform-origin: 50% 0;
		transform: rotateX(calc((1 - var(--t)) * 9deg)) translateY(calc((1 - var(--t)) * 36px))
			scale(calc(0.95 + var(--t) * 0.05));
		border-radius: 30px;
		border: 1px solid rgba(20, 18, 31, 0.07);
		background: linear-gradient(180deg, #f2f1f6, #ecebf1);
		box-shadow:
			0 1px 0 rgba(255, 255, 255, 0.8) inset,
			0 50px 110px -30px rgba(40, 24, 90, 0.28),
			0 20px 40px -20px rgba(40, 24, 90, 0.16);
		overflow: hidden;
		will-change: transform;
	}
	.tilt {
		--t: 1;
	}
	.chrome {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 24px 0;
		color: var(--muted);
		font-size: 12px;
	}
	.dots {
		display: flex;
		gap: 7px;
	}
	.dots i {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		background: #d9d6e1;
	}
	.app {
		padding: 18px 28px 28px;
	}
	.topbar {
		display: flex;
		align-items: center;
		gap: 24px;
	}
	.topbar img {
		height: 30px;
		width: auto;
	}
	.modules {
		display: flex;
		gap: 4px;
		margin: 0 auto;
		padding: 5px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 1px 2px rgba(20, 18, 31, 0.05);
	}
	.module {
		padding: 8px 16px;
		border-radius: 999px;
		color: var(--muted);
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}
	.module.active {
		background: #fff;
		color: var(--purple);
		box-shadow:
			0 0 0 1px rgba(112, 69, 255, 0.25),
			0 4px 12px rgba(112, 69, 255, 0.12);
	}
	.topbar-actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.select {
		padding: 9px 16px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.85);
		font-size: 13px;
		font-weight: 600;
		white-space: nowrap;
	}
	.select em {
		margin-left: 6px;
		font-style: normal;
		color: var(--muted);
	}
	.avatar {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 50%;
		background: linear-gradient(135deg, var(--purple), var(--pink));
		color: #fff;
		font-size: 14px;
		font-weight: 700;
	}
	.body {
		display: grid;
		grid-template-columns: 56px 1fr;
		gap: 24px;
		margin-top: 28px;
	}
	.rail {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		align-self: start;
		padding: 8px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.85);
		box-shadow: 0 1px 2px rgba(20, 18, 31, 0.05);
	}
	.rail-item {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		color: var(--muted);
	}
	.rail-item.on {
		background: #eee9ff;
		color: var(--purple);
	}
	.rail-item svg,
	.card-icon svg {
		width: 19px;
		height: 19px;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.board {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 340px;
		gap: 22px 32px;
	}
	.metric-head {
		display: flex;
		align-items: center;
		gap: 14px;
		color: var(--muted);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.06em;
	}
	.metric-head span {
		color: var(--ink);
		letter-spacing: 0;
	}
	.metric-value {
		display: flex;
		align-items: flex-start;
		gap: 14px;
		margin-top: 6px;
	}
	.big {
		font-size: clamp(72px, 9.2vw, 128px);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.05em;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
	}
	.chip {
		margin-top: 18px;
		padding: 6px 12px;
		border-radius: 999px;
		background: #e5f6ec;
		color: #167a4a;
		font-size: 13px;
		font-style: normal;
		font-weight: 600;
		white-space: nowrap;
	}
	.kpis {
		display: grid;
		grid-template-columns: repeat(4, auto);
		justify-content: start;
		gap: 36px;
		margin: 22px 0 0;
	}
	.kpi dt {
		color: var(--muted);
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.kpi dd {
		margin: 4px 0 0;
		font-size: 20px;
		font-weight: 600;
		letter-spacing: -0.02em;
		font-variant-numeric: tabular-nums;
	}
	.insight {
		display: grid;
		grid-template-columns: 52px 1fr;
		gap: 0 12px;
		align-self: start;
	}
	.insight-avatar {
		display: grid;
		place-items: center;
		width: 52px;
		height: 52px;
		border-radius: 50%;
		border: 3px solid #fff;
		background: linear-gradient(135deg, var(--purple), var(--pink));
		color: #fff;
		font-weight: 700;
		box-shadow: 0 8px 20px rgba(112, 69, 255, 0.3);
	}
	.bubble {
		padding: 18px 20px 14px;
		border-radius: 4px 24px 24px 24px;
		background: linear-gradient(155deg, #3a1f8f, #1e1245);
		color: #fff;
		box-shadow: 0 24px 50px -18px rgba(40, 20, 100, 0.55);
	}
	.bubble-head b {
		display: block;
		font-size: 20px;
		letter-spacing: -0.02em;
	}
	.bubble-head small {
		color: rgba(255, 255, 255, 0.65);
		font-size: 12px;
	}
	.bubble p {
		margin: 12px 0 14px;
		font-size: 15px;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.92);
	}
	.bubble-foot {
		display: flex;
		justify-content: space-between;
		color: rgba(255, 255, 255, 0.6);
		font-size: 11px;
	}
	.bubble-foot i {
		display: inline-block;
		width: 6px;
		height: 6px;
		margin-right: 4px;
		border-radius: 50%;
		background: #9df0bf;
	}
	.insight-link {
		grid-column: 2;
		margin-top: 14px;
		font-size: 15px;
		font-weight: 700;
	}
	.insight-link i {
		font-style: normal;
		margin-left: 4px;
		display: inline-block;
		transition: transform 0.3s var(--ease);
	}
	.cards {
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: 1.55fr 0.85fr 1fr;
		gap: 18px;
		margin-top: 6px;
	}
	.card {
		padding: 18px 20px 20px;
		border-radius: 24px;
		background: #fbfbfd;
		border: 1px solid rgba(20, 18, 31, 0.05);
		box-shadow: 0 1px 2px rgba(20, 18, 31, 0.04);
		min-height: 270px;
	}
	.card header {
		display: grid;
		grid-template-columns: 38px 1fr auto;
		gap: 12px;
		align-items: center;
	}
	.card-icon {
		display: grid;
		place-items: center;
		width: 38px;
		height: 38px;
		border-radius: 12px;
		background: #eee9ff;
		color: var(--purple);
	}
	.card header b {
		font-size: 16px;
		letter-spacing: -0.01em;
	}
	.card header small {
		display: block;
		color: var(--muted);
		font-size: 12px;
	}
	.card-arrow {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		border: 1px solid var(--line);
		color: var(--muted);
		font-size: 13px;
	}
	.chart-wrap {
		position: relative;
		margin-top: 12px;
	}
	.chart-svg {
		display: block;
		width: 100%;
		height: 190px;
		overflow: visible;
	}
	.grid {
		stroke: #e9e6f0;
		stroke-dasharray: 3 5;
	}
	.axis {
		fill: #a39eb3;
		font-size: 11px;
	}
	.line {
		fill: none;
		stroke: var(--purple);
		stroke-width: 2.6;
		stroke-linecap: round;
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		vector-effect: non-scaling-stroke;
	}
	.area {
		opacity: 0;
	}
	.marker {
		position: absolute;
		width: 14px;
		height: 14px;
		margin: -7px 0 0 -7px;
		border-radius: 50%;
		background: #fff;
		border: 3px solid var(--purple);
		box-shadow: 0 0 0 6px rgba(112, 69, 255, 0.16);
		opacity: 0;
		transform: scale(0.4);
	}
	.tooltip {
		position: absolute;
		transform: translate(-100%, -190%);
		padding: 6px 10px;
		border-radius: 10px;
		background: var(--ink);
		color: #fff;
		font-size: 12px;
		font-weight: 600;
		white-space: nowrap;
		opacity: 0;
	}
	.ring-wrap {
		position: relative;
		display: grid;
		place-items: center;
		margin: 14px auto 0;
		width: 168px;
		height: 168px;
	}
	.ring-wrap svg {
		position: absolute;
		inset: 0;
		transform: rotate(-90deg);
	}
	.ring-bg {
		fill: none;
		stroke: #ebe8f2;
		stroke-width: 13;
	}
	.ring-fg {
		fill: none;
		stroke: var(--purple);
		stroke-width: 13;
		stroke-linecap: round;
		stroke-dasharray: var(--c);
		stroke-dashoffset: var(--c);
	}
	.ring-label {
		display: flex;
		align-items: baseline;
		font-variant-numeric: tabular-nums;
	}
	.ring-label strong {
		font-size: 44px;
		font-weight: 600;
		letter-spacing: -0.04em;
	}
	.ring-label span {
		font-size: 18px;
		font-weight: 600;
		color: var(--muted);
		margin-left: 2px;
	}
	.origin-stack {
		position: relative;
		height: 190px;
		margin-top: 18px;
	}
	.origin {
		position: absolute;
		left: 0;
		right: 0;
		top: calc(var(--k) * 38px);
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		height: 86px;
		padding: 13px 16px;
		border-radius: 18px;
		font-size: 14px;
		box-shadow: 0 -6px 16px rgba(20, 18, 31, 0.12);
		transition: transform 0.5s var(--ease);
		z-index: calc(var(--k) + 1);
	}
	.origin span {
		font-size: 12px;
		opacity: 0.85;
	}
	.origin.ig {
		background: linear-gradient(120deg, #7a3cff, #d62976 60%, #ff8a4c);
		color: #fff;
	}
	.origin.violet {
		background: linear-gradient(120deg, #5a3bd6, #8a5bff);
		color: #fff;
	}
	.origin.ink {
		background: linear-gradient(120deg, #1d1a2b, #2e2a44);
		color: #fff;
	}
	.origin.soft {
		background: #efeaff;
		color: #3a2a7a;
	}
	.stack:hover .origin {
		transform: translateY(calc(var(--k) * 8px));
	}
	.sample-note {
		margin: 14px 0 0;
		text-align: center;
		color: var(--muted);
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.pop {
		opacity: 0;
		transform: translateY(18px);
	}
	.stage:global(.in) .pop {
		animation: rise 0.9s var(--ease) both;
		animation-delay: calc(var(--i) * 90ms + 150ms);
	}
	.stage:global(.in) .line {
		animation: draw 1.8s var(--ease) 0.9s forwards;
	}
	.stage:global(.in) .area {
		animation: fade 1.2s ease 1.6s forwards;
	}
	.stage:global(.in) .marker {
		animation: pop-in 0.6s var(--ease) 2.5s forwards;
	}
	.stage:global(.in) .tooltip {
		animation: fade 0.5s ease 2.7s forwards;
	}
	.stage:global(.in) .ring-fg {
		animation: ring 1.8s var(--ease) 0.9s forwards;
	}
	.stage:global(.in) .origin {
		animation: slide-up 0.9s var(--ease) both;
		animation-delay: calc(var(--k) * 110ms + 1000ms);
	}
	@keyframes rise {
		to {
			opacity: 1;
			transform: none;
		}
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@keyframes fade {
		to {
			opacity: 1;
		}
	}
	@keyframes pop-in {
		to {
			opacity: 1;
			transform: scale(1);
		}
	}
	@keyframes ring {
		to {
			stroke-dashoffset: var(--o);
		}
	}
	@keyframes slide-up {
		from {
			opacity: 0;
			transform: translateY(40px);
		}
	}

	@media (max-width: 1040px) {
		.board {
			grid-template-columns: 1fr;
		}
		.cards {
			grid-template-columns: 1fr 1fr;
		}
		.chart {
			grid-column: 1 / -1;
		}
		.rail {
			display: none;
		}
		.body {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 720px) {
		.stage {
			width: calc(100% - 24px);
		}
		.app {
			padding: 14px 14px 18px;
		}
		.modules,
		.select {
			display: none;
		}
		.topbar {
			justify-content: space-between;
		}
		.kpis {
			grid-template-columns: repeat(2, auto);
			gap: 18px 28px;
		}
		.cards {
			grid-template-columns: 1fr;
		}
		.insight {
			grid-template-columns: 44px 1fr;
		}
		.insight-avatar {
			width: 44px;
			height: 44px;
		}
		.chip {
			margin-top: 8px;
		}
		.metric-value {
			flex-wrap: wrap;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.pop,
		.line,
		.area,
		.marker,
		.tooltip,
		.ring-fg,
		.origin {
			animation: none !important;
			opacity: 1;
			transform: none;
		}
		.line {
			stroke-dashoffset: 0;
		}
		.ring-fg {
			stroke-dashoffset: var(--o);
		}
		.frame {
			transform: none;
		}
	}
</style>
