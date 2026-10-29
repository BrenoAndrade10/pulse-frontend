<script lang="ts">
	import { onMount } from 'svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import {
		EmbeddedSignupCancelledError,
		EmbeddedSignupError,
		isWhatsAppEmbeddedSignupConfigured,
		startWhatsAppEmbeddedSignup
	} from '#lib/meta/embeddedSignup.js';
	import {
		connectWhatsApp,
		disconnectWhatsApp,
		getWhatsAppConnection,
		whatsappConnectionErrorMessage
	} from '#lib/services/whatsappConnection.js';
	import type { WhatsAppConnection, WhatsAppQualityRating } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
	import type { BadgeVariant } from '#lib/utils/integrations.js';
	import { metaIntegration } from '#lib/utils/integrations.js';
	import IntegrationConnectionCard from './IntegrationConnectionCard.svelte';

	type Props = { expertId: string | null };

	let { expertId }: Props = $props();

	const integration = metaIntegration('whatsapp');
	const qualityLabels: Record<WhatsAppQualityRating, { label: string; variant: BadgeVariant }> = {
		GREEN: { label: 'Alta', variant: 'success' },
		YELLOW: { label: 'Média', variant: 'warning' },
		RED: { label: 'Baixa', variant: 'danger' },
		UNKNOWN: { label: 'Não informada', variant: 'neutral' }
	};

	let connection = $state<WhatsAppConnection>({ status: 'disconnected' });
	let loadState = $state<'loading' | 'ready' | 'error'>('loading');
	let connecting = $state(false);
	let disconnecting = $state(false);
	let actionFeedback = $state<{ variant: 'error' | 'success' | 'warning'; text: string }>();
	let errorMessage = $state('');
	let dialog = $state<HTMLDialogElement>();

	const connected = $derived(connection.status === 'connected' ? connection : null);
	const detail = $derived(
		connected
			? `Conectado em ${formatDate(connected.connectedAt)}`
			: 'Autorize a conta e o número do WhatsApp Business deste expert.'
	);

	function formatPhone(value: string): string {
		const digits = value.replace(/\D/g, '');
		const brazilian = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(digits);
		if (brazilian) return `+55 (${brazilian[1]}) ${brazilian[2]}-${brazilian[3]}`;
		return value;
	}

	async function loadConnection() {
		if (!expertId) {
			connection = { status: 'disconnected' };
			loadState = 'ready';
			return;
		}

		loadState = 'loading';
		errorMessage = '';
		try {
			connection = await getWhatsAppConnection(expertId);
			loadState = 'ready';
		} catch (error) {
			errorMessage = whatsappConnectionErrorMessage(error);
			loadState = 'error';
		}
	}

	onMount(() => void loadConnection());

	async function handleConnect() {
		if (!expertId || connecting || !isWhatsAppEmbeddedSignupConfigured) return;
		const id = expertId;
		connecting = true;
		actionFeedback = undefined;
		try {
			const signup = await startWhatsAppEmbeddedSignup();
			if (id !== expertId) return;
			const nextConnection = await connectWhatsApp(id, signup);
			if (id !== expertId) return;
			connection = nextConnection;
			loadState = 'ready';
			actionFeedback = { variant: 'success', text: 'WhatsApp conectado com sucesso.' };
		} catch (error) {
			if (id !== expertId) return;
			actionFeedback =
				error instanceof EmbeddedSignupCancelledError
					? { variant: 'warning', text: 'A conexão com o WhatsApp foi cancelada.' }
					: {
							variant: 'error',
							text:
								error instanceof EmbeddedSignupError
									? error.message
									: whatsappConnectionErrorMessage(error)
						};
		} finally {
			if (id === expertId) connecting = false;
		}
	}

	async function handleDisconnect() {
		if (!expertId || disconnecting) return;
		disconnecting = true;
		actionFeedback = undefined;
		try {
			await disconnectWhatsApp(expertId);
			connection = { status: 'disconnected' };
			dialog?.close();
			actionFeedback = { variant: 'success', text: 'WhatsApp desconectado.' };
		} catch (error) {
			dialog?.close();
			actionFeedback = { variant: 'error', text: whatsappConnectionErrorMessage(error) };
		} finally {
			disconnecting = false;
		}
	}
</script>

{#if loadState === 'loading'}
	<article
		class="flex min-h-41 animate-pulse flex-col gap-4 rounded-md border border-border bg-surface p-4.5"
		aria-busy="true"
		aria-label="Carregando conexão do WhatsApp"
	>
		<div class="flex items-start gap-3.5">
			<span class="size-10.5 rounded-[12px] bg-white/6"></span>
			<div class="flex flex-1 flex-col gap-2">
				<span class="h-4 w-42 rounded bg-white/6"></span>
				<span class="h-3.5 w-64 max-w-full rounded bg-white/4"></span>
				<span class="h-3.5 w-48 max-w-full rounded bg-white/4"></span>
			</div>
		</div>
		<span class="h-8 w-42 rounded bg-white/6"></span>
	</article>
{:else if loadState === 'error'}
	<IntegrationConnectionCard
		{integration}
		badge={{ label: 'Erro', variant: 'danger' }}
		detail="Não foi possível consultar a conexão deste expert."
	>
		{#snippet actions()}
			<Button size="sm" variant="secondary" onclick={loadConnection}>Tentar novamente</Button>
		{/snippet}
		<Alert>{errorMessage}</Alert>
	</IntegrationConnectionCard>
{:else}
	<IntegrationConnectionCard
		{integration}
		badge={connected
			? { label: 'Conectado', variant: 'success' }
			: { label: 'Não conectado', variant: 'neutral' }}
		accountName={connected ? formatPhone(connected.displayPhoneNumber) : null}
		{detail}
	>
		{#snippet actions()}
			{#if connected}
				<Button size="sm" variant="ghost" onclick={() => dialog?.showModal()}>Desconectar</Button>
			{:else}
				<Button
					size="sm"
					loading={connecting}
					disabled={!expertId || !isWhatsAppEmbeddedSignupConfigured}
					onclick={handleConnect}
				>
					<Icon name="whatsapp" size={15} />
					{isWhatsAppEmbeddedSignupConfigured
						? 'Conectar WhatsApp'
						: 'WhatsApp ainda não configurado nesta instalação'}
				</Button>
			{/if}
		{/snippet}

		{#if connected}
			<div class="flex flex-wrap items-center gap-2 text-[13px] text-fg-muted">
				<span>Nome verificado: <strong class="text-fg">{connected.verifiedName}</strong></span>
				<span aria-hidden="true">·</span>
				<span>Qualidade</span>
				<Badge variant={qualityLabels[connected.qualityRating].variant}>
					{qualityLabels[connected.qualityRating].label}
				</Badge>
			</div>
		{/if}

		{#if !isWhatsAppEmbeddedSignupConfigured && !connected}
			<Alert variant="warning">WhatsApp ainda não configurado nesta instalação</Alert>
		{/if}

		{#if actionFeedback}
			<Alert variant={actionFeedback.variant}>{actionFeedback.text}</Alert>
		{/if}
	</IntegrationConnectionCard>
{/if}

<dialog
	class={[
		'm-auto w-[min(440px,calc(100vw-32px))] p-6',
		'rounded-lg border border-border-strong bg-bg-elevated text-fg',
		'shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]',
		'backdrop:bg-[rgb(5_5_10/0.7)] backdrop:backdrop-blur-[3px]'
	]}
	bind:this={dialog}
	aria-labelledby="disconnect-whatsapp-title"
>
	<h2 id="disconnect-whatsapp-title" class="text-[18px] font-bold">Desconectar WhatsApp?</h2>
	<p class="mt-2 mb-6 text-fg-muted">
		As automações de WhatsApp deste expert vão parar até que um número seja conectado novamente.
	</p>
	<div class="flex justify-end gap-2.5">
		<Button variant="ghost" disabled={disconnecting} onclick={() => dialog?.close()}>
			Cancelar
		</Button>
		<Button variant="danger" loading={disconnecting} onclick={handleDisconnect}>Desconectar</Button>
	</div>
</dialog>
