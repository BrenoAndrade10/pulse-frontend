<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import type { FacebookConnectionStatus } from '#lib/types.js';
	import { FACEBOOK_STATUS } from '#lib/utils/facebook.js';
	import { EMPTY_VALUE, initials } from '#lib/utils/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const countBy = (status: FacebookConnectionStatus) =>
		data.experts.filter((e) => e.facebook.status === status).length;

	const toneClass: Record<string, string> = {
		success: 'bg-success',
		warning: 'bg-warning',
		neutral: 'bg-fg-subtle'
	};

	const summary = $derived([
		{ label: 'Conectadas', value: countBy('connected'), tone: 'success' },
		{ label: 'Conexão expirada', value: countBy('expired'), tone: 'warning' },
		{ label: 'Não conectadas', value: countBy('disconnected'), tone: 'neutral' }
	]);
</script>

<svelte:head>
	<title>Contas do Facebook · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="Contas do Facebook"
	description="Conexão da conta de anúncios e do pixel de cada expert com a Meta."
/>

{#if data.experts.length === 0}
	<Card>
		<EmptyState
			icon="facebook"
			title="Nenhum expert para conectar"
			description="Cada conta do Facebook é vinculada a um expert. Cadastre um expert para começar."
		>
			{#snippet action()}
				<a class={buttonClass()} href="/experts/new">
					<Icon name="plus" size={16} />Cadastrar expert
				</a>
			{/snippet}
		</EmptyState>
	</Card>
{:else}
	<div class="mb-5 grid grid-cols-3 gap-4 max-[901px]:grid-cols-1">
		{#each summary as item (item.label)}
			<div
				class="flex items-center justify-between rounded-lg border border-border bg-bg-elevated px-5 py-4"
			>
				<span class="inline-flex items-center gap-2.5 text-[13.5px] text-fg-muted"
					><i class={['size-2 rounded-full', toneClass[item.tone]]}></i>{item.label}</span
				>
				<strong class="text-[22px] tabular-nums">{item.value}</strong>
			</div>
		{/each}
	</div>

	<Card flush>
		<ul>
			{#each data.experts as expert (expert.id)}
				{@const status = FACEBOOK_STATUS[expert.facebook.status]}
				<li
					class={[
						'grid grid-cols-[auto_minmax(0,1fr)_minmax(0,1.2fr)_auto_auto] items-center gap-4',
						'border-t border-border px-5.5 py-4 first:border-t-0',
						'max-[901px]:grid-cols-[auto_minmax(0,1fr)_auto] max-[901px]:p-4',
						'max-[901px]:[&_.badge]:col-[3] max-[901px]:[&_.badge]:row-[1]'
					]}
				>
					<span
						class="grid size-9.5 place-items-center rounded-full border border-border-strong bg-[linear-gradient(135deg,rgb(124_92_255/0.35),rgb(255_77_157/0.35))] text-[12.5px] font-extrabold"
						aria-hidden="true">{initials(expert.name)}</span
					>
					<div class="flex min-w-0 flex-col">
						<span class="font-bold">{expert.name}</span>
						<span class="truncate text-[13px] text-fg-muted"
							>{expert.facebook.accountName ?? 'Nenhuma conta autorizada'}</span
						>
					</div>
					<dl class="flex gap-6 max-[901px]:col-span-full max-[901px]:row-[2]">
						<div>
							<dt class="text-[11.5px] tracking-[0.05em] text-fg-subtle uppercase">
								Conta de anúncios
							</dt>
							<dd
								class="mt-0.5 font-[family-name:ui-monospace,SFMono-Regular,Menlo,monospace] text-[12.5px] text-fg-muted"
							>
								{expert.adAccountId || EMPTY_VALUE}
							</dd>
						</div>
						<div>
							<dt class="text-[11.5px] tracking-[0.05em] text-fg-subtle uppercase">Pixel</dt>
							<dd
								class="mt-0.5 font-[family-name:ui-monospace,SFMono-Regular,Menlo,monospace] text-[12.5px] text-fg-muted"
							>
								{expert.pixelId || EMPTY_VALUE}
							</dd>
						</div>
					</dl>
					<Badge variant={status.variant}>{status.label}</Badge>
					<a
						class={[buttonClass({ variant: 'secondary', size: 'sm' }), 'max-[901px]:col-span-full']}
						href="/experts/{expert.id}#facebook"
					>
						{expert.facebook.status === 'connected' ? 'Gerenciar' : 'Conectar'}
					</a>
				</li>
			{/each}
		</ul>
	</Card>
{/if}
