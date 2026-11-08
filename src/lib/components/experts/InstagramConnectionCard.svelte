<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
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
	import { connectionState, INTEGRATION_STATE, metaIntegration } from '#lib/utils/integrations.js';
	import IntegrationConnectionCard from './IntegrationConnectionCard.svelte';

	type Props = {
		expertId: string | null;
		connection: ExpertConnection | null;
	};

	let { expertId, connection }: Props = $props();

	const integration = metaIntegration('instagram');
	const status = $derived.by(() => {
		const entry = INTEGRATION_STATE[connectionState(connection?.status ?? 'disconnected')];

		return { label: t(entry.label), variant: entry.variant };
	});
	const isConnected = $derived(connection?.status === 'connected');
	const isExpired = $derived(connection?.status === 'expired');

	let busy = $state(false);
	let waitingAuthorization = $state(false);
	let feedback = $state<{ variant: 'success' | 'error'; text: string }>();

	const detail = $derived.by(() => {
		if (!expertId) return t('integrations.instagram.saveFirst');
		if (waitingAuthorization) return t('integrations.instagram.waitingAuthorization');
		if (isConnected && connection?.connectedAt) {
			return t('integrations.instagram.connectedAt', { date: formatDate(connection.connectedAt) });
		}
		if (isConnected) return t('integrations.instagram.connected');
		if (isExpired) return t('integrations.instagram.expired');
		return t('integrations.instagram.authorize');
	});

	function showResult(result: Pick<InstagramOAuthResult, 'status' | 'reason'>) {
		waitingAuthorization = false;
		feedback =
			result.status === 'connected'
				? { variant: 'success', text: t('integrations.instagram.connectedSuccess') }
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
						: t('integrations.instagram.connectFailed')
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
				text: t('integrations.instagram.disconnectFailed')
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
				{t('integrations.actions.reconnect')}
			</Button>
			<Button variant="ghost" size="sm" disabled={busy} onclick={handleDisconnect}>
				{t('integrations.actions.disconnect')}
			</Button>
		{:else}
			<Button size="sm" loading={busy} disabled={!expertId} onclick={handleConnect}>
				<Icon name="instagram" size={15} />
				{isExpired ? t('integrations.instagram.reconnect') : t(integration.connectLabel)}
			</Button>
		{/if}
	{/snippet}

	{#if feedback}
		<Alert variant={feedback.variant}>{feedback.text}</Alert>
	{/if}
</IntegrationConnectionCard>
