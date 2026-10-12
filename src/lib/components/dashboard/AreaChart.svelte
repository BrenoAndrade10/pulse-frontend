<script lang="ts">
	type Series = { name: string; color: string; values: number[] };

	type Props = {
		labels: string[];
		series: Series[];
		formatValue: (value: number) => string;
		/** Formato dos rótulos do eixo Y; usa formatValue se omitido. */
		formatAxis?: (value: number) => string;
		height?: number;
		ariaLabel: string;
	};

	let {
		labels,
		series,
		formatValue,
		formatAxis = formatValue,
		height = 240,
		ariaLabel
	}: Props = $props();

	const uid = $props.id();
	const W = 600;
	const H = 200;
	const TOP_PADDING = 8;

	// Arredonda o topo do eixo para um valor "redondo" (1, 1.5, 2, 2.5, 3, 4, 5… × 10^n).
	function niceCeil(value: number) {
		const magnitude = 10 ** Math.floor(Math.log10(value));
		const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= value) ?? 10;
		return step * magnitude;
	}

	const max = $derived(niceCeil(Math.max(1, ...series.flatMap((s) => s.values)) * 1.05));
	const count = $derived(labels.length);
	const ticks = $derived([0.25, 0.5, 0.75, 1].map((f) => max * f));

	// Até 6 rótulos no eixo X, espaçados igualmente.
	const xTicks = $derived.by(() => {
		if (count <= 6) return labels.map((_, i) => i);
		const step = (count - 1) / 5;
		return Array.from({ length: 6 }, (_, i) => Math.round(i * step));
	});

	const x = (i: number) => (count <= 1 ? W / 2 : (i / (count - 1)) * W);
	const y = (v: number) => H - (v / max) * (H - TOP_PADDING);

	const linePath = (values: number[]) =>
		values.map((v, i) => `${i === 0 ? 'M' : 'L'}${x(i)} ${y(v)}`).join(' ');

	const areaPath = (values: number[]) =>
		`${linePath(values)} L${x(values.length - 1)} ${H} L${x(0)} ${H} Z`;

	let plot = $state<HTMLDivElement>();
	let hoverIndex = $state<number | null>(null);

	function handlePointerMove(event: PointerEvent) {
		if (!plot || count === 0) return;
		const rect = plot.getBoundingClientRect();
		const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
		hoverIndex = Math.round(ratio * (count - 1));
	}

	const pct = (value: number, total: number) => `${(value / total) * 100}%`;
</script>

<!-- Largura do eixo Y (76px) repetida em grid-cols e no ml do eixo X. -->
<div>
	<div class="mb-4 flex gap-4.5 text-[12.5px] text-fg-muted">
		{#each series as s (s.name)}
			<span class="inline-flex items-center gap-1.5"
				><i class="size-2 rounded-[2px]" style:background={s.color}></i>{s.name}</span
			>
		{/each}
	</div>

	<div class="relative grid grid-cols-[76px_1fr]" style:height="{height}px">
		<div class="relative" aria-hidden="true">
			{#each ticks as tick (tick)}
				<span
					class="absolute right-3 -translate-y-1/2 text-[11.5px] whitespace-nowrap text-fg-subtle tabular-nums"
					style:top={pct(y(tick), H)}>{formatAxis(tick)}</span
				>
			{/each}
		</div>

		<div
			class="relative cursor-crosshair"
			bind:this={plot}
			role="img"
			aria-label={ariaLabel}
			onpointermove={handlePointerMove}
			onpointerleave={() => (hoverIndex = null)}
		>
			<svg
				class="block h-full w-full overflow-visible"
				viewBox="0 0 {W} {H}"
				preserveAspectRatio="none"
			>
				<defs>
					{#each series as s, i (s.name)}
						<linearGradient id="{uid}-{i}" x1="0" x2="0" y1="0" y2="1">
							<stop offset="0%" style:stop-color={s.color} stop-opacity="0.28" />
							<stop offset="100%" style:stop-color={s.color} stop-opacity="0" />
						</linearGradient>
					{/each}
				</defs>

				{#each ticks as tick (tick)}
					<line
						class="stroke-border"
						vector-effect="non-scaling-stroke"
						stroke-dasharray="3 4"
						x1="0"
						x2={W}
						y1={y(tick)}
						y2={y(tick)}
					/>
				{/each}
				<line
					class="stroke-border-strong"
					vector-effect="non-scaling-stroke"
					x1="0"
					x2={W}
					y1={H}
					y2={H}
				/>

				{#each series as s, i (s.name)}
					<path d={areaPath(s.values)} fill="url(#{uid}-{i})" />
					<path
						d={linePath(s.values)}
						fill="none"
						stroke-width="2"
						stroke-linejoin="round"
						stroke-linecap="round"
						vector-effect="non-scaling-stroke"
						style:stroke={s.color}
					/>
				{/each}

				{#if hoverIndex !== null}
					<line
						class="stroke-border-strong"
						vector-effect="non-scaling-stroke"
						x1={x(hoverIndex)}
						x2={x(hoverIndex)}
						y1="0"
						y2={H}
					/>
				{/if}
			</svg>

			{#if hoverIndex !== null}
				{@const index = hoverIndex}
				{#each series as s (s.name)}
					<span
						class="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg-elevated"
						style:left={pct(x(index), W)}
						style:top={pct(y(s.values[index]), H)}
						style:background={s.color}
					></span>
				{/each}
				<div
					class={[
						'pointer-events-none absolute top-0 flex flex-col gap-1 px-3 py-2.5',
						'rounded-sm border border-border-strong bg-surface-hover text-[12px] whitespace-nowrap',
						'shadow-[0_12px_24px_-8px_rgb(0_0_0/0.6)]',
						index > count / 2 ? 'translate-x-[calc(-100%-12px)]' : 'ml-3'
					]}
					style:left={pct(x(index), W)}
					aria-hidden="true"
				>
					<strong>{labels[index]}</strong>
					{#each series as s (s.name)}
						<span class="inline-flex items-center gap-1.5"
							><i class="size-2 rounded-[2px]" style:background={s.color}></i>{s.name}: {formatValue(
								s.values[index]
							)}</span
						>
					{/each}
				</div>
			{/if}
		</div>
	</div>

	<div class="relative ml-[76px] h-6" aria-hidden="true">
		{#each xTicks as i (i)}
			<span
				class={[
					'absolute top-2 text-[11.5px] whitespace-nowrap text-fg-subtle tabular-nums',
					i === count - 1 ? '-translate-x-full' : i !== 0 && '-translate-x-1/2'
				]}
				style:left={pct(x(i), W)}
			>
				{labels[i]}
			</span>
		{/each}
	</div>
</div>
