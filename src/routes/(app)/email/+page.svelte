<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
</script>

<svelte:head>
	<title>E-mail · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title="E-mail"
	description="Crie e acompanhe mensagens para os contatos dos seus lançamentos."
/>

<Card>
	<EmptyState
		icon="mail"
		title="Disparos de e-mail em breve"
		description="Em breve, você poderá criar campanhas e automatizar mensagens de e-mail por aqui."
	/>
</Card>
