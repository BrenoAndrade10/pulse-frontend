<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
</script>

<svelte:head>
	<title>Campanhas · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="Campanhas"
	description="Campanhas ativas nas contas de anúncio dos seus experts."
/>

<Card>
	<EmptyState
		icon="megaphone"
		title="Nenhuma campanha encontrada"
		description="As campanhas são importadas automaticamente das contas do Facebook conectadas."
	>
		{#snippet action()}
			<a class={buttonClass({ variant: 'secondary' })} href="/facebook-accounts">Conectar contas</a>
		{/snippet}
	</EmptyState>
</Card>
