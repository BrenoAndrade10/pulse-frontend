<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head>
	<title>{t('misc.placeholders.reports.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={t('misc.placeholders.reports.title')}
	description={t('misc.placeholders.reports.description')}
/>

<Card>
	<EmptyState
		icon="bar-chart"
		title={t('misc.placeholders.reports.emptyTitle')}
		description={t('misc.placeholders.reports.emptyDescription')}
	>
		{#snippet action()}
			<a class={buttonClass({ variant: 'secondary' })} href="/dashboard"
				>{t('misc.placeholders.reports.goToDashboard')}</a
			>
		{/snippet}
	</EmptyState>
</Card>
