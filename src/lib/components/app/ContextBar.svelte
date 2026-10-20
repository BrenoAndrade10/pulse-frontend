<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { selectExpert, selectLaunch } from '#lib/context/selection.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { Expert, Launch } from '#lib/types.js';

	let {
		experts,
		launches,
		expertId,
		launchId
	}: { experts: Expert[]; launches: Launch[]; expertId: string | null; launchId: string | null } =
		$props();

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
	class="sticky top-0 z-20 border-b border-border bg-[rgb(10_10_18/0.92)] px-10 py-3 backdrop-blur-[12px] max-lg:top-15 max-lg:px-4"
>
	<div class="mx-auto flex max-w-[1320px] items-center gap-4 max-[701px]:items-end">
		<div
			class="flex shrink-0 items-center gap-2 text-[12px] font-bold text-fg-subtle uppercase max-[701px]:hidden"
		>
			<Icon name="target" size={15} />Contexto
		</div>
		<label class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="text-[10.5px] font-bold text-fg-subtle uppercase">Expert</span>
			<span class="relative">
				<select
					class="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface pr-8 pl-3 text-[13px] font-semibold text-fg focus-visible:border-primary"
					value={expertId ?? ''}
					disabled={experts.length === 0}
					onchange={(event) => changeExpert(event.currentTarget.value)}
				>
					{#if experts.length === 0}<option value="">Nenhum expert</option>{/if}
					{#each experts as expert (expert.id)}<option value={expert.id}>{expert.name}</option
						>{/each}
				</select>
				<Icon
					name="chevron-down"
					size={14}
					class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-fg-subtle"
				/>
			</span>
		</label>
		<label class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="text-[10.5px] font-bold text-fg-subtle uppercase">Lançamento</span>
			<span class="relative">
				<select
					class="h-9 w-full cursor-pointer appearance-none rounded-md border border-border bg-surface pr-8 pl-3 text-[13px] font-semibold text-fg focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-60"
					value={launchId ?? ''}
					disabled={launches.length === 0 || !expertId}
					onchange={(event) => changeLaunch(event.currentTarget.value)}
				>
					{#if launches.length === 0}<option value="">Nenhum lançamento</option>{/if}
					{#each launches as launch (launch.id)}<option value={launch.id}>{launch.name}</option
						>{/each}
				</select>
				<Icon
					name="chevron-down"
					size={14}
					class="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-fg-subtle"
				/>
			</span>
		</label>
	</div>
</div>
