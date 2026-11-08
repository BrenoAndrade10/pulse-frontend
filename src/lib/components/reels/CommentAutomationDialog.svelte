<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { ApiError } from '#lib/api/http.js';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
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
			return t('reels.dialog.keywordTooLong', { max: MAX_KEYWORD_LENGTH });
		}
		if (submitted && keywords.length === 0 && !draft.trim()) {
			return t('reels.dialog.keywordRequired');
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
			return t('reels.dialog.messageTooLongWithButton', { max: MAX_BUTTON_MESSAGE_LENGTH });
		}
		return submitted && !message.trim() ? t('reels.dialog.messageRequired') : undefined;
	});
	const buttonLabelError = $derived(
		submitted && withButton && !buttonLabel.trim()
			? t('reels.dialog.buttonLabelRequired')
			: undefined
	);
	const buttonUrlError = $derived.by(() => {
		if (!submitted || !withButton) return undefined;
		if (!buttonUrl.trim()) return t('reels.dialog.buttonUrlRequired');
		return isHttpsUrl(buttonUrl.trim()) ? undefined : t('reels.dialog.buttonUrlInvalid');
	});
	const commentReplyError = $derived(
		submitted && withCommentReply && !commentReply.trim()
			? t('reels.dialog.commentReplyRequired')
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
		if (!(error instanceof ApiError)) return t('reels.dialog.saveFailed');
		if (error.validationMessages.length > 0) return error.validationMessages.join(' ');

		const messages: Record<string, MessageKey> = {
			INSTAGRAM_NOT_CONNECTED: 'reels.dialog.apiErrors.notConnected',
			INSTAGRAM_ACCESS_TOKEN_EXPIRED: 'reels.dialog.apiErrors.expired',
			INSTAGRAM_ACCESS_TOKEN_INVALID: 'reels.dialog.apiErrors.invalid',
			INSTAGRAM_GRAPH_API_ERROR: 'reels.dialog.apiErrors.graphError',
			INSTAGRAM_GRAPH_API_UNAVAILABLE: 'reels.dialog.apiErrors.unavailable'
		};

		return t(messages[error.reason] ?? 'reels.dialog.saveFailed');
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
			formError = t('reels.dialog.deleteFailed');
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
				<h2 class="text-[17px] font-bold" id="automation-title">
					{t('reels.dialog.title')}
				</h2>
				<p class="mt-0.5 line-clamp-2 text-[13px] text-fg-muted">
					{post.caption ?? t('reels.dialog.noCaption')}
				</p>
			</div>
			<button
				class="grid size-8 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-fg"
				type="button"
				aria-label={t('common.actions.close')}
				onclick={() => dialog?.close()}
			>
				<Icon name="x" size={18} />
			</button>
		</header>

		<div class="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5">
			<p class="text-[13.5px] text-fg-muted">
				{t('reels.dialog.intro')}
			</p>

			<div class="flex flex-col gap-1.5">
				<label class="text-[13px] font-semibold text-fg-muted" for="automation-keyword">
					{t('reels.dialog.keywords')}
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
								aria-label={t('reels.dialog.removeKeyword', { keyword })}
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
							placeholder={keywords.length
								? t('reels.dialog.addAnother')
								: t('reels.dialog.keywordPlaceholder')}
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
						{t('reels.dialog.keywordHint', { max: MAX_KEYWORDS })}
					</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1.5">
				<div class="flex items-baseline justify-between gap-3">
					<label class="text-[13px] font-semibold text-fg-muted" for="automation-message">
						{t('reels.dialog.message')}
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
					placeholder={t('reels.dialog.messagePlaceholder')}
					aria-describedby="automation-message-hint"
					aria-invalid={messageError ? 'true' : undefined}></textarea>
				{#if messageError}
					<p class="text-[12.5px] text-danger" role="alert">{messageError}</p>
				{:else}
					<p class="text-[12.5px] text-fg-subtle" id="automation-message-hint">
						{t('reels.dialog.messageHint')}
					</p>
				{/if}
			</div>

			<section class="flex flex-col gap-3.5 rounded-md border border-border p-4">
				<Checkbox id="automation-with-button" bind:checked={withButton}>
					<strong class="text-fg">{t('reels.dialog.withButton')}</strong>
					<span class="block text-[12.5px] text-fg-subtle">
						{t('reels.dialog.withButtonHint')}
					</span>
				</Checkbox>

				{#if withButton}
					<div
						class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 max-[561px]:grid-cols-1 motion-safe:animate-fade-in"
					>
						<TextField
							id="automation-button-label"
							label={t('reels.dialog.buttonLabel')}
							placeholder={t('reels.dialog.buttonLabelPlaceholder')}
							maxlength={MAX_BUTTON_LABEL_LENGTH}
							bind:value={buttonLabel}
							error={buttonLabelError}
							hint="{buttonLabel.length}/{MAX_BUTTON_LABEL_LENGTH}"
						/>
						<TextField
							id="automation-button-url"
							type="url"
							label={t('reels.dialog.buttonUrl')}
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
						{t('reels.dialog.preview')}
					</p>
					<div class="flex max-w-[85%] flex-col gap-1">
						<p
							class={[
								'rounded-2xl rounded-bl-md bg-surface-hover px-3.5 py-2.5 text-[13.5px] break-words whitespace-pre-wrap',
								!message.trim() && 'text-fg-subtle'
							]}
						>
							{message.trim() || t('reels.dialog.previewEmpty')}
						</p>
						{#if withButton}
							<span
								class="flex items-center justify-center gap-1.5 rounded-xl border border-border-strong px-3.5 py-2 text-[13.5px] font-semibold text-primary-hover motion-safe:animate-fade-in"
							>
								<Icon name="external-link" size={13} />
								{buttonLabel.trim() || t('reels.dialog.buttonLabel')}
							</span>
						{/if}
					</div>
				</div>
			</section>

			<section class="flex flex-col gap-3.5 rounded-md border border-border p-4">
				<Checkbox id="automation-with-comment-reply" bind:checked={withCommentReply}>
					<strong class="text-fg">{t('reels.dialog.withCommentReply')}</strong>
					<span class="block text-[12.5px] text-fg-subtle">
						{t('reels.dialog.withCommentReplyHint')}
					</span>
				</Checkbox>

				{#if withCommentReply}
					<div class="flex flex-col gap-1.5 motion-safe:animate-fade-in">
						<div class="flex items-baseline justify-between gap-3">
							<label class="text-[13px] font-semibold text-fg-muted" for="automation-comment-reply">
								{t('reels.dialog.commentReply')}
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
							placeholder={t('reels.dialog.commentReplyPlaceholder')}
							aria-describedby="automation-comment-reply-hint"
							aria-invalid={commentReplyError ? 'true' : undefined}></textarea>
						{#if commentReplyError}
							<p class="text-[12.5px] text-danger" role="alert">{commentReplyError}</p>
						{:else}
							<p class="text-[12.5px] text-fg-subtle" id="automation-comment-reply-hint">
								{t('reels.dialog.commentReplyHint')}
							</p>
						{/if}
					</div>
				{/if}
			</section>

			<Checkbox id="automation-active" bind:checked={isActive}>
				<strong class="text-fg">{t('reels.dialog.active')}</strong>
				<span class="block text-[12.5px] text-fg-subtle">
					{t('reels.dialog.activeHint')}
				</span>
			</Checkbox>

			{#if initial}
				<p class="flex items-center gap-2 text-[13px] text-fg-muted">
					<Icon name="send" size={14} />
					{t('reels.dialog.sent', { count: initial.sentCount })}
					{#if initial.lastSentAt}{t('reels.dialog.lastSent', {
							date: formatDate(initial.lastSentAt)
						})}{/if}
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
						<Icon name="trash" size={15} />{t('reels.dialog.delete')}
					</Button>
				{/if}
			</div>
			<div class="flex gap-2.5">
				<Button variant="ghost" disabled={busy} onclick={() => dialog?.close()}
					>{t('common.actions.cancel')}</Button
				>
				<Button type="submit" loading={saving} disabled={busy}>{t('common.actions.save')}</Button>
			</div>
		</footer>
	</form>
</dialog>
