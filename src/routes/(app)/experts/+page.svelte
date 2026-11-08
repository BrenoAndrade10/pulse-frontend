<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
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
		const term = search.trim().toLocaleLowerCase(i18n.intl);
		if (!term) return data.experts;
		return data.experts.filter((e) =>
			[e.name, e.email, e.commercialName ?? ''].some((v) =>
				v.toLocaleLowerCase(i18n.intl).includes(term)
			)
		);
	});
</script>

<svelte:head>
	<title>{t('experts.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader title={t('experts.title')} description={t('experts.list.description')}>
	{#snippet actions()}
		<a class={buttonClass()} href="/experts/new"
			><Icon name="plus" size={16} />{t('experts.list.newExpert')}</a
		>
	{/snippet}
</PageHeader>

{#if data.experts.length === 0}
	<Card>
		<EmptyState
			icon="users"
			title={t('experts.list.emptyTitle')}
			description={t('experts.list.emptyDescription')}
		>
			{#snippet action()}
				<a class={buttonClass()} href="/experts/new">
					<Icon name="plus" size={16} />{t('experts.list.register')}
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
				<span class="sr-only">{t('experts.list.searchLabel')}</span>
				<input
					class="min-w-0 flex-1 border-0 bg-transparent px-0.5 py-px text-[14px] text-fg outline-none placeholder:text-[#757575] focus-visible:shadow-none"
					type="search"
					placeholder={t('experts.list.searchPlaceholder')}
					bind:value={search}
				/>
			</label>
			<span class="text-[13px] whitespace-nowrap text-fg-subtle max-[561px]:hidden">
				{t('experts.list.count', { count: data.experts.length })}
			</span>
		</div>

		{#if filtered.length}
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-[14px]">
					<thead>
						<tr>
							<th class={th}>{t('experts.list.columns.expert')}</th>
							<th class={th}>{t('experts.list.columns.commercialName')}</th>
							<th class={th}>{t('experts.list.columns.status')}</th>
							<th class={th}>{t('experts.list.columns.instagram')}</th>
							<th class={th}><span class="sr-only">{t('experts.list.columns.actions')}</span></th>
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
											<span class={muted}>{expert.email || t('experts.list.noEmail')}</span>
										</span>
									</a>
								</td>
								<td class={[td, muted, 'group-last/row:border-b-0']}
									>{expert.commercialName || EMPTY_VALUE}</td
								>
								<td class={[td, 'group-last/row:border-b-0']}>
									<Badge variant={expert.status === 'active' ? 'success' : 'neutral'}>
										{expert.status === 'active'
											? t('experts.list.active')
											: t('experts.list.inactive')}
									</Badge>
								</td>
								<td class={[td, 'group-last/row:border-b-0']}
									><Badge variant={status.variant}>{t(status.label)}</Badge></td
								>
								<td class={[td, 'text-right group-last/row:border-b-0']}>
									<a
										class={buttonClass({ variant: 'ghost', size: 'sm' })}
										href="/experts/{expert.id}"
										aria-label={t('experts.list.configureAria', { name: expert.name })}
									>
										{t('experts.list.configure')}
										<Icon name="chevron-right" size={15} />
									</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{:else}
			<EmptyState compact icon="search" title={t('experts.list.notFound')} />
		{/if}
	</Card>
{/if}
