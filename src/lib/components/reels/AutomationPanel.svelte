<script lang="ts">
	import { untrack } from 'svelte';
	import { ApiError } from '#lib/api/http.js';
	import AutomationStatus from '#lib/components/reels/AutomationStatus.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Checkbox from '#lib/components/ui/Checkbox.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { t, type MessageKey } from '#lib/i18n/index.svelte.js';
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
	import { automationStatus } from '#lib/utils/commentAutomation.js';
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

	const initial = untrack(() => automation);
	const cover = $derived(coverUrl(post));
	const postTitle = $derived(
		post.caption
			?.split('\n')
			.find((line) => line.trim())
			?.trim() ?? t('reels.card.noCaption')
	);
	const status = $derived(automationStatus(automation));

	let keywords = $state<string[]>(initial?.keywords ?? []);
	let draft = $state('');
	let message = $state(initial?.message ?? '');
	let withButton = $state(Boolean(initial?.button));
	let buttonLabel = $state(initial?.button?.label ?? '');
	let buttonUrl = $state(initial?.button?.url ?? '');
	let withCommentReply = $state(Boolean(initial?.commentReply));
	let commentReply = $state(initial?.commentReply ?? '');
	let saving = $state<'draft' | 'activate' | null>(null);
	let deleting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();

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
	const busy = $derived(saving !== null || deleting);
	const isLive = $derived(Boolean(automation?.isActive));
	const exampleKeyword = $derived(keywords[0] ?? t('reels.dialog.keywordPlaceholder'));

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

	async function save(activate: boolean) {
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

		saving = activate ? 'activate' : 'draft';
		try {
			onsaved(
				await saveCommentAutomation(expertId, post.id, {
					keywords,
					message: message.trim(),
					button: withButton ? { label: buttonLabel.trim(), url: buttonUrl.trim() } : null,
					commentReply: withCommentReply ? commentReply.trim() : null,
					isActive: activate
				})
			);
			if (!isLive || !activate) onclose();
		} catch (error) {
			formError = errorMessage(error);
		} finally {
			saving = null;
		}
	}

	async function handleDelete() {
		deleting = true;
		formError = undefined;
		try {
			await deleteCommentAutomation(expertId, post.id);
			ondeleted(post.id);
			onclose();
		} catch {
			formError = t('reels.dialog.deleteFailed');
		} finally {
			deleting = false;
		}
	}

	const field =
		'rounded-md border bg-surface px-3.5 py-3 text-fg outline-none placeholder:text-fg-subtle focus:bg-surface-hover [transition:border-color_0.15s,box-shadow_0.15s]';
</script>

<svelte:window onkeydown={(event) => event.key === 'Escape' && onclose()} />

<aside
	class={[
		'flex flex-col rounded-lg border border-border-strong bg-[linear-gradient(180deg,rgb(124_92_255/0.1),rgb(17_17_27)_40%)] text-fg',
		'lg:sticky lg:top-28 lg:h-[calc(100dvh-8rem)]',
		'max-lg:fixed max-lg:inset-0 max-lg:z-50 max-lg:rounded-none max-lg:bg-bg-elevated'
	]}
	aria-labelledby="automation-panel-title"
>
	<header class="flex items-center gap-3 border-b border-border px-6 py-4.5">
		<h2
			class="min-w-0 text-[17px] leading-tight font-bold tracking-[-0.01em]"
			id="automation-panel-title"
		>
			{t('reels.auto.panel.title')}
		</h2>
		<span class="shrink-0"><AutomationStatus {status} /></span>
		<button
			class="ml-auto grid size-9 shrink-0 place-items-center rounded-md text-fg-muted hover:bg-surface hover:text-fg"
			type="button"
			aria-label={t('reels.auto.actions.closePanel')}
			onclick={onclose}
		>
			<Icon name="x" size={19} />
		</button>
	</header>

	<div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-5">
		<section class="flex flex-col gap-2.5">
			<h3 class="text-[16px] font-bold">{t('reels.auto.panel.stepPost')}</h3>
			<div class="flex items-center gap-3.5 rounded-md border border-border bg-surface p-2.5">
				<span
					class="grid h-14 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-surface-hover text-fg-subtle"
					aria-hidden="true"
				>
					{#if cover}<img class="size-full object-cover" src={cover} alt="" />{:else}<Icon
							name="video"
							size={20}
						/>{/if}
				</span>
				<span class="line-clamp-2 min-w-0 text-[15px] font-bold">{postTitle}</span>
			</div>
		</section>

		<section class="flex flex-col gap-2">
			<h3 class="text-[16px] font-bold">
				<label for="automation-keyword">{t('reels.auto.panel.stepKeyword')}</label>
			</h3>
			<div
				class={[
					'flex min-h-12 flex-wrap items-center gap-1.5 rounded-md border bg-surface px-2.5 py-1.5',
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
							onclick={() => keywords.splice(index, 1)}
						>
							<Icon name="x" size={12} />
						</button>
					</span>
				{/each}
				{#if keywords.length < MAX_KEYWORDS}
					<input
						class="h-8 min-w-32 flex-1 border-0 bg-transparent px-1.5 text-[15px] text-fg uppercase outline-none placeholder:normal-case placeholder:text-fg-subtle focus-visible:shadow-none"
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
				<p class="text-[13px] text-fg-subtle" id="automation-keyword-hint">
					{t('reels.auto.panel.example', { keyword: exampleKeyword })}
				</p>
			{/if}
		</section>

		<section class="flex flex-col gap-2">
			<div class="flex items-baseline justify-between gap-3">
				<h3 class="text-[16px] font-bold">
					<label for="automation-message">{t('reels.auto.panel.stepMessage')}</label>
				</h3>
				<span
					class={[
						'text-[12px] tabular-nums',
						message.length > messageLimit ? 'text-danger' : 'text-fg-subtle'
					]}
					aria-live="polite">{message.length}/{messageLimit}</span
				>
			</div>
			<textarea
				class={[
					field,
					'min-h-28 resize-y',
					messageError ? 'border-danger' : 'border-border focus:border-primary focus:shadow-focus'
				]}
				id="automation-message"
				bind:value={message}
				maxlength={MAX_REPLY_MESSAGE_LENGTH}
				placeholder={t('reels.dialog.messagePlaceholder')}
				aria-invalid={messageError ? 'true' : undefined}
				aria-describedby={messageError ? 'automation-message-error' : undefined}></textarea>
			{#if messageError}
				<p class="text-[12.5px] text-danger" id="automation-message-error" role="alert">
					{messageError}
				</p>
			{/if}
		</section>

		<details class="group rounded-md border border-border" open={withButton || withCommentReply}>
			<summary
				class="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[14px] font-semibold text-fg-muted hover:text-fg"
			>
				{t('reels.auto.panel.extras')}
				<Icon name="chevron-down" size={16} class="transition-transform group-open:rotate-180" />
			</summary>
			<div class="flex flex-col gap-4 border-t border-border p-4">
				<Checkbox id="automation-with-button" bind:checked={withButton}>
					<strong class="text-fg">{t('reels.dialog.withButton')}</strong>
					<span class="block text-[12.5px] text-fg-subtle">{t('reels.dialog.withButtonHint')}</span>
				</Checkbox>
				{#if withButton}
					<div class="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 max-[561px]:grid-cols-1">
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

				<Checkbox id="automation-with-comment-reply" bind:checked={withCommentReply}>
					<strong class="text-fg">{t('reels.dialog.withCommentReply')}</strong>
					<span class="block text-[12.5px] text-fg-subtle"
						>{t('reels.dialog.withCommentReplyHint')}</span
					>
				</Checkbox>
				{#if withCommentReply}
					<div class="flex flex-col gap-1.5">
						<div class="flex items-baseline justify-between gap-3">
							<label class="text-[13px] font-semibold text-fg-muted" for="automation-comment-reply">
								{t('reels.dialog.commentReply')}
							</label>
							<span class="text-[12px] text-fg-subtle tabular-nums"
								>{commentReply.length}/{MAX_COMMENT_REPLY_LENGTH}</span
							>
						</div>
						<textarea
							class={[
								field,
								'min-h-20 resize-y',
								commentReplyError
									? 'border-danger'
									: 'border-border focus:border-primary focus:shadow-focus'
							]}
							id="automation-comment-reply"
							bind:value={commentReply}
							maxlength={MAX_COMMENT_REPLY_LENGTH}
							placeholder={t('reels.dialog.commentReplyPlaceholder')}
							aria-invalid={commentReplyError ? 'true' : undefined}></textarea>
						{#if commentReplyError}
							<p class="text-[12.5px] text-danger" role="alert">{commentReplyError}</p>
						{/if}
					</div>
				{/if}
			</div>
		</details>

		<section class="rounded-md border border-border bg-surface p-4">
			<h3 class="mb-3.5 text-[15px] font-bold">{t('reels.auto.panel.preview')}</h3>
			<div class="flex items-center gap-3.5">
				<span
					class="grid size-11 shrink-0 place-items-center rounded-full bg-surface-hover text-fg"
					aria-hidden="true"><Icon name="instagram" size={22} /></span
				>
				<div
					class="flex min-w-0 max-w-[85%] flex-col gap-2 rounded-2xl bg-[linear-gradient(135deg,#7c5cff,#a64dff)] p-3.5 text-[14px] text-white"
				>
					<p class={['break-words whitespace-pre-wrap', !message.trim() && 'opacity-70']}>
						{message.trim() || t('reels.dialog.previewEmpty')}
					</p>
					{#if withButton}
						<span
							class="flex items-center justify-center gap-1.5 rounded-lg bg-white/20 px-3 py-2 text-[13.5px] font-semibold"
						>
							<Icon name="link" size={14} />
							{buttonLabel.trim() || t('reels.dialog.buttonLabel')}
						</span>
					{/if}
				</div>
			</div>
		</section>

		{#if formError}
			<Alert>{formError}</Alert>
		{/if}
	</div>

	<footer class="flex flex-wrap items-center gap-2.5 border-t border-border px-6 py-4">
		{#if initial}
			<Button variant="ghost" loading={deleting} disabled={busy} onclick={handleDelete}>
				<Icon name="trash" size={15} />{t('reels.dialog.delete')}
			</Button>
		{/if}
		<div class="ml-auto flex flex-wrap gap-2.5">
			<Button
				variant="secondary"
				loading={saving === 'draft'}
				disabled={busy}
				onclick={() => save(false)}
			>
				{isLive ? t('reels.auto.panel.pause') : t('reels.auto.panel.saveDraft')}
			</Button>
			<Button loading={saving === 'activate'} disabled={busy} onclick={() => save(true)}>
				{isLive ? t('reels.auto.panel.saveChanges') : t('reels.auto.panel.activate')}
			</Button>
		</div>
	</footer>
</aside>
