<script lang="ts">
	import AutomationStatus from '#lib/components/reels/AutomationStatus.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import {
		deleteCommentAutomation,
		saveCommentAutomation
	} from '#lib/services/commentAutomations.js';
	import type { CommentAutomation, InstagramPost } from '#lib/types.js';
	import { automationStatus } from '#lib/utils/commentAutomation.js';
	import { formatDate, formatNumber } from '#lib/utils/format.js';
	import { coverUrl, MEDIA_KIND, mediaKind } from '#lib/utils/instagramMedia.js';

	type Row = { automation: CommentAutomation; post: InstagramPost | null };

	type Props = {
		expertId: string;
		rows: Row[];
		onedit: (mediaId: string) => void;
		onchanged: (automation: CommentAutomation) => void;
		ondeleted: (mediaId: string) => void;
	};

	let { expertId, rows, onedit, onchanged, ondeleted }: Props = $props();

	let busyId = $state<string | null>(null);
	let menuId = $state<string | null>(null);
	let error = $state<string>();
	let dialog = $state<HTMLDialogElement>();
	let removing = $state<Row | null>(null);
	let deleting = $state(false);

	const titleOf = (post: InstagramPost | null) =>
		post?.caption
			?.split('\n')
			.find((line) => line.trim())
			?.trim() ?? t('reels.card.noCaption');

	async function toggle(automation: CommentAutomation) {
		busyId = automation.mediaId;
		error = undefined;
		try {
			onchanged(
				await saveCommentAutomation(expertId, automation.mediaId, {
					keywords: automation.keywords,
					message: automation.message,
					button: automation.button,
					commentReply: automation.commentReply,
					isActive: !automation.isActive
				})
			);
		} catch {
			error = t('reels.dialog.saveFailed');
		} finally {
			busyId = null;
		}
	}

	function confirmDelete(row: Row) {
		menuId = null;
		removing = row;
		dialog?.showModal();
	}

	async function handleDelete() {
		if (!removing) return;
		deleting = true;
		try {
			await deleteCommentAutomation(expertId, removing.automation.mediaId);
			ondeleted(removing.automation.mediaId);
		} catch {
			error = t('reels.dialog.deleteFailed');
		} finally {
			deleting = false;
			dialog?.close();
		}
	}

	const head = 'px-5 py-3.5 text-left text-[13px] font-semibold text-fg-muted';
</script>

<svelte:window
	onclick={() => (menuId = null)}
	onkeydown={(event) => event.key === 'Escape' && (menuId = null)}
/>

{#if error}
	<div class="mb-4"><Alert>{error}</Alert></div>
{/if}

<Card flush>
	<div class="overflow-x-auto">
		<table class="w-full border-collapse text-[14px]">
			<thead>
				<tr class="border-b border-border">
					<th class="{head} pl-6">{t('reels.auto.table.automation')}</th>
					<th class={head}>{t('reels.auto.table.keyword')}</th>
					<th class={head}>{t('reels.auto.table.status')}</th>
					<th class={head}>{t('reels.auto.table.actions')}</th>
				</tr>
			</thead>
			<tbody>
				{#each rows as row (row.automation.mediaId)}
					{@const automation = row.automation}
					{@const status = automationStatus(automation)}
					{@const cover = row.post ? coverUrl(row.post) : null}
					{@const kind = row.post ? MEDIA_KIND[mediaKind(row.post)] : null}
					<tr class="border-b border-border last:border-b-0 hover:bg-white/2">
						<td class="py-3.5 pr-5 pl-6">
							<div class="flex items-center gap-4">
								<span
									class="grid h-16 w-20 shrink-0 place-items-center overflow-hidden rounded-md bg-surface text-fg-subtle"
									aria-hidden="true"
								>
									{#if cover}<img
											class="size-full object-cover"
											src={cover}
											alt=""
											loading="lazy"
										/>
									{:else}<Icon name="video" size={20} />{/if}
								</span>
								<div class="min-w-0">
									<p class="line-clamp-1 max-w-72 text-[16px] font-bold">{titleOf(row.post)}</p>
									<p class="mt-1 flex items-center gap-1.5 text-[13px] text-fg-muted">
										{#if kind}<Icon name={kind.icon} size={14} />{t(kind.labelKey)} ·{/if}
										{#if row.post?.timestamp}{formatDate(row.post.timestamp)}{/if}
										{#if automation.sentCount > 0}
											· {formatNumber(automation.sentCount)}
										{/if}
									</p>
								</div>
							</div>
						</td>
						<td class="px-5 py-3.5">
							<div class="flex flex-wrap gap-1.5">
								{#each automation.keywords.slice(0, 2) as keyword (keyword)}
									<span
										class="rounded-md border border-border-strong px-3 py-1.5 text-[13px] font-bold tracking-[0.03em] uppercase"
										>{keyword}</span
									>
								{/each}
								{#if automation.keywords.length > 2}
									<span class="self-center text-[13px] text-fg-subtle"
										>+{automation.keywords.length - 2}</span
									>
								{/if}
							</div>
						</td>
						<td class="px-5 py-3.5"><AutomationStatus {status} /></td>
						<td class="py-3.5 pr-6 pl-5">
							<div class="flex items-center gap-2">
								{#if status === 'draft'}
									<Button variant="secondary" size="sm" onclick={() => onedit(automation.mediaId)}>
										<Icon name="pencil" size={15} />{t('reels.auto.actions.continue')}
									</Button>
								{:else}
									<Button
										variant="secondary"
										size="sm"
										loading={busyId === automation.mediaId}
										disabled={busyId !== null}
										onclick={() => toggle(automation)}
									>
										<Icon name={automation.isActive ? 'pause' : 'play'} size={15} />
										{automation.isActive
											? t('reels.auto.actions.pause')
											: t('reels.auto.actions.resume')}
									</Button>
								{/if}
								<div class="relative">
									<button
										type="button"
										class="grid size-9 cursor-pointer place-items-center rounded-md border border-border text-fg-muted hover:bg-surface hover:text-fg focus-visible:shadow-focus"
										aria-haspopup="menu"
										aria-expanded={menuId === automation.mediaId}
										aria-label={t('reels.auto.actions.more')}
										onclick={(event) => {
											event.stopPropagation();
											menuId = menuId === automation.mediaId ? null : automation.mediaId;
										}}
									>
										<Icon name="ellipsis" size={18} />
									</button>
									{#if menuId === automation.mediaId}
										<div
											class="absolute top-full right-0 z-10 mt-1.5 grid min-w-40 gap-0.5 rounded-md border border-border-strong bg-bg-elevated p-1.5 shadow-[0_18px_40px_-16px_rgb(0_0_0/0.8)]"
											role="menu"
										>
											<button
												type="button"
												role="menuitem"
												class="flex h-9 cursor-pointer items-center gap-2.5 rounded-sm px-3 text-left text-[13.5px] font-semibold hover:bg-surface"
												onclick={() => {
													menuId = null;
													onedit(automation.mediaId);
												}}
											>
												<Icon name="pencil" size={15} />{t('reels.auto.actions.edit')}
											</button>
											<button
												type="button"
												role="menuitem"
												class="flex h-9 cursor-pointer items-center gap-2.5 rounded-sm px-3 text-left text-[13.5px] font-semibold text-danger hover:bg-surface"
												onclick={() => confirmDelete(row)}
											>
												<Icon name="trash" size={15} />{t('reels.auto.actions.delete')}
											</button>
										</div>
									{/if}
								</div>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<p class="border-t border-border px-6 py-4 text-[13.5px] text-fg-muted">
		{t('reels.auto.table.count', { count: rows.length, formatted: formatNumber(rows.length) })}
	</p>
</Card>

<dialog
	class={[
		'm-auto w-[min(440px,calc(100vw-32px))] p-6',
		'rounded-lg border border-border-strong bg-bg-elevated text-fg',
		'shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]',
		'backdrop:bg-[rgb(5_5_10/0.7)] backdrop:backdrop-blur-[3px]'
	]}
	bind:this={dialog}
	aria-labelledby="delete-automation-title"
>
	<h2 class="text-[18px] font-bold" id="delete-automation-title">
		{t('reels.auto.deleteConfirm.title')}
	</h2>
	<p class="mt-2 mb-6 text-fg-muted">{t('reels.auto.deleteConfirm.description')}</p>
	<div class="flex justify-end gap-2.5">
		<Button variant="ghost" disabled={deleting} onclick={() => dialog?.close()}
			>{t('common.actions.cancel')}</Button
		>
		<Button variant="danger" loading={deleting} onclick={handleDelete}
			>{t('common.actions.delete')}</Button
		>
	</div>
</dialog>
