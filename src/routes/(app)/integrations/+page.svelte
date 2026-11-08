<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import ExpertAccountRow from '#lib/components/experts/ExpertAccountRow.svelte';
	import InstagramConnectionCard from '#lib/components/experts/InstagramConnectionCard.svelte';
	import WhatsAppAccountsList from '#lib/components/experts/WhatsAppAccountsList.svelte';
	import WhatsAppConnectionCard from '#lib/components/experts/WhatsAppConnectionCard.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { isWhatsAppEmbeddedSignupConfigured } from '#lib/meta/embeddedSignup.js';
	import type { ConnectionStatus } from '#lib/types.js';
	import {
		connectionState,
		INTEGRATION_STATE,
		UPCOMING_INTEGRATIONS,
		type IntegrationScope
	} from '#lib/utils/integrations.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const selectedExpert = $derived(
		data.experts.find((expert) => expert.id === data.selectedExpertId) ?? null
	);

	const countBy = (status: ConnectionStatus) =>
		data.experts.filter((expert) => expert.instagram.status === status).length;

	const summary = $derived([
		{
			label: t('integrations.states.connected'),
			value: countBy('connected'),
			tone: 'bg-success'
		},
		{ label: t('integrations.states.attention'), value: countBy('expired'), tone: 'bg-warning' },
		{
			label: t('integrations.states.notConnected'),
			value: countBy('disconnected'),
			tone: 'bg-fg-subtle'
		}
	]);

	const upcomingGroups = $derived(
		(['expert', 'tenant'] as IntegrationScope[]).map((scope) => ({
			scope,
			title: t(
				scope === 'expert'
					? 'integrations.upcoming.expertScope'
					: 'integrations.upcoming.tenantScope'
			),
			hint: scope === 'tenant' ? t('integrations.upcoming.tenantHint') : null,
			items: UPCOMING_INTEGRATIONS.filter((integration) => integration.scope === scope)
		}))
	);

	const comingSoon = $derived(INTEGRATION_STATE.coming_soon);
</script>

<svelte:head>
	<title>{t('integrations.pageTitle')} · {APP_NAME}</title>
</svelte:head>

<PageHeader title={t('integrations.pageTitle')} description={t('integrations.description')} />

<section id="instagram" class="scroll-mt-6" aria-labelledby="instagram-title">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 id="instagram-title" class="text-[18px] font-bold">
				{t('integrations.instagram.sectionTitle')}
			</h2>
			<p class="mt-1 text-[13.5px] text-fg-muted">
				{selectedExpert
					? t('integrations.instagram.selectedDescription')
					: t('integrations.instagram.sectionDescription')}
			</p>
		</div>
		{#if data.experts.length > 0 && !selectedExpert}
			<div class="flex flex-wrap gap-x-4 gap-y-1">
				{#each summary as item (item.label)}
					<span class="inline-flex items-center gap-2 text-[12.5px] text-fg-muted">
						<i class={['size-2 rounded-full', item.tone]}></i>{item.label}:
						<strong class="text-fg tabular-nums">{item.value}</strong>
					</span>
				{/each}
			</div>
		{/if}
	</div>

	{#if data.experts.length === 0}
		<Card>
			<EmptyState
				icon="instagram"
				title={t('integrations.instagram.emptyTitle')}
				description={t('integrations.instagram.emptyDescription')}
			>
				{#snippet action()}
					<a class={buttonClass()} href="/experts/new">
						<Icon name="plus" size={16} />{t('experts.list.register')}
					</a>
				{/snippet}
			</EmptyState>
		</Card>
	{:else if selectedExpert}
		{#key selectedExpert.id}
			<InstagramConnectionCard expertId={selectedExpert.id} connection={selectedExpert.instagram} />
		{/key}
	{:else}
		<Card flush>
			<ul>
				{#each data.experts as expert (expert.id)}
					{@const entry = INTEGRATION_STATE[connectionState(expert.instagram.status)]}
					<ExpertAccountRow
						name={expert.name}
						subtitle={expert.instagram.status === 'expired'
							? t('integrations.instagram.expiredHint')
							: expert.instagram.accountName
								? `@${expert.instagram.accountName}`
								: t('integrations.instagram.noAccount')}
						badge={{ label: t(entry.label), variant: entry.variant }}
						actionLabel={expert.instagram.status === 'connected'
							? t('integrations.actions.manage')
							: t('integrations.actions.connect')}
						href="/experts/{expert.id}#instagram"
					/>
				{/each}
			</ul>
		</Card>
	{/if}
</section>

<section id="whatsapp" class="mt-9 scroll-mt-6" aria-labelledby="whatsapp-title">
	<div class="mb-4">
		<h2 id="whatsapp-title" class="text-[18px] font-bold">
			{t('integrations.whatsapp.sectionTitle')}
		</h2>
		<p class="mt-1 text-[13.5px] text-fg-muted">
			{selectedExpert
				? t('integrations.whatsapp.sectionDescription')
				: t('integrations.whatsapp.overviewDescription')}
		</p>
	</div>

	{#if data.experts.length === 0}
		<Card>
			<EmptyState
				icon="whatsapp"
				title={t('integrations.whatsapp.emptyTitle')}
				description={t('integrations.whatsapp.emptyDescription')}
			>
				{#snippet action()}
					<a class={buttonClass()} href="/experts/new">
						<Icon name="plus" size={16} />{t('experts.list.register')}
					</a>
				{/snippet}
			</EmptyState>
		</Card>
	{:else if selectedExpert}
		{#key selectedExpert.id}
			<WhatsAppConnectionCard expertId={selectedExpert.id} />
		{/key}
	{:else if !isWhatsAppEmbeddedSignupConfigured}
		<Card>
			<EmptyState compact icon="whatsapp" title={t('integrations.whatsapp.unavailable')} />
		</Card>
	{:else}
		<WhatsAppAccountsList experts={data.experts} />
	{/if}
</section>

<details class="group mt-9 rounded-lg border border-border bg-bg-elevated">
	<summary
		class="flex cursor-pointer list-none items-center gap-3 rounded-lg px-5.5 py-4 select-none [&::-webkit-details-marker]:hidden"
	>
		<h2 id="upcoming-title" class="text-[15px] font-bold">{t('integrations.upcoming.title')}</h2>
		<span class="text-[12.5px] text-fg-subtle">
			{t('integrations.upcoming.count', { count: UPCOMING_INTEGRATIONS.length })}
		</span>
		<Icon
			name="chevron-down"
			size={16}
			class="ml-auto text-fg-subtle transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
		/>
	</summary>
	<div class="flex flex-col gap-5 border-t border-border px-5.5 py-4">
		{#each upcomingGroups as group (group.scope)}
			<div>
				<h3 class="text-[11.5px] font-bold tracking-[0.08em] text-fg-subtle uppercase">
					{group.title}
				</h3>
				{#if group.hint}<p class="mt-1 text-[12.5px] text-fg-subtle">{group.hint}</p>{/if}
				<ul class="mt-2 flex flex-col">
					{#each group.items as integration (integration.id)}
						<li
							class="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0 max-[561px]:flex-wrap"
						>
							<span
								class="grid size-8 shrink-0 place-items-center rounded-sm border border-border-strong bg-surface text-fg-muted"
								aria-hidden="true"
							>
								<Icon name={integration.icon} size={16} />
							</span>
							<span class="min-w-0 flex-1">
								<span class="block text-[14px] font-semibold">{integration.name}</span>
								<span
									class="block truncate text-[12.5px] text-fg-subtle max-[561px]:whitespace-normal"
								>
									{t(integration.description)}
								</span>
							</span>
							<Badge variant={comingSoon.variant}>{t(comingSoon.label)}</Badge>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</details>
