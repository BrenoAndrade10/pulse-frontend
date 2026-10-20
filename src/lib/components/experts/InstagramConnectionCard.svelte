<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import {
		connectInstagram,
		disconnectInstagram,
		INSTAGRAM_OAUTH_CHANNEL,
		instagramOAuthErrorMessage,
		IntegrationUnavailableError,
		isInstagramOAuthResult,
		type InstagramOAuthResult
	} from '#lib/services/experts.js';
	import type { ExpertConnection } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
	import { CONNECTION_STATUS, metaIntegration } from '#lib/utils/integrations.js';
	import IntegrationConnectionCard from './IntegrationConnectionCard.svelte';

	type Props = {
		expertId: string | null;
		connection: ExpertConnection | null;
	};

	let { expertId, connection }: Props = $props();

	const integration = metaIntegration('instagram');
	const status = $derived(CONNECTION_STATUS[connection?.status ?? 'disconnected']);
	const isConnected = $derived(connection?.status === 'connected');
	const isExpired = $derived(connection?.status === 'expired');

	let busy = $state(false);
	let waitingAuthorization = $state(false);
	let feedback = $state<{ variant: 'success' | 'error'; text: string }>();

	const detail = $derived.by(() => {
		if (!expertId) return 'Salve o expert para poder conectar a conta.';
		if (waitingAuthorization) return 'Conclua a autorização na janela do Instagram.';
		if (isConnected && connection?.connectedAt) {
			return `Conectada em ${formatDate(connection.connectedAt)}`;
		}
		if (isConnected) return 'Conta profissional conectada a este expert.';
		if (isExpired) return 'A autorização expirou. Reconecte para voltar a sincronizar.';
		return 'Autorize o acesso à conta profissional do Instagram.';
	});

	function showResult(result: Pick<InstagramOAuthResult, 'status' | 'reason'>) {
		waitingAuthorization = false;
		feedback =
			result.status === 'connected'
				? { variant: 'success', text: 'Conta do Instagram conectada.' }
				: { variant: 'error', text: instagramOAuthErrorMessage(result.reason) };
	}

	onMount(() => {
		const channel = new BroadcastChannel(INSTAGRAM_OAUTH_CHANNEL);

		// A atualização dos dados fica com o +layout raiz; aqui só o feedback.
		channel.addEventListener('message', (event) => {
			if (isInstagramOAuthResult(event.data)) showResult(event.data);
		});

		// Sem popup, a Meta devolve o usuário para esta própria página.
		const url = new URL(page.url.href);
		const result = url.searchParams.get('instagram');

		if (result === 'connected' || result === 'error') {
			showResult({ status: result, reason: url.searchParams.get('reason') ?? undefined });
			url.searchParams.delete('instagram');
			url.searchParams.delete('reason');
			replaceState(url, page.state);
		}

		return () => channel.close();
	});

	async function handleConnect() {
		if (!expertId) return;
		busy = true;
		feedback = undefined;
		try {
			await connectInstagram(expertId);
			waitingAuthorization = true;
		} catch (err) {
			feedback = {
				variant: 'error',
				text:
					err instanceof IntegrationUnavailableError
						? err.message
						: 'Não foi possível conectar a conta. Tente novamente.'
			};
		} finally {
			busy = false;
		}
	}

	async function handleDisconnect() {
		if (!expertId) return;
		busy = true;
		feedback = undefined;
		try {
			await disconnectInstagram(expertId);
			await invalidateAll();
		} catch {
			feedback = {
				variant: 'error',
				text: 'Não foi possível desconectar a conta. Tente novamente.'
			};
		} finally {
			busy = false;
		}
	}
</script>

<IntegrationConnectionCard
	{integration}
	badge={status}
	accountName={connection?.accountName ? `@${connection.accountName}` : null}
	{detail}
>
	{#snippet actions()}
		{#if isConnected}
			<Button variant="secondary" size="sm" loading={busy} onclick={handleConnect}>
				Reconectar
			</Button>
			<Button variant="ghost" size="sm" disabled={busy} onclick={handleDisconnect}>
				Desconectar
			</Button>
		{:else}
			<Button size="sm" loading={busy} disabled={!expertId} onclick={handleConnect}>
				<Icon name="instagram" size={15} />
				{isExpired ? 'Reconectar Instagram' : integration.connectLabel}
			</Button>
		{/if}
	{/snippet}

	{#if feedback}
		<Alert variant={feedback.variant}>{feedback.text}</Alert>
	{/if}
</IntegrationConnectionCard>
