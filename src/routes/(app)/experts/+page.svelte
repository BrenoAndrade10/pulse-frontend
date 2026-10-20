<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { CONNECTION_STATUS } from '#lib/utils/integrations.js';
	import { EMPTY_VALUE, initials } from '#lib/utils/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let search = $state('');

	const cell = 'border-b border-border px-5.5 py-3.5 whitespace-nowrap';
	const th = `${cell} text-left text-[12px] font-semibold tracking-[0.05em] text-fg-subtle uppercase`;
	const td = `${cell} text-left`;
	const muted = 'text-[13px] text-fg-muted';

	const filtered = $derived.by(() => {
		const term = search.trim().toLocaleLowerCase('pt-BR');
		if (!term) return data.experts;
		return data.experts.filter((e) =>
			[e.name, e.email, e.commercialName ?? ''].some((v) =>
				v.toLocaleLowerCase('pt-BR').includes(term)
			)
		);
	});
</script>

<svelte:head>
	<title>Experts · {APP_NAME}</title>
</svelte:head>

<PageHeader title="Experts" description="Gerencie os experts da sua operação e suas integrações.">
	{#snippet actions()}
		<a class={buttonClass()} href="/experts/new"><Icon name="plus" size={16} />Novo expert</a>
	{/snippet}
</PageHeader>

{#if data.experts.length === 0}
	<Card>
		<EmptyState
			icon="users"
			title="Nenhum expert cadastrado"
			description="Cadastre o primeiro expert para conectar suas plataformas."
		>
			{#snippet action()}
				<a class={buttonClass()} href="/experts/new">
					<Icon name="plus" size={16} />Cadastrar expert
				</a>
			{/snippet}
		</EmptyState>
	</Card>
{:else}
	<Card flush>
		<div
			class="flex items-center justify-between gap-4 border-b border-border px-5.5 pt-0.5 pb-4 max-[561px]:px-4"
		>
			<label
				class="flex h-10 w-[min(360px,100%)] items-center gap-2.5 rounded-md border border-border bg-surface px-3 text-fg-subtle focus-within:border-primary focus-within:shadow-focus"
			>
				<Icon name="search" size={16} />
				<span class="sr-only">Buscar experts</span>
				<input
					class="min-w-0 flex-1 border-0 bg-transparent px-0.5 py-px text-[14px] text-fg outline-none placeholder:text-[#757575] focus-visible:shadow-none"
					type="search"
					placeholder="Buscar por nome, e-mail ou nome comercial"
					bind:value={search}
				/>
			</label>
			<span class="text-[13px] whitespace-nowrap text-fg-subtle max-[561px]:hidden">
				{data.experts.length}
				{data.experts.length === 1 ? 'expert' : 'experts'}
			</span>
		</div>

		{#if filtered.length}
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[14px]">
					<thead>
						<tr>
							<th class={th}>Expert</th>
							<th class={th}>Nome comercial</th>
							<th class={th}>Status</th>
							<th class={th}>Instagram</th>
							<th class={th}><span class="sr-only">Ações</span></th>
						</tr>
					</thead>
					<tbody>
						{#each filtered as expert (expert.id)}
							{@const status = CONNECTION_STATUS[expert.instagram.status]}
							<tr class="group/row hover:bg-[rgb(255_255_255/0.015)]">
								<td class={[td, 'group-last/row:border-b-0']}>
									<a
										class="group flex items-center gap-3 text-inherit hover:no-underline"
										href="/experts/{expert.id}"
									>
										<span
											class="grid size-9 shrink-0 place-items-center rounded-full border border-border-strong bg-[linear-gradient(135deg,rgb(124_92_255/0.35),rgb(255_77_157/0.35))] text-[12.5px] font-extrabold"
											aria-hidden="true">{initials(expert.name)}</span
										>
										<span class="flex flex-col">
											<span class="font-bold group-hover:text-primary-hover">{expert.name}</span>
											<span class={muted}>{expert.email || 'Sem e-mail'}</span>
										</span>
									</a>
								</td>
								<td class={[td, muted, 'group-last/row:border-b-0']}
									>{expert.commercialName || EMPTY_VALUE}</td
								>
								<td class={[td, 'group-last/row:border-b-0']}>
									<Badge variant={expert.status === 'active' ? 'success' : 'neutral'}>
										{expert.status === 'active' ? 'Ativo' : 'Inativo'}
									</Badge>
								</td>
								<td class={[td, 'group-last/row:border-b-0']}
									><Badge variant={status.variant}>{status.label}</Badge></td
								>
								<td class={[td, 'text-right group-last/row:border-b-0']}>
									<a
										class={buttonClass({ variant: 'ghost', size: 'sm' })}
										href="/experts/{expert.id}"
										aria-label="Configurar {expert.name}"
									>
										Configurar <Icon name="chevron-right" size={15} />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<EmptyState compact icon="search" title="Nenhum expert encontrado" />
		{/if}
	</Card>
{/if}
