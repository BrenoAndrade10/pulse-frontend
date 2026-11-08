<script lang="ts">
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import SelectExpertState from '#lib/components/app/SelectExpertState.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import {
		createWhatsAppAutomation,
		deleteWhatsAppAutomation,
		setWhatsAppAutomationActive
	} from '#lib/services/whatsappAutomations.js';
	import type { WhatsAppAutomation } from '#lib/types.js';
	import { uniqueWhatsAppEventNames } from '#lib/utils/whatsappMessage.js';
	import type { AutomationsState } from './+page.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let automations = $state<WhatsAppAutomation[]>([]);
	let status = $state<'loading' | 'ready' | 'error'>('loading');
	let eventFilter = $state('all');
	let destinationFilter = $state('all');
	let actionError = $state<string>();
	let busyId = $state<string>();
	let removing = $state<WhatsAppAutomation | null>(null);
	let dialog = $state<HTMLDialogElement>();

	$effect(() => {
		const request = data.automations;
		status = 'loading';
		void request.then((result: AutomationsState) => {
			if (request !== data.automations) return;
			if (result.status === 'error') {
				status = 'error';
				return;
			}
			automations = result.automations;
			status = 'ready';
		});
	});

	const eventOptions = $derived([
		{ value: 'all', label: t('whatsapp.list.filters.allEvents') },
		...uniqueWhatsAppEventNames(automations.map((item) => item.eventName)).map((value) => ({
			value,
			label: value
		}))
	]);
	const destinationOptions = $derived([
		{ value: 'all', label: t('whatsapp.list.filters.allDestinations') },
		{ value: 'private', label: t('whatsapp.list.destination.private') },
		{ value: 'group', label: t('whatsapp.list.destination.group') }
	]);
	const visible = $derived(
		automations.filter(
			(item) =>
				(eventFilter === 'all' || item.eventName === eventFilter) &&
				(destinationFilter === 'all' || item.destination.type === destinationFilter)
		)
	);
	function messageSummary(automation: WhatsAppAutomation): string {
		return automation.message.body.replace(/\s+/g, ' ').trim();
	}

	async function toggle(automation: WhatsAppAutomation) {
		if (!data.expert) return;
		busyId = automation.id;
		actionError = undefined;
		const previous = automation.isActive;
		automation.isActive = !previous;
		try {
			await setWhatsAppAutomationActive(data.expert.id, automation.id, !previous);
		} catch {
			automation.isActive = previous;
			actionError = t('whatsapp.list.errors.toggle');
		} finally {
			busyId = undefined;
		}
	}

	async function duplicate(automation: WhatsAppAutomation) {
		if (!data.expert) return;
		busyId = automation.id;
		actionError = undefined;
		try {
			const copy = await createWhatsAppAutomation(data.expert.id, {
				name: t('whatsapp.list.copyName', { name: automation.name }).slice(0, 60),
				eventName: automation.eventName,
				launchId: automation.launchId,
				destination: automation.destination,
				delay: automation.delay,
				message: automation.message,
				isActive: false
			});
			automations = [copy, ...automations];
		} catch {
			actionError = t('whatsapp.list.errors.duplicate');
		} finally {
			busyId = undefined;
		}
	}

	function confirmDelete(automation: WhatsAppAutomation) {
		removing = automation;
		dialog?.showModal();
	}

	async function remove() {
		if (!data.expert || !removing) return;
		busyId = removing.id;
		try {
			await deleteWhatsAppAutomation(data.expert.id, removing.id);
			automations = automations.filter((item) => item.id !== removing?.id);
			dialog?.close();
			removing = null;
		} catch {
			dialog?.close();
			actionError = t('whatsapp.list.errors.delete');
		} finally {
			busyId = undefined;
		}
	}
</script>

<svelte:head><title>{t('whatsapp.list.pageTitle')} · {APP_NAME}</title></svelte:head>

<PageHeader
	title={t('whatsapp.list.title')}
	description={data.expert
		? t('whatsapp.list.descriptionExpert', { name: data.expert.name })
		: t('whatsapp.list.descriptionNoExpert')}
>
	{#snippet actions()}
		{#if data.expert}<a class={buttonClass()} href="/whatsapp/new"
				><Icon name="plus" size={16} />{t('whatsapp.list.create')}</a
			>{/if}
	{/snippet}
</PageHeader>

{#if !data.expert}
	<SelectExpertState
		hasExperts={data.experts.length > 0}
		subjectKey="whatsapp.selectExpert.subject"
		emptyDescriptionKey="whatsapp.selectExpert.emptyDescription"
	/>
{:else if status === 'loading'}
	<div class="flex flex-col gap-3" aria-hidden="true">
		{#each { length: 3 }, index (index)}<div
				class="h-32 rounded-lg border border-border bg-bg-elevated p-5"
			>
				<span class="block h-4 w-48 rounded bg-surface motion-safe:animate-pulse"></span><span
					class="mt-3 block h-3 w-3/5 rounded bg-surface motion-safe:animate-pulse"
				></span><span class="mt-5 block h-8 w-full rounded bg-surface motion-safe:animate-pulse"
				></span>
			</div>{/each}
	</div>
	<span class="sr-only" aria-live="polite">{t('whatsapp.list.loading')}</span>
{:else if status === 'error'}
	<Card
		><EmptyState
			icon="whatsapp"
			title={t('whatsapp.list.loadError.title')}
			description={t('whatsapp.list.loadError.description')}
		/></Card
	>
{:else if automations.length === 0}
	<Card
		><EmptyState
			icon="whatsapp"
			title={t('whatsapp.list.empty.title')}
			description={t('whatsapp.list.empty.description')}
			>{#snippet action()}<a class={buttonClass()} href="/whatsapp/new"
					><Icon name="plus" size={16} />{t('whatsapp.list.create')}</a
				>{/snippet}</EmptyState
		></Card
	>
{:else}
	<div class="mb-4 grid grid-cols-2 gap-3 max-[561px]:grid-cols-1">
		<Select
			id="whatsapp-event-filter"
			aria-label={t('whatsapp.list.filters.event')}
			options={eventOptions}
			bind:value={eventFilter}
		/>
		<Select
			id="whatsapp-destination-filter"
			aria-label={t('whatsapp.list.filters.destination')}
			options={destinationOptions}
			bind:value={destinationFilter}
		/>
	</div>
	{#if actionError}<div class="mb-4"><Alert>{actionError}</Alert></div>{/if}
	{#if visible.length === 0}
		<Card
			><EmptyState
				icon="search"
				title={t('whatsapp.list.filters.noResults.title')}
				description={t('whatsapp.list.filters.noResults.description')}
				>{#snippet action()}<Button
						variant="secondary"
						onclick={() => {
							eventFilter = 'all';
							destinationFilter = 'all';
						}}>{t('whatsapp.list.filters.clear')}</Button
					>{/snippet}</EmptyState
			></Card
		>
	{:else}
		<ul class="flex flex-col gap-3">
			{#each visible as automation (automation.id)}
				<li class="rounded-lg border border-border bg-bg-elevated p-5 max-[561px]:p-4">
					<div class="flex items-start gap-4 max-[621px]:flex-wrap">
						<span
							class="grid size-10 shrink-0 place-items-center rounded-md bg-[#25d366]/12 text-[#25d366]"
							aria-hidden="true"><Icon name="whatsapp" size={19} /></span
						>
						<div class="min-w-0 flex-1">
							<div class="flex flex-wrap items-center gap-2">
								<h2 class="font-bold">{automation.name}</h2>
								<Badge variant={automation.isActive ? 'success' : 'neutral'}
									>{automation.isActive
										? t('whatsapp.list.status.active')
										: t('whatsapp.list.status.paused')}</Badge
								>
							</div>
							<p class="mt-1 text-[13px] text-fg-muted">
								<strong class="text-fg">{automation.eventName}</strong> → {automation.destination
									.type === 'private'
									? t('whatsapp.list.destination.private')
									: t('whatsapp.list.destination.groupNamed', {
											name: automation.destination.groupName
										})}{#if automation.delay}
									· {t(
										automation.delay.unit === 'minutes'
											? 'whatsapp.list.delayMinutes'
											: 'whatsapp.list.delayHours',
										{ value: automation.delay.value }
									)}{/if}
							</p>
							<p class="mt-2 line-clamp-2 text-[13px] text-fg-subtle">
								{messageSummary(automation)}
							</p>
							<p class="mt-1.5 text-[12px] text-fg-subtle">
								{t(
									automation.message.buttons.length === 1
										? 'whatsapp.list.buttonsOne'
										: 'whatsapp.list.buttonsOther',
									{ count: automation.message.buttons.length }
								)}
							</p>
						</div>
						<button
							type="button"
							class={[
								'relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:shadow-focus',
								automation.isActive ? 'bg-success' : 'bg-surface-hover'
							]}
							role="switch"
							aria-checked={automation.isActive}
							aria-label={t(
								automation.isActive ? 'whatsapp.list.pause' : 'whatsapp.list.activate',
								{
									name: automation.name
								}
							)}
							disabled={busyId === automation.id}
							onclick={() => toggle(automation)}
							><span
								class={[
									'absolute top-1 left-1 size-5 rounded-full bg-white shadow transition-transform',
									automation.isActive && 'translate-x-5'
								]}
							></span></button
						>
					</div>
					<div class="mt-4 flex flex-wrap justify-end gap-1 border-t border-border pt-3">
						<a
							class={buttonClass({ variant: 'ghost', size: 'sm' })}
							href={`/whatsapp/${automation.id}`}
							><Icon name="pencil" size={14} />{t('whatsapp.list.edit')}</a
						><Button
							variant="ghost"
							size="sm"
							disabled={busyId === automation.id}
							onclick={() => duplicate(automation)}
							><Icon name="copy" size={14} />{t('whatsapp.list.duplicate')}</Button
						><Button
							variant="ghost"
							size="sm"
							disabled={busyId === automation.id}
							onclick={() => confirmDelete(automation)}
							><Icon name="trash" size={14} />{t('whatsapp.list.delete')}</Button
						>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
{/if}

<dialog
	bind:this={dialog}
	class="m-auto w-[min(440px,calc(100vw-32px))] rounded-lg border border-border-strong bg-bg-elevated p-0 text-fg shadow-2xl backdrop:bg-black/70"
	aria-labelledby="delete-automation-title"
	onclose={() => (removing = null)}
>
	<div class="p-5">
		<h2 id="delete-automation-title" class="text-[17px] font-bold">
			{t('whatsapp.list.deleteDialog.title')}
		</h2>
		<p class="mt-2 text-[13.5px] text-fg-muted">
			{t('whatsapp.list.deleteDialog.description', { name: removing?.name ?? '' })}
		</p>
		<div class="mt-5 flex justify-end gap-2">
			<Button variant="ghost" disabled={Boolean(busyId)} onclick={() => dialog?.close()}
				>{t('common.actions.cancel')}</Button
			><Button variant="danger" loading={Boolean(busyId)} onclick={remove}
				>{t('common.actions.delete')}</Button
			>
		</div>
	</div>
</dialog>
