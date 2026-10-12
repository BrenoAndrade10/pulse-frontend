<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import {
		connectFacebook,
		disconnectFacebook,
		IntegrationUnavailableError
	} from '#lib/services/experts.js';
	import type { FacebookConnection } from '#lib/types.js';
	import { FACEBOOK_STATUS } from '#lib/utils/facebook.js';
	import { formatDate } from '#lib/utils/format.js';

	type Props = {
		/** null enquanto o expert ainda não foi salvo. */
		expertId: string | null;
		connection: FacebookConnection | null;
	};

	let { expertId, connection }: Props = $props();

	const status = $derived(FACEBOOK_STATUS[connection?.status ?? 'disconnected']);
	const isConnected = $derived(connection?.status === 'connected');

	let busy = $state(false);
	let message = $state<string>();

	async function handleConnect() {
		if (!expertId) return;
		busy = true;
		message = undefined;
		try {
			await connectFacebook(expertId);
			await invalidateAll();
		} catch (err) {
			message =
				err instanceof IntegrationUnavailableError
					? err.message
					: 'Não foi possível conectar a conta. Tente novamente.';
		} finally {
			busy = false;
		}
	}

	async function handleDisconnect() {
		if (!expertId) return;
		busy = true;
		message = undefined;
		try {
			await disconnectFacebook(expertId);
			await invalidateAll();
		} finally {
			busy = false;
		}
	}
</script>

<div class="flex flex-col gap-4 rounded-md border border-border bg-surface p-4.5">
	<div class="flex items-center gap-3.5 max-[561px]:flex-wrap">
		<span
			class="grid size-10.5 shrink-0 place-items-center rounded-[12px] bg-[rgb(24_119_242/0.14)] text-[#4c9aff]"
			><Icon name="facebook" size={20} /></span
		>
		<div class="min-w-0 flex-1">
			<p class="font-bold">
				{connection?.accountName ?? 'Conta do Facebook'}
			</p>
			<p class="mt-0.5 text-[13px] text-fg-muted">
				{#if !expertId}
					Salve o expert para poder conectar a conta.
				{:else if isConnected && connection?.connectedAt}
					Conectada em {formatDate(connection.connectedAt)}
				{:else}
					Autorize o acesso às contas de anúncio e ao pixel.
				{/if}
			</p>
		</div>
		<Badge variant={status.variant}>{status.label}</Badge>
	</div>

	<div class="flex flex-wrap gap-2">
		{#if isConnected}
			<Button variant="secondary" size="sm" loading={busy} onclick={handleConnect}>
				Reconectar
			</Button>
			<Button variant="ghost" size="sm" disabled={busy} onclick={handleDisconnect}>
				Desconectar
			</Button>
		{:else}
			<Button size="sm" loading={busy} disabled={!expertId} onclick={handleConnect}>
				<Icon name="link" size={15} />
				Conectar com Facebook
			</Button>
		{/if}
	</div>

	{#if message}
		<Alert>{message}</Alert>
	{/if}
</div>
