<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import { getWhatsAppConnection } from '#lib/services/whatsappConnection.js';
	import type { Expert, WhatsAppConnection } from '#lib/types.js';
	import { INTEGRATION_STATE, type IntegrationState } from '#lib/utils/integrations.js';
	import ExpertAccountRow from './ExpertAccountRow.svelte';

	type Props = { experts: Expert[] };

	let { experts }: Props = $props();

	type Result = WhatsAppConnection | 'error';

	let results = $state<Record<string, Result>>({});
	let loading = $state(true);

	const hasFailures = $derived(Object.values(results).some((result) => result === 'error'));

	async function load() {
		loading = true;
		const settled = await Promise.allSettled(
			experts.map((expert) => getWhatsAppConnection(expert.id))
		);
		results = Object.fromEntries(
			experts.map((expert, index): [string, Result] => {
				const outcome = settled[index];

				return [expert.id, outcome.status === 'fulfilled' ? outcome.value : 'error'];
			})
		);
		loading = false;
	}

	onMount(() => void load());

	function stateOf(result: Result | undefined): IntegrationState {
		if (result === 'error') return 'attention';

		return result?.status === 'connected' ? 'connected' : 'not_connected';
	}

	function subtitleOf(result: Result | undefined): string {
		if (result === 'error') return t('integrations.whatsapp.checkFailed');
		if (result?.status === 'connected') return result.displayPhoneNumber;

		return t('integrations.whatsapp.noNumber');
	}
</script>

{#if loading}
	<div
		class="flex flex-col gap-px overflow-hidden rounded-lg border border-border bg-bg-elevated"
		aria-busy="true"
		aria-label={t('integrations.whatsapp.accountsLoadingAria')}
	>
		{#each experts as expert (expert.id)}
			<div class="flex animate-pulse items-center gap-4 px-5.5 py-4">
				<span class="size-9.5 rounded-full bg-white/6"></span>
				<span class="flex flex-1 flex-col gap-2">
					<span class="h-3.5 w-40 rounded bg-white/6"></span>
					<span class="h-3 w-28 rounded bg-white/4"></span>
				</span>
			</div>
		{/each}
	</div>
{:else}
	<Card flush>
		<ul>
			{#each experts as expert (expert.id)}
				{@const result = results[expert.id]}
				{@const entry = INTEGRATION_STATE[stateOf(result)]}
				<ExpertAccountRow
					name={expert.name}
					subtitle={subtitleOf(result)}
					badge={{ label: t(entry.label), variant: entry.variant }}
					actionLabel={result !== 'error' && result?.status === 'connected'
						? t('integrations.actions.manage')
						: t('integrations.actions.connect')}
					href="/experts/{expert.id}#whatsapp"
				/>
			{/each}
		</ul>
	</Card>
	{#if hasFailures}
		<div class="mt-3 flex justify-end">
			<Button variant="secondary" size="sm" onclick={load}>{t('common.actions.retry')}</Button>
		</div>
	{/if}
{/if}
