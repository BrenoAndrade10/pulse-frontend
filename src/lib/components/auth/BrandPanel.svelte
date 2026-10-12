<script lang="ts">
	import type { ClassValue } from 'svelte/elements';
	import Logo from './Logo.svelte';

	let { class: className }: { class?: ClassValue } = $props();

	const kpis = [
		{ label: 'ROAS', value: '4,8x', delta: '+32%' },
		{ label: 'CTR', value: '3,9%', delta: '+0,8 p.p.' },
		{ label: 'Leads', value: '12,4 mil', delta: '+18%' }
	];

	const chip = [
		'absolute inline-flex items-center gap-2 rounded-full px-3.5 py-[9px] whitespace-nowrap',
		'border border-border-strong bg-[rgb(28_28_46/0.92)] shadow-[0_16px_32px_-12px_rgb(0_0_0/0.7)]',
		'text-[12.5px] font-semibold'
	];
</script>

<aside
	class={[
		'relative isolate flex flex-col justify-between gap-10 overflow-hidden px-12 py-10',
		'border-r border-border bg-bg-elevated',
		className
	]}
>
	<div
		class="absolute -top-35 -right-30 -z-1 size-115 rounded-full bg-[rgb(124_92_255/0.35)] blur-[90px]"
		aria-hidden="true"
	></div>
	<div
		class="absolute -bottom-40 -left-25 -z-1 size-95 rounded-full bg-[rgb(255_77_157/0.22)] blur-[90px]"
		aria-hidden="true"
	></div>
	<div
		class={[
			'absolute inset-0 -z-1',
			'bg-[image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)]',
			'bg-size-[44px_44px] [mask-image:radial-gradient(ellipse_at_60%_40%,#000_20%,transparent_75%)]'
		]}
		aria-hidden="true"
	></div>

	<div>
		<Logo />
	</div>

	<div class="max-w-[520px]">
		<h2
			class="mb-4 text-[length:clamp(30px,3.2vw,42px)] leading-[1.12] font-extrabold tracking-[-0.03em]"
		>
			Suas campanhas,<br />
			<span class="text-gradient-brand">em alta performance.</span>
		</h2>
		<p class="mb-10 max-w-[440px] text-[16px] text-fg-muted">
			Acompanhe métricas, otimize investimentos e escale resultados de marketing digital em um só
			lugar.
		</p>

		<div class="relative pt-6 pr-6 pb-8" aria-hidden="true">
			<div
				class={[
					'rounded-lg border border-border bg-[rgb(22_22_36/0.75)] p-5',
					'shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)] backdrop-blur-[12px]'
				]}
			>
				<div class="mb-3.5 flex items-center justify-between">
					<span class="text-[14px] font-bold">Desempenho das campanhas</span>
					<span
						class="rounded-full border border-border bg-surface-hover px-2.5 py-1 text-[11.5px] text-fg-muted"
						>Últimos 30 dias</span
					>
				</div>
				<svg class="block h-27.5 w-full" viewBox="0 0 320 110" preserveAspectRatio="none">
					<defs>
						<linearGradient id="area" x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" stop-color="#c04dff" stop-opacity="0.45" />
							<stop offset="100%" stop-color="#c04dff" stop-opacity="0" />
						</linearGradient>
						<linearGradient id="line" x1="0" x2="1" y1="0" y2="0">
							<stop offset="0%" stop-color="#7c5cff" />
							<stop offset="100%" stop-color="#ff4d9d" />
						</linearGradient>
					</defs>
					<path
						d="M0 92 C30 88 45 70 70 74 S110 60 135 62 S175 40 200 46 S245 22 270 26 S305 10 320 8 L320 110 L0 110 Z"
						fill="url(#area)"
					/>
					<path
						d="M0 92 C30 88 45 70 70 74 S110 60 135 62 S175 40 200 46 S245 22 270 26 S305 10 320 8"
						fill="none"
						stroke="url(#line)"
						stroke-width="2.5"
						stroke-linecap="round"
					/>
					<path
						d="M0 100 C40 98 60 92 90 94 S150 86 180 88 S250 78 320 74"
						fill="none"
						stroke="#3a3a55"
						stroke-width="1.5"
						stroke-dasharray="4 4"
					/>
				</svg>
				<div class="mt-4 grid grid-cols-[repeat(3,1fr)] gap-2.5">
					{#each kpis as kpi (kpi.label)}
						<div
							class="flex flex-col gap-0.5 rounded-md border border-border bg-[rgb(255_255_255/0.03)] px-3 py-2.5"
						>
							<span class="text-[11.5px] font-semibold tracking-[0.06em] text-fg-subtle uppercase"
								>{kpi.label}</span
							>
							<span class="text-[18px] font-extrabold tracking-[-0.02em]">{kpi.value}</span>
							<span class="text-[12px] font-semibold text-success">↑ {kpi.delta}</span>
						</div>
					{/each}
				</div>
			</div>

			<div class={[chip, 'top-0 -right-2 animate-[brand-float_6s_ease-in-out_infinite]']}>
				<span class="size-2 rounded-full bg-success shadow-[0_0_0_4px_rgb(61_220_151/0.2)]"></span>
				Campanha "Black Friday" escalada
			</div>
			<div class={[chip, 'right-10 bottom-0 animate-[brand-float_6s_ease-in-out_-3s_infinite]']}>
				<span class="rounded-full bg-gradient-brand px-2 py-0.5 font-bold">+R$ 48k</span>
				em receita atribuída
			</div>
		</div>
	</div>

	<p class="text-[13px] text-fg-subtle">Ads · Social · E-mail · Analytics — integrados.</p>
</aside>

<style>
	/* Keyframes customizados: global para ser referenciado por animate-[brand-float_…]. */
	@keyframes -global-brand-float {
		50% {
			transform: translateY(-6px);
		}
	}
</style>
