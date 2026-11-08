<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head>
	<title>{t('misc.placeholders.email.title')} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={t('misc.placeholders.email.title')}
	description={t('misc.placeholders.email.description')}
/>

<Card>
	<EmptyState
		icon="mail"
		title={t('misc.placeholders.email.emptyTitle')}
		description={t('misc.placeholders.email.emptyDescription')}
	/>
</Card>
