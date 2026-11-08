<script lang="ts">
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';

	type Props = { hasExperts: boolean; subjectKey: MessageKey; emptyDescriptionKey: MessageKey };

	let { hasExperts, subjectKey, emptyDescriptionKey }: Props = $props();
</script>

<Card>
	{#if hasExperts}
		<EmptyState
			icon="users"
			title={t('misc.selectExpert.title')}
			description={t('misc.selectExpert.description', { subject: t(subjectKey) })}
		/>
	{:else}
		<EmptyState
			icon="users"
			title={t('misc.selectExpert.emptyTitle')}
			description={t(emptyDescriptionKey)}
		>
			{#snippet action()}
				<a class={buttonClass()} href="/experts/new">{t('misc.selectExpert.register')}</a>
			{/snippet}
		</EmptyState>
	{/if}
</Card>
