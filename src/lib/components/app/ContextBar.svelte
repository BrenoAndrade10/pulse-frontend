<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll } from '$app/navigation';
	import { selectExpert, selectLaunch } from '#lib/context/selection.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import type { Expert, Launch } from '#lib/types.js';

	let {
		experts,
		launches,
		expertId,
		launchId
	}: { experts: Expert[]; launches: Launch[]; expertId: string | null; launchId: string | null } =
		$props();

	let bar = $state<HTMLElement>();

	const RANGE = 180;
	const EASE = 0.1;

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const target = () => {
			const raw = Math.min(1, Math.max(0, window.scrollY / RANGE));
			return raw * raw * (3 - 2 * raw);
		};
		let current = target();
		let frame = 0;

		const apply = () => bar?.style.setProperty('--q', (1 - current).toFixed(4));

		const tick = () => {
			const goal = target();
			current = reduced ? goal : current + (goal - current) * EASE;
			if (Math.abs(goal - current) < 0.001) current = goal;
			apply();
			frame = current === goal ? 0 : requestAnimationFrame(tick);
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(tick);
		};

		apply();
		window.addEventListener('scroll', schedule, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', schedule);
		};
	});

	function changeExpert(expert: string) {
		selectExpert(expert || null);
		void invalidateAll();
	}

	function changeLaunch(launch: string) {
		selectLaunch(launch || null);
		void invalidateAll();
	}
</script>

<div
	class="sticky top-0 z-30 pl-[calc(var(--q,1)*var(--inset))] pr-[calc(var(--dock-r)+var(--q,1)*(var(--inset)-var(--dock-r)))] pt-[calc(var(--q,1)*var(--gap))] pb-[calc(var(--q,1)*12px)] [--dock-r:14px] [--gap:16px] [--inset:40px] max-lg:top-15 max-lg:[--dock-r:0px] max-lg:[--gap:12px] max-lg:[--inset:16px]"
	bind:this={bar}
>
	<div
		class={[
			'mx-auto flex max-w-[1320px] items-center gap-5 rounded-t-[calc(var(--q,1)*20px)] rounded-b-[20px] border border-border',
			'bg-[rgb(17_17_27/0.85)] px-5 py-3 shadow-[0_18px_40px_-24px_rgb(0_0_0/0.8)] backdrop-blur-[14px]',
			'max-[701px]:flex-col max-[701px]:items-stretch max-[701px]:gap-3 max-[701px]:px-4'
		]}
		style:border-top-color="rgb(38 38 58 / var(--q, 1))"
		role="group"
		aria-label={t('nav.context.title')}
	>
		<label
			class="flex min-w-0 flex-1 items-center gap-3 max-[701px]:flex-col max-[701px]:items-stretch max-[701px]:gap-1"
		>
			<span
				class="flex shrink-0 items-center gap-2 text-[12px] font-bold tracking-[0.06em] text-fg-muted uppercase"
			>
				<Icon name="target" size={16} />{t('nav.context.expert')}
			</span>
			<span class="relative min-w-0 flex-1">
				<select
					class="h-10.5 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface pr-9 pl-3.5 text-[14px] font-semibold text-fg hover:border-border-strong focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60"
					value={expertId ?? ''}
					disabled={experts.length === 0}
					onchange={(event) => changeExpert(event.currentTarget.value)}
				>
					<option value=""
						>{experts.length === 0
							? t('nav.context.noExperts')
							: t('nav.context.allExperts')}</option
					>
					{#each experts as expert (expert.id)}<option value={expert.id}>{expert.name}</option
						>{/each}
				</select>
				<Icon
					name="chevron-down"
					size={15}
					class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle"
				/>
			</span>
		</label>

		<span class="h-8 w-px shrink-0 bg-border max-[701px]:hidden" aria-hidden="true"></span>

		<label
			class="flex min-w-0 flex-1 items-center gap-3 max-[701px]:flex-col max-[701px]:items-stretch max-[701px]:gap-1"
		>
			<span class="shrink-0 text-[12px] font-bold tracking-[0.06em] text-fg-muted uppercase">
				{t('nav.context.launch')}
			</span>
			<span class="relative min-w-0 flex-1">
				<select
					class="h-10.5 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface pr-9 pl-3.5 text-[14px] font-semibold text-fg hover:border-border-strong focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60"
					value={launchId ?? ''}
					disabled={launches.length === 0 || !expertId}
					title={expertId ? undefined : t('nav.context.selectExpertHint')}
					onchange={(event) => changeLaunch(event.currentTarget.value)}
				>
					<option value="">
						{expertId && launches.length === 0
							? t('nav.context.noLaunches')
							: t('nav.context.allLaunches')}
					</option>
					{#each launches as launch (launch.id)}<option value={launch.id}>{launch.name}</option
						>{/each}
				</select>
				<Icon
					name="chevron-down"
					size={15}
					class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-fg-subtle"
				/>
			</span>
		</label>
	</div>
</div>
