<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
</script>

<svelte:head>
	<title>Relatórios · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="Relatórios"
	description="Relatórios de performance por expert, campanha e período."
/>

<Card>
	<EmptyState
		icon="bar-chart"
		title="Nenhum relatório disponível"
		description="Os relatórios ficam disponíveis assim que houver dados de campanhas importados."
	>
		{#snippet action()}
			<a class={buttonClass({ variant: 'secondary' })} href="/dashboard">Ir para o dashboard</a>
		{/snippet}
	</EmptyState>
</Card>
