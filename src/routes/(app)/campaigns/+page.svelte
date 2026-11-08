<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head>
	<title>{t('misc.placeholders.campaigns.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={t('misc.placeholders.campaigns.title')}
	description={t('misc.placeholders.campaigns.description')}
/>

<Card>
	<EmptyState
		icon="megaphone"
		title={t('misc.placeholders.campaigns.emptyTitle')}
		description={t('misc.placeholders.campaigns.emptyDescription')}
	>
		{#snippet action()}
			<a class={buttonClass({ variant: 'secondary' })} href="/integrations"
				>{t('misc.placeholders.campaigns.connect')}</a
			>
		{/snippet}
	</EmptyState>
</Card>
