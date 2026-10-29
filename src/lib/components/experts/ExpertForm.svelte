<script lang="ts">
	import { untrack } from 'svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import type { Expert, ExpertInput } from '#lib/types.js';
	import { META_INTEGRATIONS } from '#lib/utils/integrations.js';
	import { validateEmail, validateRequired } from '#lib/utils/validation.js';
	import InstagramConnectionCard from './InstagramConnectionCard.svelte';
	import IntegrationConnectionCard from './IntegrationConnectionCard.svelte';
	import WhatsAppConnectionCard from './WhatsAppConnectionCard.svelte';

	type Props = {
		expert?: Expert;
		submitLabel: string;
		cancelHref: string;
		onsubmit: (input: ExpertInput) => Promise<void>;
	};

	let { expert, submitLabel, cancelHref, onsubmit }: Props = $props();

	const initial = untrack(() => expert);

	let form = $state({
		name: initial?.name ?? '',
		commercialName: initial?.commercialName ?? '',
		email: initial?.email ?? ''
	});

	let submitted = $state(false);
	let submitting = $state(false);
	let formError = $state<string>();

	const errors = $derived({
		name: validateRequired(form.name, 'Informe o nome do expert.'),
		email: validateEmail(form.email)
	});

	const show = (error: string | undefined) => (submitted ? error : undefined);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;

		if (Object.values(errors).some(Boolean)) return;

		submitting = true;
		try {
			await onsubmit({
				name: form.name.trim(),
				commercialName: form.commercialName.trim() || null,
				email: form.email.trim()
			});
		} catch {
			formError = 'Não foi possível salvar o expert. Tente novamente.';
		} finally {
			submitting = false;
		}
	}
</script>

<form class="flex flex-col gap-5" novalidate onsubmit={handleSubmit}>
	{#if formError}
		<Alert>{formError}</Alert>
	{/if}

	<Card title="Dados do expert" description="Informações de identificação.">
		<div class="grid grid-cols-2 gap-x-5 gap-y-4.5 max-[721px]:grid-cols-1">
			<TextField
				id="name"
				label="Nome *"
				placeholder="Ex.: Ana Souza"
				bind:value={form.name}
				error={show(errors.name)}
			/>
			<TextField
				id="commercial-name"
				label="Nome comercial"
				placeholder="Ex.: Método Ana Souza"
				bind:value={form.commercialName}
			/>
			<TextField
				id="email"
				type="email"
				label="E-mail *"
				placeholder="contato@expert.com"
				bind:value={form.email}
				error={show(errors.email)}
			/>
		</div>
	</Card>

	<Card
		id="integrations"
		title="Integrações da Meta"
		description="Cada canal tem uma autorização própria na Meta: conectar um não conecta os outros."
	>
		<div class="flex flex-col gap-3">
			{#each META_INTEGRATIONS as integration (integration.channel)}
				{#if integration.channel === 'instagram'}
					<InstagramConnectionCard
						expertId={expert?.id ?? null}
						connection={expert?.instagram ?? null}
					/>
				{:else if integration.channel === 'whatsapp'}
					{#key expert?.id}
						<WhatsAppConnectionCard expertId={expert?.id ?? null} />
					{/key}
				{:else}
					<IntegrationConnectionCard
						{integration}
						badge={{ label: 'Em breve', variant: 'neutral' }}
						detail={integration.description}
					>
						{#snippet actions()}
							<Button size="sm" variant="secondary" disabled>
								<Icon name="facebook" size={15} />
								{integration.connectLabel}
							</Button>
						{/snippet}
					</IntegrationConnectionCard>
				{/if}
			{/each}
		</div>
	</Card>

	<div class="flex justify-end gap-2.5">
		<a class={buttonClass({ variant: 'ghost' })} href={cancelHref}>Cancelar</a>
		<Button type="submit" loading={submitting}>{submitLabel}</Button>
	</div>
</form>
