<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import type { ConnectionStatus } from '#lib/types.js';
	import { initials } from '#lib/utils/format.js';
	import { CONNECTION_STATUS, META_INTEGRATIONS } from '#lib/utils/integrations.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	type Integration = {
		name: string;
		description: string;
		icon: IconName;
		available: boolean;
	};

	const otherIntegrations: Integration[] = [
		{
			name: 'Hotmart',
			description: 'Sincronize vendas, produtos e comissões.',
			icon: 'flame',
			available: false
		},
		{
			name: 'Telegram',
			description: 'Integre canais, comunidades e automações.',
			icon: 'send',
			available: false
		},
		{
			name: 'Kiwify',
			description: 'Importe vendas, produtos e indicadores.',
			icon: 'shopping-bag',
			available: false
		}
	];

	const catalog = [
		{
			id: 'meta',
			title: 'Meta',
			description: 'Instagram, Meta Ads e WhatsApp são conectados separadamente, por expert.',
			items: META_INTEGRATIONS.map((integration) => ({
				name: integration.name,
				description: integration.description,
				icon: integration.icon,
				available: integration.available,
				detail: `${integration.asset} · ${integration.authorization}`,
				href: integration.channel === 'instagram' ? '#instagram' : null
			}))
		},
		{
			id: 'others',
			title: 'Outras plataformas',
			description: null,
			items: otherIntegrations.map((integration) => ({ ...integration, detail: null, href: null }))
		}
	];

	const countBy = (status: ConnectionStatus) =>
		data.experts.filter((expert) => expert.instagram.status === status).length;

	const summary = $derived([
		{ label: 'Conectadas', value: countBy('connected'), tone: 'bg-success' },
		{ label: 'Conexão expirada', value: countBy('expired'), tone: 'bg-warning' },
		{ label: 'Não conectadas', value: countBy('disconnected'), tone: 'bg-fg-subtle' }
	]);
</script>

<svelte:head>
	<title>Integrações · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="Integrações"
	description="Conecte os canais e plataformas usados na sua operação."
/>

{#each catalog as group (group.id)}
	<section class="mb-9" aria-labelledby="{group.id}-catalog-title">
		<div class="mb-3">
			<h2 id="{group.id}-catalog-title" class="text-[15px] font-bold">{group.title}</h2>
			{#if group.description}
				<p class="mt-1 text-[13px] text-fg-muted">{group.description}</p>
			{/if}
		</div>
		<div class="grid grid-cols-3 gap-4 max-[1050px]:grid-cols-2 max-[621px]:grid-cols-1">
			{#each group.items as integration (integration.name)}
				<div
					class={[
						'flex min-h-36 flex-col border border-border bg-bg-elevated p-4.5',
						integration.available ? 'opacity-100' : 'opacity-65'
					]}
				>
					<div class="flex items-start gap-3">
						<span
							class="grid size-10 shrink-0 place-items-center rounded-md border border-border-strong bg-surface text-primary-hover"
						>
							<Icon name={integration.icon} size={20} />
						</span>
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<h3 class="font-bold">{integration.name}</h3>
								{#if integration.available}<Badge variant="success">Disponível</Badge>{/if}
							</div>
							<p class="mt-1 text-[13px] leading-relaxed text-fg-muted">
								{integration.description}
							</p>
							{#if integration.detail}
								<p class="mt-1.5 text-[12px] text-fg-subtle">{integration.detail}</p>
							{/if}
						</div>
					</div>
					<div class="mt-auto flex justify-end pt-4">
						{#if integration.available && integration.href}
							<a class={buttonClass({ variant: 'secondary', size: 'sm' })} href={integration.href}>
								Configurar
							</a>
						{:else}
							<Button variant="secondary" size="sm" disabled>Em breve</Button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</section>
{/each}

<section id="instagram" class="scroll-mt-6" aria-labelledby="instagram-title">
	<div class="mb-4 flex flex-wrap items-end justify-between gap-3">
		<div>
			<h2 id="instagram-title" class="text-[18px] font-bold">Contas do Instagram</h2>
			<p class="mt-1 text-[13.5px] text-fg-muted">Conexões profissionais vinculadas aos experts.</p>
		</div>
		{#if data.experts.length > 0}
			<div class="flex gap-4">
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
				title="Nenhum expert para conectar"
				description="Cada conta do Instagram é vinculada a um expert. Cadastre um expert para começar."
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
			<ul>
				{#each data.experts as expert (expert.id)}
					{@const status = CONNECTION_STATUS[expert.instagram.status]}
					<li
						class="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-border px-5.5 py-4 first:border-t-0 max-[701px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[701px]:p-4"
					>
						<span
							class="grid size-9.5 place-items-center rounded-full border border-border-strong bg-surface text-[12.5px] font-extrabold"
							aria-hidden="true">{initials(expert.name)}</span
						>
						<div class="flex min-w-0 flex-col">
							<span class="font-bold">{expert.name}</span>
							<span class="truncate text-[13px] text-fg-muted">
								{expert.instagram.accountName
									? `@${expert.instagram.accountName}`
									: 'Nenhuma conta autorizada'}
							</span>
						</div>
						<Badge variant={status.variant}>{status.label}</Badge>
						<a
							class={[
								buttonClass({ variant: 'secondary', size: 'sm' }),
								'max-[701px]:col-span-full'
							]}
							href="/experts/{expert.id}#instagram"
						>
							{expert.instagram.status === 'connected' ? 'Gerenciar' : 'Conectar'}
						</a>
					</li>
				{/each}
			</ul>
		</Card>
	{/if}
</section>
