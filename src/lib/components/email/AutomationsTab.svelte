<script lang="ts">
	import Chip from '#lib/components/email/Chip.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import {
		listAutomations,
		setAutomationActive,
		type EmailAutomation
	} from '#lib/services/email.js';
	import { EMPTY_VALUE, formatNumber, formatPercent } from '#lib/utils/format.js';

	let items = $state<EmailAutomation[]>([]);
	let phase = $state<'loading' | 'ready'>('loading');
	let busyId = $state<string | null>(null);

	$effect(() => {
		let current = true;
		void listAutomations().then((list) => {
			if (!current) return;
			items = list;
			phase = 'ready';
		});
		return () => {
			current = false;
		};
	});

	async function toggle(item: EmailAutomation) {
		busyId = item.id;
		try {
			const updated = await setAutomationActive(item.id, item.status !== 'active');
			items = items.map((entry) => (entry.id === updated.id ? updated : entry));
		} finally {
			busyId = null;
		}
	}

	const tones = { active: 'ok', paused: 'neutral', draft: 'primary' } as const;
	const head = 'px-4 py-3.5 text-left text-[13px] font-semibold text-fg-muted';
</script>

<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
	<p class="text-[14px] text-fg-muted">{t('email.automations.description')}</p>
	<Button disabled title={t('email.automations.soon')}>
		<Icon name="plus" size={16} />{t('email.automations.new')}
		<span class="rounded-full bg-white/15 px-2 py-0.5 text-[11px]"
			>{t('email.automations.soon')}</span
		>
	</Button>
</div>

{#if phase === 'loading'}
	<div class="h-60 rounded-lg border border-border bg-bg-elevated motion-safe:animate-pulse"></div>
{:else if items.length === 0}
	<Card>
		<EmptyState
			icon="flame"
			title={t('email.automations.empty.title')}
			description={t('email.automations.empty.description')}
		/>
	</Card>
{:else}
	<Card flush>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-[14px]">
				<thead>
					<tr class="border-b border-border">
						<th class="{head} pl-6">{t('email.automations.table.automation')}</th>
						<th class={head}>{t('email.automations.table.trigger')}</th>
						<th class={head}>{t('email.automations.table.status')}</th>
						<th class={head}>{t('email.automations.table.sent')}</th>
						<th class={head}>{t('email.automations.table.clicks')}</th>
						<th class="{head} pr-6">{t('email.automations.table.actions')}</th>
					</tr>
				</thead>
				<tbody>
					{#each items as item (item.id)}
						<tr class="border-b border-border last:border-b-0 hover:bg-white/2">
							<td class="py-4 pr-4 pl-6 font-bold">{item.name}</td>
							<td class="px-4 py-4 text-fg-muted">
								<span class="inline-flex items-center gap-2">
									<Icon name="flame" size={15} />{t(`email.automations.triggers.${item.trigger}`)}
								</span>
							</td>
							<td class="px-4 py-4"
								><Chip tone={tones[item.status]}>{t(`email.status.${item.status}`)}</Chip></td
							>
							<td class="px-4 py-4 tabular-nums"
								>{item.sent ? formatNumber(item.sent) : EMPTY_VALUE}</td
							>
							<td class="px-4 py-4 tabular-nums">{formatPercent(item.clickRate)}</td>
							<td class="py-4 pr-6 pl-4">
								{#if item.status === 'draft'}
									<Button variant="secondary" size="sm" disabled>
										<Icon name="pencil" size={15} />{t('email.automations.actions.edit')}
									</Button>
								{:else}
									<Button
										variant="secondary"
										size="sm"
										loading={busyId === item.id}
										disabled={busyId !== null}
										onclick={() => toggle(item)}
									>
										<Icon name={item.status === 'active' ? 'pause' : 'play'} size={15} />
										{item.status === 'active'
											? t('email.automations.actions.pause')
											: t('email.automations.actions.resume')}
									</Button>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="border-t border-border px-6 py-4 text-[13.5px] text-fg-muted">
			{t('email.automations.count', { count: items.length, formatted: formatNumber(items.length) })}
		</p>
	</Card>
{/if}
