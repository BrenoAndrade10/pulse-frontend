<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import AutomationsTab from '#lib/components/email/AutomationsTab.svelte';
	import CampaignsTab from '#lib/components/email/CampaignsTab.svelte';
	import SettingsTab from '#lib/components/email/SettingsTab.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';

	type Tab = 'campaigns' | 'automations' | 'settings';
	const TABS: Tab[] = ['campaigns', 'automations', 'settings'];

	const tab = $derived<Tab>(
		TABS.find((value) => value === page.url.searchParams.get('tab')) ?? 'campaigns'
	);

	function setTab(next: Tab) {
		const url = new URL(page.url.href);
		if (next === 'campaigns') url.searchParams.delete('tab');
		else url.searchParams.set('tab', next);
		void goto(`${url.pathname}${url.search}`, { replaceState: true, reset: false });
	}
</script>

<svelte:head>
	<title>{t('email.page.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader title={t('email.page.title')} description={t('email.page.description')}>
	{#snippet actions()}
		<a class={buttonClass()} href="/email/new">
			<Icon name="plus" size={16} />{t('email.page.newCampaign')}
		</a>
	{/snippet}
</PageHeader>

<div
	class="mb-5 flex gap-1 border-b border-border"
	role="tablist"
	aria-label={t('email.tabs.tablist')}
>
	{#each TABS as option (option)}
		<button
			type="button"
			role="tab"
			class={[
				'-mb-px cursor-pointer rounded-t-md border-b-2 px-5 py-3 text-[15px] font-semibold',
				'[transition:background_0.15s,color_0.15s,border-color_0.15s] focus-visible:shadow-focus',
				tab === option
					? 'border-primary bg-[rgb(124_92_255/0.16)] text-fg'
					: 'border-transparent text-fg-muted hover:text-fg'
			]}
			aria-selected={tab === option}
			onclick={() => setTab(option)}
		>
			{t(`email.tabs.${option}`)}
		</button>
	{/each}
</div>

{#if tab === 'campaigns'}
	<CampaignsTab />
{:else if tab === 'automations'}
	<AutomationsTab />
{:else}
	<SettingsTab />
{/if}
