<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { APP_NAME } from '#lib/config.js';
</script>

<svelte:head>
	<title>Configurações · {APP_NAME}</title>
</svelte:head>

<PageHeader title="Configurações" description="Dados da sua conta, equipe e preferências." />

<Card>
	<EmptyState
		icon="settings"
		title="Configurações em breve"
		description="Perfil, equipe e notificações serão configurados aqui."
	>
		{#snippet action()}
			<a class={buttonClass({ variant: 'secondary' })} href="/dashboard">Voltar ao dashboard</a>
		{/snippet}
	</EmptyState>
</Card>
