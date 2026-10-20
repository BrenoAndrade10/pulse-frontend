<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { ApiError } from '#lib/api/http.js';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import {
		deleteCommentAutomation,
		MAX_BUTTON_LABEL_LENGTH,
		MAX_BUTTON_MESSAGE_LENGTH,
		MAX_COMMENT_REPLY_LENGTH,
		MAX_KEYWORD_LENGTH,
		MAX_KEYWORDS,
		MAX_REPLY_MESSAGE_LENGTH,
		saveCommentAutomation
	} from '#lib/services/commentAutomations.js';
	import type { CommentAutomation, InstagramPost } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
	import { coverUrl } from '#lib/utils/instagramMedia.js';

	type Props = {
		expertId: string;
		post: InstagramPost;
		automation: CommentAutomation | null;
		onsaved: (automation: CommentAutomation) => void;
		ondeleted: (mediaId: string) => void;
		onclose: () => void;
	};

	let { expertId, post, automation, onsaved, ondeleted, onclose }: Props = $props();

	const cover = $derived(coverUrl(post));

	// Valores iniciais copiados uma única vez; o modal é recriado a cada abertura.
	const initial = untrack(() => automation);

	let dialog = $state<HTMLDialogElement>();
	let keywords = $state<string[]>(initial?.keywords ?? []);
	let draft = $state('');
	let message = $state(initial?.message ?? '');
	let isActive = $state(initial?.isActive ?? true);
	let withButton = $state(Boolean(initial?.button));
	let buttonLabel = $state(initial?.button?.label ?? '');
	let buttonUrl = $state(initial?.button?.url ?? '');
	let withCommentReply = $state(Boolean(initial?.commentReply));
	let commentReply = $state(initial?.commentReply ?? '');
	let saving = $state(false);
	let deleting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();

	/** Mesma regra da API: maiúsculas, acentos e espaços extras não diferenciam. */
	const normalize = (value: string) =>
		value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

	const keywordError = $derived.by(() => {
		if (draft.trim().length > MAX_KEYWORD_LENGTH) {
			return `Cada palavra-chave deve ter no máximo ${MAX_KEYWORD_LENGTH} caracteres.`;
		}
		if (submitted && keywords.length === 0 && !draft.trim()) {
			return 'Adicione pelo menos uma palavra-chave.';
		}
		return undefined;
	});
	// Com botão a DM vira template da Meta, que aceita menos texto.
	const messageLimit = $derived(withButton ? MAX_BUTTON_MESSAGE_LENGTH : MAX_REPLY_MESSAGE_LENGTH);

	const isHttpsUrl = (value: string) => {
		try {
			return new URL(value).protocol === 'https:';
		} catch {
			return false;
		}
	};

	const messageError = $derived.by(() => {
		if (message.length > messageLimit) {
			return `Com botão, a mensagem pode ter até ${MAX_BUTTON_MESSAGE_LENGTH} caracteres.`;
		}
		return submitted && !message.trim() ? 'Escreva a mensagem que será enviada na DM.' : undefined;
	});
	const buttonLabelError = $derived(
		submitted && withButton && !buttonLabel.trim() ? 'Escreva o texto do botão.' : undefined
	);
	const buttonUrlError = $derived.by(() => {
		if (!submitted || !withButton) return undefined;
		if (!buttonUrl.trim()) return 'Informe o link que o botão abre.';
		return isHttpsUrl(buttonUrl.trim()) ? undefined : 'Use um link que comece com https://.';
	});
	const commentReplyError = $derived(
		submitted && withCommentReply && !commentReply.trim()
			? 'Escreva a resposta do comentário ou desmarque a opção.'
			: undefined
	);
	const busy = $derived(saving || deleting);

	onMount(() => {
		dialog?.showModal();
	});

	/** Adiciona o que foi digitado; aceita várias separadas por vírgula. */
	function commitDraft(): boolean {
		const candidates = draft
			.split(',')
			.map((value) => value.replace(/\s+/g, ' ').trim())
			.filter(Boolean);

		if (candidates.some((value) => value.length > MAX_KEYWORD_LENGTH)) return false;

		for (const candidate of candidates) {
			if (keywords.length >= MAX_KEYWORDS) break;
			if (!keywords.some((keyword) => normalize(keyword) === normalize(candidate))) {
				keywords.push(candidate);
			}
		}
		draft = '';
		return true;
	}

	function handleKeywordKey(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			commitDraft();
		} else if (event.key === 'Backspace' && !draft && keywords.length > 0) {
			keywords.pop();
		}
	}

	function removeKeyword(index: number) {
		keywords.splice(index, 1);
	}

	function errorMessage(error: unknown): string {
		if (!(error instanceof ApiError)) return 'Não foi possível salvar. Tente novamente.';
		if (error.validationMessages.length > 0) return error.validationMessages.join(' ');

		const messages: Record<string, string> = {
			INSTAGRAM_NOT_CONNECTED: 'Conecte o Instagram deste expert antes de ativar a DM automática.',
			INSTAGRAM_ACCESS_TOKEN_EXPIRED:
				'A conexão com o Instagram expirou. Reconecte a conta para ativar a DM automática.',
			INSTAGRAM_ACCESS_TOKEN_INVALID:
				'A Meta recusou o acesso desta conta. Reconecte o Instagram do expert.',
			INSTAGRAM_GRAPH_API_ERROR:
				'A Meta não confirmou o acompanhamento dos comentários desta conta. Tente novamente em alguns instantes.',
			INSTAGRAM_GRAPH_API_UNAVAILABLE:
				'O Instagram não respondeu. Tente novamente em alguns instantes.'
		};

		return messages[error.reason] ?? 'Não foi possível salvar. Tente novamente.';
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;

		if (draft.trim() && !commitDraft()) return;
		if (
			keywords.length === 0 ||
			messageError ||
			buttonLabelError ||
			buttonUrlError ||
			commentReplyError
		) {
			return;
		}

		saving = true;
		try {
			onsaved(
				await saveCommentAutomation(expertId, post.id, {
					keywords,
					message: message.trim(),
					button: withButton ? { label: buttonLabel.trim(), url: buttonUrl.trim() } : null,
					commentReply: withCommentReply ? commentReply.trim() : null,
					isActive
				})
			);
			dialog?.close();
		} catch (error) {
			formError = errorMessage(error);
		} finally {
			saving = false;
		}
	}

	async function handleDelete() {
		deleting = true;
		formError = undefined;
		try {
			await deleteCommentAutomation(expertId, post.id);
			ondeleted(post.id);
			dialog?.close();
		} catch {
			formError = 'Não foi possível excluir a automação. Tente novamente.';
		} finally {
			deleting = false;
		}
	}
</script>

<dialog
	class={[
		'm-auto w-[min(560px,calc(100vw-32px))] overflow-hidden p-0',
		'rounded-lg border border-border-strong bg-bg-elevated text-fg',
		'shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]',
		'backdrop:bg-[rgb(5_5_10/0.7)] backdrop:backdrop-blur-[3px]'
	]}
	bind:this={dialog}
	aria-labelledby="automation-title"
	{onclose}
>
	<form class="flex max-h-[calc(100dvh-32px)] flex-col" novalidate onsubmit={handleSubmit}>
		<header class="flex items-start gap-3.5 border-b border-border px-6 py-5">
			<span
				class="grid h-16 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-fg-subtle"
				aria-hidden="true"
			>
				{#if cover}
					<img class="size-full object-cover" src={cover} alt="" />
				{:else}
					<Icon name="video" size={20} />
				{/if}
			</span>
			<div class="min-w-0 flex-1">
				<h2 class="text-[17px] font-bold" id="automation-title">DM automática</h2>
				<p class="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">
					{post.caption ?? 'Publicação sem legenda'}
				</p>
			</div>
			<button
				class="grid size-8 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-fg"
				type="button"
				aria-label="Fechar"
				onclick={() => dialog?.close()}
			>
				<Icon name="x" size={18} />
			</button>
		</header>

		<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
			<p class="text-[13.5px] text-fg-muted">
				Quando alguém comentar nesta publicação uma das palavras-chave, a pessoa recebe a mensagem
				abaixo no Direct.
			</p>

			<div class="flex flex-col gap-1.5">
				<label class="text-[13px] font-semibold text-fg-muted" for="automation-keyword">
					Palavras-chave
				</label>
				<div
					class={[
						'flex min-h-11.5 flex-wrap items-center gap-1.5 rounded-md border bg-surface px-2 py-1.5',
						'focus-within:bg-surface-hover [transition:border-color_0.15s,box-shadow_0.15s]',
						keywordError
							? 'border-danger'
							: 'border-border focus-within:border-primary focus-within:shadow-focus'
					]}
				>
					{#each keywords as keyword, index (keyword)}
						<span
							class="inline-flex items-center gap-1 rounded-full bg-primary/15 py-1 pr-1 pl-2.5 text-[13px] font-semibold text-primary-hover"
						>
							{keyword}
							<button
								class="grid size-5 place-items-center rounded-full hover:bg-primary/25"
								type="button"
								aria-label="Remover {keyword}"
								onclick={() => removeKeyword(index)}
							>
								<Icon name="x" size={12} />
							</button>
						</span>
					{/each}
					{#if keywords.length < MAX_KEYWORDS}
						<input
							class="h-8 min-w-32 flex-1 border-0 bg-transparent px-1.5 text-fg outline-none placeholder:text-fg-subtle focus-visible:shadow-none"
							id="automation-keyword"
							bind:value={draft}
							placeholder={keywords.length ? 'Adicionar outra' : 'Ex.: quero, link, eu quero'}
							autocomplete="off"
							aria-describedby="automation-keyword-hint"
							aria-invalid={keywordError ? 'true' : undefined}
							onkeydown={handleKeywordKey}
							onblur={commitDraft}
						/>
					{/if}
				</div>
				{#if keywordError}
					<p class="text-[12.5px] text-danger" role="alert">{keywordError}</p>
				{:else}
					<p class="text-[12.5px] text-fg-subtle" id="automation-keyword-hint">
						Pressione Enter ou vírgula para adicionar (até {MAX_KEYWORDS}). Maiúsculas e acentos não
						fazem diferença, e a palavra precisa aparecer inteira no comentário.
					</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1.5">
				<div class="flex items-baseline justify-between gap-3">
					<label class="text-[13px] font-semibold text-fg-muted" for="automation-message">
						Mensagem da DM
					</label>
					<span
						class={[
							'text-[12px] tabular-nums',
							message.length > messageLimit ? 'text-danger' : 'text-fg-subtle'
						]}
						aria-live="polite"
					>
						{message.length}/{messageLimit}
					</span>
				</div>
				<textarea
					class={[
						'min-h-32 resize-y rounded-md border bg-surface px-3.5 py-3 text-fg outline-none',
						'placeholder:text-fg-subtle focus:bg-surface-hover',
						'[transition:border-color_0.15s,box-shadow_0.15s]',
						messageError ? 'border-danger' : 'border-border focus:border-primary focus:shadow-focus'
					]}
					id="automation-message"
					bind:value={message}
					maxlength={MAX_REPLY_MESSAGE_LENGTH}
					placeholder="Oi! Que bom que você quer saber mais. Aqui está o link: …"
					aria-describedby="automation-message-hint"
					aria-invalid={messageError ? 'true' : undefined}></textarea>
				{#if messageError}
					<p class="text-[12.5px] text-danger" role="alert">{messageError}</p>
				{:else}
					<p class="text-[12.5px] text-fg-subtle" id="automation-message-hint">
						Enviada uma única vez por comentário, como resposta privada. Quem não segue a conta
						recebe em Solicitações de mensagem.
					</p>
				{/if}
			</div>

			<section class="flex flex-col gap-3.5 rounded-md border border-border p-4">
				<Checkbox id="automation-with-button" bind:checked={withButton}>
					<strong class="text-fg">Adicionar botão com link</strong>
					<span class="block text-[12.5px] text-fg-subtle">
						Aparece logo abaixo da mensagem e abre o link ao tocar.
					</span>
				</Checkbox>

				{#if withButton}
					<div
						class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 max-[561px]:grid-cols-1 motion-safe:animate-fade-in"
					>
						<TextField
							id="automation-button-label"
							label="Texto do botão"
							placeholder="Ex.: Ver material"
							maxlength={MAX_BUTTON_LABEL_LENGTH}
							bind:value={buttonLabel}
							error={buttonLabelError}
							hint="{buttonLabel.length}/{MAX_BUTTON_LABEL_LENGTH}"
						/>
						<TextField
							id="automation-button-url"
							type="url"
							label="Link"
							placeholder="https://"
							inputmode="url"
							autocomplete="off"
							bind:value={buttonUrl}
							error={buttonUrlError}
						/>
					</div>
				{/if}

				<div class="rounded-md bg-surface p-3.5">
					<p class="mb-2.5 text-[11.5px] font-semibold tracking-[0.05em] text-fg-subtle uppercase">
						Prévia da DM
					</p>
					<div class="flex max-w-[85%] flex-col gap-1">
						<p
							class={[
								'rounded-2xl rounded-bl-md bg-surface-hover px-3.5 py-2.5 text-[13.5px] break-words whitespace-pre-wrap',
								!message.trim() && 'text-fg-subtle'
							]}
						>
							{message.trim() || 'Sua mensagem aparece aqui.'}
						</p>
						{#if withButton}
							<span
								class="flex items-center justify-center gap-1.5 rounded-xl border border-border-strong px-3.5 py-2 text-[13.5px] font-semibold text-primary-hover motion-safe:animate-fade-in"
							>
								<Icon name="external-link" size={13} />
								{buttonLabel.trim() || 'Texto do botão'}
							</span>
						{/if}
					</div>
				</div>
			</section>

			<section class="flex flex-col gap-3.5 rounded-md border border-border p-4">
				<Checkbox id="automation-with-comment-reply" bind:checked={withCommentReply}>
					<strong class="text-fg">Responder o comentário publicamente</strong>
					<span class="block text-[12.5px] text-fg-subtle">
						Publicada no comentário depois que a DM for enviada.
					</span>
				</Checkbox>

				{#if withCommentReply}
					<div class="flex flex-col gap-1.5 motion-safe:animate-fade-in">
						<div class="flex items-baseline justify-between gap-3">
							<label class="text-[13px] font-semibold text-fg-muted" for="automation-comment-reply">
								Resposta do comentário
							</label>
							<span class="text-[12px] text-fg-subtle tabular-nums">
								{commentReply.length}/{MAX_COMMENT_REPLY_LENGTH}
							</span>
						</div>
						<textarea
							class={[
								'min-h-20 resize-y rounded-md border bg-surface px-3.5 py-3 text-fg outline-none',
								'placeholder:text-fg-subtle focus:bg-surface-hover',
								'[transition:border-color_0.15s,box-shadow_0.15s]',
								commentReplyError
									? 'border-danger'
									: 'border-border focus:border-primary focus:shadow-focus'
							]}
							id="automation-comment-reply"
							bind:value={commentReply}
							maxlength={MAX_COMMENT_REPLY_LENGTH}
							placeholder="Ex.: Te mandei no direct! 📩"
							aria-describedby="automation-comment-reply-hint"
							aria-invalid={commentReplyError ? 'true' : undefined}></textarea>
						{#if commentReplyError}
							<p class="text-[12.5px] text-danger" role="alert">{commentReplyError}</p>
						{:else}
							<p class="text-[12.5px] text-fg-subtle" id="automation-comment-reply-hint">
								Fica visível para todos. Se a DM não sair, o comentário não é respondido.
							</p>
						{/if}
					</div>
				{/if}
			</section>

			<Checkbox id="automation-active" bind:checked={isActive}>
				<strong class="text-fg">Automação ativa</strong>
				<span class="block text-[12.5px] text-fg-subtle">
					Desmarque para pausar sem perder a configuração.
				</span>
			</Checkbox>

			{#if initial}
				<p class="flex items-center gap-2 text-[13px] text-fg-muted">
					<Icon name="send" size={14} />
					{initial.sentCount === 1 ? '1 DM enviada' : `${initial.sentCount} DMs enviadas`}
					{#if initial.lastSentAt}· última em {formatDate(initial.lastSentAt)}{/if}
				</p>
			{/if}

			{#if formError}
				<Alert>{formError}</Alert>
			{/if}
		</div>

		<footer
			class="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-6 py-4"
		>
			<div>
				{#if initial}
					<Button variant="ghost" loading={deleting} disabled={busy} onclick={handleDelete}>
						<Icon name="trash" size={15} />Excluir
					</Button>
				{/if}
			</div>
			<div class="flex gap-2.5">
				<Button variant="ghost" disabled={busy} onclick={() => dialog?.close()}>Cancelar</Button>
				<Button type="submit" loading={saving} disabled={busy}>Salvar</Button>
			</div>
		</footer>
	</form>
</dialog>
