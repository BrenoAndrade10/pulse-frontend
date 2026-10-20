<script lang="ts">
	import { ApiError } from '#lib/api/http.js';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { openTrackingSetup, PopupBlockedError } from '#lib/services/tracking.js';
	import type { TrackingPixel } from '#lib/types.js';
	import { isAllowedDomain, parsePageUrl } from '#lib/utils/trackingUrl.js';

	type Props = {
		expertId: string;
		pixel: TrackingPixel;
	};

	let { expertId, pixel }: Props = $props();

	/** O que a pessoa digitou; enquanto não digita, vale a última página configurada. */
	let typed = $state<string | null>(null);
	const url = $derived(typed ?? pixel.pages[0]?.url ?? '');
	let submitted = $state(false);
	let opening = $state(false);
	let feedback = $state<{ variant: 'success' | 'error'; text: string }>();
	let input = $state<HTMLInputElement>();

	const parsed = $derived(parsePageUrl(url));
	const showError = $derived(submitted && !parsed.ok);
	const newDomain = $derived(
		parsed.ok && !isAllowedDomain(parsed.hostname, pixel.allowedDomains) ? parsed.hostname : null
	);
	const pixelInstalled = $derived(pixel.installation.status === 'installed');

	const steps: { icon: IconName; title: string; text: string }[] = [
		{
			icon: 'external-link',
			title: 'Abra a página',
			text: 'Ela abre numa nova aba, com o editor do Pulse.'
		},
		{
			icon: 'target',
			title: 'Clique no elemento',
			text: 'Um botão, link ou formulário da página.'
		},
		{ icon: 'tag', title: 'Escolha o evento', text: 'Lead, compra, cadastro ou um nome seu.' }
	];

	/** Usado pela lista de páginas: preenche e foca o campo. */
	export function prefill(value: string) {
		typed = value;
		feedback = undefined;
		submitted = false;
		input?.focus();
	}

	function errorMessage(error: unknown): string {
		if (error instanceof PopupBlockedError) {
			return 'O navegador bloqueou a nova aba. Permita pop-ups para o Pulse e tente de novo.';
		}
		if (error instanceof ApiError && error.validationMessages.length > 0) {
			return error.validationMessages.join(' ');
		}
		return 'Não foi possível abrir a configuração. Tente novamente.';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		feedback = undefined;
		if (!parsed.ok) return;

		typed = parsed.url;
		opening = true;
		try {
			await openTrackingSetup(expertId, parsed.url);
			feedback = {
				variant: 'success',
				text: 'Abrimos a página numa nova aba. Configure os eventos por lá: eles aparecem aqui assim que forem salvos.'
			};
		} catch (error) {
			feedback = { variant: 'error', text: errorMessage(error) };
		} finally {
			opening = false;
		}
	}
</script>

<section
	class="rounded-lg border border-border bg-bg-elevated p-6 max-[561px]:p-4.5"
	aria-labelledby="setup-title"
>
	<h2 id="setup-title" class="text-[17px] font-bold">Configurar eventos</h2>
	<p class="mt-1 text-[13.5px] text-fg-muted">
		Cole o link da página. Você escolhe na própria página quais cliques e formulários viram eventos.
	</p>

	<form class="mt-5" novalidate onsubmit={handleSubmit}>
		<label class="sr-only" for="setup-url">Link da página</label>
		<div class="flex gap-2.5 max-[621px]:flex-col">
			<div
				class={[
					'flex min-w-0 flex-1 items-center rounded-md border bg-surface',
					'[transition:border-color_0.15s,box-shadow_0.15s] focus-within:bg-surface-hover',
					showError
						? 'border-danger focus-within:shadow-[0_0_0_3px_rgb(255_92_122/0.25)]'
						: 'border-border focus-within:border-primary focus-within:shadow-focus hover:not-focus-within:border-border-strong'
				]}
			>
				<span class="pl-3.5 text-fg-subtle" aria-hidden="true"><Icon name="link" size={17} /></span>
				<input
					class="h-11.5 min-w-0 flex-1 border-0 bg-transparent px-3 text-[15px] text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none"
					id="setup-url"
					type="url"
					inputmode="url"
					autocomplete="url"
					spellcheck="false"
					placeholder="https://meusite.com.br/pagina-de-vendas"
					bind:value={() => url, (value) => (typed = value)}
					bind:this={input}
					aria-invalid={showError ? 'true' : undefined}
					aria-describedby="setup-url-status"
				/>
			</div>
			<Button type="submit" loading={opening} class="shrink-0">
				Abrir e configurar
				<Icon name="external-link" size={15} />
			</Button>
		</div>

		<div class="mt-2.5 min-h-5 text-[12.5px]" id="setup-url-status" aria-live="polite">
			{#if showError && !parsed.ok}
				<p class="text-danger">{parsed.error}</p>
			{:else if parsed.ok}
				<p class="flex flex-wrap items-center gap-x-1.5 text-fg-muted motion-safe:animate-fade-in">
					<Icon name="check" size={13} />
					<strong class="font-semibold text-fg">{parsed.hostname}</strong>
					<span class="truncate text-fg-subtle">{parsed.path === '/' ? '' : parsed.path}</span>
					{#if newDomain}
						<span class="text-fg-subtle">· será autorizado a enviar eventos para este pixel</span>
					{/if}
				</p>
			{/if}
		</div>
	</form>

	{#if !pixelInstalled}
		<div class="mt-4">
			<Alert variant="warning">
				O pixel ainda não enviou nenhum evento. Instale o código abaixo nessa página antes: sem ele,
				o editor não aparece.
			</Alert>
		</div>
	{/if}

	{#if feedback}
		<div class="mt-4 motion-safe:animate-fade-in">
			<Alert variant={feedback.variant}>{feedback.text}</Alert>
		</div>
	{/if}

	<ol class="mt-6 grid grid-cols-3 gap-3 max-[761px]:grid-cols-1">
		{#each steps as step, index (step.title)}
			<li class="flex gap-3 rounded-md bg-surface p-3.5">
				<span
					class="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-primary-hover"
					aria-hidden="true"
				>
					<Icon name={step.icon} size={15} />
				</span>
				<span class="min-w-0">
					<span class="block text-[13.5px] font-semibold">
						<span class="sr-only">Passo {index + 1}:</span>{step.title}
					</span>
					<span class="block text-[12.5px] text-fg-subtle">{step.text}</span>
				</span>
			</li>
		{/each}
	</ol>
</section>
