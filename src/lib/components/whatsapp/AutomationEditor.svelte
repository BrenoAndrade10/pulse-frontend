<script lang="ts">
	import { untrack } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import MessagePreview from '#lib/components/whatsapp/MessagePreview.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import {
		createWhatsAppAutomation,
		updateWhatsAppAutomation
	} from '#lib/services/whatsappAutomations.js';
	import type {
		Expert,
		Launch,
		TrackingPixel,
		WhatsAppAutomation,
		WhatsAppAutomationInput,
		WhatsAppButton,
		WhatsAppMessage
	} from '#lib/types.js';
	import {
		isValidHttpsUrl,
		unknownWhatsAppVariables,
		WHATSAPP_BODY_LIMIT,
		WHATSAPP_BUTTON_LABEL_LIMIT,
		WHATSAPP_BUTTON_REPLY_LIMIT,
		WHATSAPP_FOOTER_LIMIT,
		WHATSAPP_HEADER_LIMIT,
		WHATSAPP_MAX_QUICK_REPLIES,
		WHATSAPP_NAME_LIMIT,
		WHATSAPP_VARIABLES
	} from '#lib/utils/whatsappMessage.js';

	type Props = {
		expert: Expert;
		launches: Launch[];
		pixel: TrackingPixel | null;
		automation: WhatsAppAutomation | null;
	};

	let { expert, launches, pixel, automation }: Props = $props();

	const defaults: WhatsAppAutomationInput = {
		name: '',
		eventName: 'Lead',
		launchId: null,
		destination: { type: 'private' },
		delay: null,
		message: { header: '', body: '', footer: '', buttons: [] },
		isActive: false
	};
	const initial = untrack((): WhatsAppAutomationInput =>
		automation
			? structuredClone({
					name: automation.name,
					eventName: automation.eventName,
					launchId: automation.launchId,
					destination: automation.destination,
					delay: automation.delay,
					message: automation.message,
					isActive: automation.isActive
				})
			: structuredClone(defaults)
	);
	const legacyGroup = initial.destination.type === 'group';
	const comparableInitial = { ...initial, isActive: false };

	let name = $state(initial.name);
	let eventName = $state(initial.eventName);
	let launchId = $state(initial.launchId ?? '');
	let delayMode = $state<'now' | 'later'>(initial.delay ? 'later' : 'now');
	let delayValue = $state(String(initial.delay?.value ?? 5));
	let delayUnit = $state<'minutes' | 'hours'>(initial.delay?.unit ?? 'minutes');
	let header = $state(initial.message.header);
	let body = $state(initial.message.body);
	let footer = $state(initial.message.footer);
	let buttons = $state<WhatsAppButton[]>(structuredClone(initial.message.buttons));
	let buttonMode = $state<'none' | 'quick_reply' | 'url'>(
		initial.message.buttons[0]?.type ?? 'none'
	);
	let submitted = $state(false);
	let touched = $state<Record<string, boolean>>({});
	let saving = $state(false);
	let saveError = $state<string>();
	let bodyField = $state<HTMLTextAreaElement>();
	let allowNavigation = false;

	const eventOptions = $derived(
		['Lead', 'Cadastro', 'Compra', 'Clique no WhatsApp'].map((value) => ({
			value,
			label: value
		}))
	);
	const launchOptions = $derived([
		{ value: '', label: t('whatsapp.editor.trigger.anyLaunch') },
		...launches.map((launch) => ({ value: launch.id, label: launch.name }))
	]);
	const unknownVariables = $derived(unknownWhatsAppVariables(`${header}\n${body}\n${footer}`));
	const message = $derived<WhatsAppMessage>({ header, body, footer, buttons });
	const input = $derived<WhatsAppAutomationInput>({
		name: name.trim(),
		eventName,
		launchId: launchId || null,
		destination: initial.destination,
		delay: delayMode === 'later' ? { value: Number(delayValue), unit: delayUnit } : null,
		message,
		isActive: false
	});
	const dirty = $derived(
		!legacyGroup && JSON.stringify(input) !== JSON.stringify(comparableInitial)
	);

	const show = (field: string) => submitted || touched[field];
	const nameError = $derived(
		show('name') && !name.trim()
			? t('whatsapp.editor.errors.nameRequired')
			: name.length > WHATSAPP_NAME_LIMIT
				? t('whatsapp.editor.errors.maxChars', { limit: WHATSAPP_NAME_LIMIT })
				: undefined
	);
	const bodyError = $derived(
		show('body') && !body.trim()
			? t('whatsapp.editor.errors.bodyRequired')
			: body.length > WHATSAPP_BODY_LIMIT
				? t('whatsapp.editor.errors.maxChars', { limit: WHATSAPP_BODY_LIMIT })
				: undefined
	);
	const delayError = $derived(
		show('delay') &&
			delayMode === 'later' &&
			(!Number.isInteger(Number(delayValue)) || Number(delayValue) < 1)
			? t('whatsapp.editor.errors.delayInvalid')
			: undefined
	);
	const buttonsError = $derived.by(() => {
		if (!submitted && !touched.buttons) return undefined;
		for (const button of buttons) {
			if (!button.label.trim()) return t('whatsapp.editor.errors.buttonLabel');
			if (button.type === 'quick_reply' && !button.reply.trim()) {
				return t('whatsapp.editor.errors.buttonReply');
			}
			if (button.type === 'url' && !isValidHttpsUrl(button.url.trim())) {
				return t('whatsapp.editor.errors.buttonUrl');
			}
		}
		return undefined;
	});
	const valid = $derived(
		!legacyGroup &&
			!nameError &&
			!bodyError &&
			!delayError &&
			!buttonsError &&
			unknownVariables.length === 0 &&
			name.trim() &&
			body.trim()
	);

	beforeNavigate((navigation) => {
		if (!allowNavigation && dirty && !window.confirm(t('whatsapp.editor.confirmLeave'))) {
			navigation.cancel();
		}
	});

	function mark(field: string) {
		touched = { ...touched, [field]: true };
	}

	function changeButtonMode(mode: 'none' | 'quick_reply' | 'url') {
		buttonMode = mode;
		if (mode === 'none') buttons = [];
		else if (mode === 'url') {
			buttons = [{ id: crypto.randomUUID(), type: 'url', label: '', url: 'https://' }];
		} else if (!buttons.some((button) => button.type === 'quick_reply')) {
			buttons = [{ id: crypto.randomUUID(), type: 'quick_reply', label: '', reply: '' }];
		}
	}

	function addQuickReply() {
		if (buttons.length >= WHATSAPP_MAX_QUICK_REPLIES) return;
		buttons = [...buttons, { id: crypto.randomUUID(), type: 'quick_reply', label: '', reply: '' }];
	}

	function updateButton(index: number, patch: Partial<WhatsAppButton>) {
		buttons = buttons.map((button, itemIndex) =>
			itemIndex === index ? ({ ...button, ...patch } as WhatsAppButton) : button
		);
	}

	function removeButton(index: number) {
		buttons = buttons.filter((_, itemIndex) => itemIndex !== index);
		if (buttons.length === 0) buttonMode = 'none';
	}

	function moveButton(index: number, direction: -1 | 1) {
		const target = index + direction;
		if (target < 0 || target >= buttons.length) return;
		const next = [...buttons];
		[next[index], next[target]] = [next[target], next[index]];
		buttons = next;
	}

	async function insertText(value: string, suffix = '') {
		const field = bodyField;
		if (!field) return;
		const start = field.selectionStart;
		const end = field.selectionEnd;
		const selected = body.slice(start, end);
		body = `${body.slice(0, start)}${value}${selected}${suffix}${body.slice(end)}`;
		await Promise.resolve();
		field.focus();
		const cursor = start + value.length + selected.length + suffix.length;
		field.setSelectionRange(
			selected ? cursor : start + value.length,
			selected ? cursor : start + value.length
		);
	}

	async function saveDraft(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		saveError = undefined;
		if (!valid) return;
		saving = true;
		try {
			if (automation) await updateWhatsAppAutomation(expert.id, automation.id, input);
			else await createWhatsAppAutomation(expert.id, input);
			allowNavigation = true;
			await goto('/whatsapp');
		} catch {
			saveError = t('whatsapp.editor.errors.save');
		} finally {
			saving = false;
		}
	}

	function cancel() {
		if (!dirty || window.confirm(t('whatsapp.editor.confirmDiscard'))) {
			allowNavigation = true;
			void goto('/whatsapp');
		}
	}
</script>

<svelte:head>
	<title
		>{automation ? t('whatsapp.editor.titleEdit') : t('whatsapp.editor.titleNew')} · {APP_NAME}</title
	>
</svelte:head>

<PageHeader
	title={automation ? t('whatsapp.editor.titleEdit') : t('whatsapp.editor.titleNew')}
	description={t('whatsapp.editor.description')}
/>

<form class="pb-32" novalidate onsubmit={saveDraft}>
	<fieldset class="mb-5" aria-describedby="destination-help">
		<legend class="mb-3 text-[14px] font-bold text-fg"
			>{t('whatsapp.editor.destination.legend')}</legend
		>
		<div class="grid grid-cols-2 gap-3 max-[620px]:grid-cols-1" role="radiogroup">
			<button
				type="button"
				role="radio"
				aria-checked={!legacyGroup}
				aria-disabled={legacyGroup}
				disabled={legacyGroup}
				class={[
					'flex min-h-28 items-start gap-3 rounded-lg border p-4 text-left outline-none transition focus-visible:shadow-focus max-[360px]:p-3.5',
					!legacyGroup ? 'border-primary bg-primary/8' : 'border-border bg-bg-elevated opacity-60'
				]}
			>
				<span
					class="grid size-10 shrink-0 place-items-center rounded-md bg-primary/12 text-primary-hover"
				>
					<Icon name="message-circle" size={20} />
				</span>
				<span class="min-w-0">
					<strong class="block text-[14px] text-fg"
						>{t('whatsapp.editor.destination.privateTitle')}</strong
					>
					<span class="mt-1 block text-[12.5px] leading-relaxed text-fg-muted"
						>{t('whatsapp.editor.destination.privateDescription')}</span
					>
				</span>
			</button>
			<button
				type="button"
				role="radio"
				aria-checked={legacyGroup}
				aria-disabled="true"
				disabled
				class={[
					'flex min-h-28 items-start gap-3 rounded-lg border p-4 text-left outline-none max-[360px]:p-3.5',
					legacyGroup ? 'border-primary bg-primary/8' : 'border-border bg-bg-elevated opacity-70'
				]}
			>
				<span
					class="grid size-10 shrink-0 place-items-center rounded-md bg-primary/12 text-primary-hover"
				>
					<Icon name="users" size={20} />
				</span>
				<span class="min-w-0 flex-1">
					<span class="flex flex-wrap items-center gap-2">
						<strong class="text-[14px] text-fg"
							>{t('whatsapp.editor.destination.groupTitle')}</strong
						>
						<Badge>{t('whatsapp.editor.destination.soon')}</Badge>
					</span>
					<span class="mt-1 block text-[12.5px] leading-relaxed text-fg-muted"
						>{t('whatsapp.editor.destination.groupDescription')}</span
					>
				</span>
			</button>
		</div>
		<p id="destination-help" class="mt-2 text-[12.5px] text-fg-subtle">
			{t('whatsapp.editor.destination.help')}
		</p>
	</fieldset>

	{#if legacyGroup}
		<div
			class="grid grid-cols-[minmax(0,1fr)_minmax(300px,400px)] items-start gap-5 max-[900px]:grid-cols-1"
		>
			<Card
				title={t('whatsapp.editor.legacy.title')}
				description={t('whatsapp.editor.legacy.description')}
			>
				<div class="flex flex-col gap-4">
					<Alert variant="warning">
						{t('whatsapp.editor.legacy.alert')}
					</Alert>
					<dl class="grid grid-cols-2 gap-4 text-[13.5px] max-[520px]:grid-cols-1">
						<div>
							<dt class="text-fg-subtle">{t('whatsapp.editor.legacy.name')}</dt>
							<dd class="mt-1 font-semibold">{initial.name}</dd>
						</div>
						<div>
							<dt class="text-fg-subtle">{t('whatsapp.editor.legacy.group')}</dt>
							<dd class="mt-1 font-semibold">
								{initial.destination.type === 'group' ? initial.destination.groupName : ''}
							</dd>
						</div>
						<div>
							<dt class="text-fg-subtle">{t('whatsapp.editor.legacy.event')}</dt>
							<dd class="mt-1 font-semibold">{initial.eventName}</dd>
						</div>
						<div>
							<dt class="text-fg-subtle">{t('whatsapp.editor.legacy.state')}</dt>
							<dd class="mt-1 font-semibold">
								{initial.isActive
									? t('whatsapp.editor.legacy.active')
									: t('whatsapp.editor.legacy.draft')}
							</dd>
						</div>
					</dl>
				</div>
			</Card>
			<div class="min-[901px]:sticky min-[901px]:top-5">
				<p class="mb-2 text-[12px] font-bold tracking-[0.06em] text-fg-subtle uppercase">
					{t('whatsapp.editor.preview')}
				</p>
				<MessagePreview {message} />
			</div>
		</div>
	{:else}
		<div
			class="grid grid-cols-[minmax(0,1fr)_minmax(300px,400px)] items-start gap-5 max-[900px]:grid-cols-1"
		>
			<div class="flex min-w-0 flex-col gap-5">
				<Card
					title={t('whatsapp.editor.general.title')}
					description={t('whatsapp.editor.general.description')}
				>
					<TextField
						id="automation-name"
						label={t('whatsapp.editor.general.name')}
						maxlength={WHATSAPP_NAME_LIMIT}
						bind:value={name}
						error={nameError}
						onblur={() => mark('name')}
						placeholder={t('whatsapp.editor.general.namePlaceholder')}
					/>
				</Card>

				<Card
					title={t('whatsapp.editor.trigger.title')}
					description={t('whatsapp.editor.trigger.description')}
				>
					<div class="grid grid-cols-2 gap-3 max-[560px]:grid-cols-1">
						<Select
							id="automation-event"
							label={t('whatsapp.editor.trigger.event')}
							options={eventOptions}
							bind:value={eventName}
						/>
						<Select
							id="automation-launch"
							label={t('whatsapp.editor.trigger.launch')}
							options={launchOptions}
							bind:value={launchId}
						/>
					</div>
					{#if !pixel}
						<p class="mt-3 text-[12.5px] text-fg-subtle">
							{t('whatsapp.editor.trigger.pixelHint')}
						</p>
					{/if}
				</Card>

				<Card
					title={t('whatsapp.editor.recipients.title')}
					description={t('whatsapp.editor.recipients.description')}
				>
					<div class="rounded-md border border-border bg-surface p-4">
						<div class="flex items-start gap-3">
							<span
								class="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-primary-hover"
								><Icon name="user-plus" size={17} /></span
							>
							<div>
								<strong class="text-[13.5px]">{t('whatsapp.editor.recipients.lead')}</strong>
								<p class="mt-1 text-[12.5px] leading-relaxed text-fg-muted">
									{t('whatsapp.editor.recipients.leadDescription')}
								</p>
							</div>
						</div>
					</div>
					<div class="mt-3">
						<Alert variant="warning">{t('whatsapp.editor.recipients.warning')}</Alert>
					</div>
				</Card>

				<Card
					title={t('whatsapp.editor.timing.title')}
					description={t('whatsapp.editor.timing.description')}
				>
					<div class="flex flex-col gap-4">
						<fieldset>
							<legend class="sr-only">{t('whatsapp.editor.timing.legend')}</legend>
							<div class="grid grid-cols-2 gap-3 max-[480px]:grid-cols-1">
								<label
									class={[
										'flex cursor-pointer items-center gap-3 rounded-md border p-3.5 text-[13.5px] outline-none focus-within:shadow-focus',
										delayMode === 'now' ? 'border-primary bg-primary/8' : 'border-border bg-surface'
									]}
									><input
										type="radio"
										name="delay"
										checked={delayMode === 'now'}
										onchange={() => (delayMode = 'now')}
									/><span
										><strong class="block text-fg">{t('whatsapp.editor.timing.now')}</strong><span
											class="text-[12.5px] text-fg-muted"
											>{t('whatsapp.editor.timing.nowDescription')}</span
										></span
									></label
								>
								<label
									class={[
										'flex cursor-pointer items-center gap-3 rounded-md border p-3.5 text-[13.5px] outline-none focus-within:shadow-focus',
										delayMode === 'later'
											? 'border-primary bg-primary/8'
											: 'border-border bg-surface'
									]}
									><input
										type="radio"
										name="delay"
										checked={delayMode === 'later'}
										onchange={() => (delayMode = 'later')}
									/><span
										><strong class="block text-fg">{t('whatsapp.editor.timing.later')}</strong><span
											class="text-[12.5px] text-fg-muted"
											>{t('whatsapp.editor.timing.laterDescription')}</span
										></span
									></label
								>
							</div>
						</fieldset>
						{#if delayMode === 'later'}
							<div class="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
								<TextField
									id="automation-delay"
									label={t('whatsapp.editor.timing.time')}
									type="number"
									min="1"
									step="1"
									bind:value={delayValue}
									error={delayError}
									onblur={() => mark('delay')}
								/>
								<Select
									id="automation-delay-unit"
									label={t('whatsapp.editor.timing.unit')}
									options={[
										{ value: 'minutes', label: t('whatsapp.editor.timing.minutes') },
										{ value: 'hours', label: t('whatsapp.editor.timing.hours') }
									]}
									bind:value={delayUnit}
								/>
							</div>
						{/if}
					</div>
				</Card>

				<Card
					title={t('whatsapp.editor.message.title')}
					description={t('whatsapp.editor.message.description')}
				>
					<div class="flex flex-col gap-4">
						<TextField
							id="automation-header"
							label={t('whatsapp.editor.message.header')}
							maxlength={WHATSAPP_HEADER_LIMIT}
							bind:value={header}
							hint={`${header.length}/${WHATSAPP_HEADER_LIMIT}`}
						/>
						<div class="flex flex-col gap-1.5">
							<div class="flex items-end justify-between gap-3">
								<label class="text-[13px] font-semibold text-fg-muted" for="automation-body"
									>{t('whatsapp.editor.message.body')}</label
								><span
									class={[
										'text-[12px] tabular-nums',
										body.length > WHATSAPP_BODY_LIMIT ? 'text-danger' : 'text-fg-subtle'
									]}>{body.length}/{WHATSAPP_BODY_LIMIT}</span
								>
							</div>
							<div
								class="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-border bg-surface px-2 py-1.5"
								aria-label={t('whatsapp.editor.message.formatting')}
							>
								<button
									type="button"
									class="size-8 rounded-sm font-bold outline-none hover:bg-surface-hover focus-visible:shadow-focus"
									aria-label={t('whatsapp.editor.message.bold')}
									title={t('whatsapp.editor.message.bold')}
									onclick={() => insertText('*', '*')}>B</button
								>
								<button
									type="button"
									class="size-8 rounded-sm italic outline-none hover:bg-surface-hover focus-visible:shadow-focus"
									aria-label={t('whatsapp.editor.message.italic')}
									title={t('whatsapp.editor.message.italic')}
									onclick={() => insertText('_', '_')}>I</button
								>
								<button
									type="button"
									class="size-8 rounded-sm line-through outline-none hover:bg-surface-hover focus-visible:shadow-focus"
									aria-label={t('whatsapp.editor.message.strike')}
									title={t('whatsapp.editor.message.strike')}
									onclick={() => insertText('~', '~')}>S</button
								>
								<button
									type="button"
									class="h-8 rounded-sm px-2 font-mono outline-none hover:bg-surface-hover focus-visible:shadow-focus"
									aria-label={t('whatsapp.editor.message.mono')}
									title={t('whatsapp.editor.message.mono')}
									onclick={() => insertText('```', '```')}>&lt;/&gt;</button
								>
							</div>
							<textarea
								bind:this={bodyField}
								id="automation-body"
								class={[
									'min-h-40 resize-y rounded-b-md border bg-surface px-3.5 py-3 text-fg outline-none placeholder:text-fg-subtle focus:bg-surface-hover focus:shadow-focus',
									bodyError ? 'border-danger' : 'border-border focus:border-primary'
								]}
								maxlength={WHATSAPP_BODY_LIMIT}
								bind:value={body}
								onblur={() => mark('body')}
								aria-invalid={bodyError ? 'true' : undefined}
								placeholder={t('whatsapp.editor.message.placeholder')}></textarea>
							{#if bodyError}<p class="text-[12.5px] text-danger" role="alert">{bodyError}</p>{/if}
						</div>
						<div>
							<p class="mb-2 text-[12.5px] text-fg-subtle">
								{t('whatsapp.editor.message.insertVariable')}
							</p>
							<div class="flex flex-wrap gap-1.5">
								{#each WHATSAPP_VARIABLES as variable (variable)}<button
										type="button"
										class="rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-primary-hover outline-none hover:border-primary focus-visible:shadow-focus"
										onclick={() => insertText(`{{${variable}}}`)}>{`{{${variable}}}`}</button
									>{/each}
							</div>
						</div>
						{#if unknownVariables.length > 0}<Alert variant="warning"
								>{t('whatsapp.editor.message.unknownVariable', {
									variables: unknownVariables.map((value) => `{{${value}}}`).join(', ')
								})}</Alert
							>{/if}
						<TextField
							id="automation-footer"
							label={t('whatsapp.editor.message.footer')}
							maxlength={WHATSAPP_FOOTER_LIMIT}
							bind:value={footer}
							hint={`${footer.length}/${WHATSAPP_FOOTER_LIMIT}`}
						/>
					</div>
				</Card>

				<Card
					title={t('whatsapp.editor.buttons.title')}
					description={t('whatsapp.editor.buttons.description')}
				>
					<div class="flex flex-col gap-4">
						<Select
							id="automation-button-type"
							label={t('whatsapp.editor.buttons.type')}
							value={buttonMode}
							options={[
								{ value: 'none', label: t('whatsapp.editor.buttons.none') },
								{ value: 'quick_reply', label: t('whatsapp.editor.buttons.quickReply') },
								{ value: 'url', label: t('whatsapp.editor.buttons.link') }
							]}
							onchange={(event) =>
								changeButtonMode(event.currentTarget.value as 'none' | 'quick_reply' | 'url')}
						/>
						{#each buttons as button, index (button.id)}
							<div class="rounded-md border border-border bg-surface p-3.5 max-[360px]:p-3">
								<div class="mb-3 flex items-center justify-between gap-2">
									<strong class="text-[13px]"
										>{t('whatsapp.editor.buttons.button', { number: index + 1 })}</strong
									>
									<div class="flex">
										<button
											type="button"
											class="grid size-8 place-items-center rounded-sm text-fg-muted outline-none hover:bg-surface-hover focus-visible:shadow-focus disabled:opacity-35"
											disabled={index === 0}
											aria-label={t('whatsapp.editor.buttons.moveUp')}
											onclick={() => moveButton(index, -1)}>↑</button
										><button
											type="button"
											class="grid size-8 place-items-center rounded-sm text-fg-muted outline-none hover:bg-surface-hover focus-visible:shadow-focus disabled:opacity-35"
											disabled={index === buttons.length - 1}
											aria-label={t('whatsapp.editor.buttons.moveDown')}
											onclick={() => moveButton(index, 1)}>↓</button
										><button
											type="button"
											class="grid size-8 place-items-center rounded-sm text-danger outline-none hover:bg-danger/10 focus-visible:shadow-focus"
											aria-label={t('whatsapp.editor.buttons.remove')}
											onclick={() => removeButton(index)}><Icon name="trash" size={15} /></button
										>
									</div>
								</div>
								<div class="flex flex-col gap-3">
									<TextField
										id={`button-label-${button.id}`}
										label={t('whatsapp.editor.buttons.label')}
										maxlength={WHATSAPP_BUTTON_LABEL_LIMIT}
										value={button.label}
										oninput={(event) => updateButton(index, { label: event.currentTarget.value })}
										hint={`${button.label.length}/${WHATSAPP_BUTTON_LABEL_LIMIT}`}
									/>{#if button.type === 'quick_reply'}<div class="flex flex-col gap-1.5">
											<div class="flex justify-between gap-2">
												<label
													class="text-[13px] font-semibold text-fg-muted"
													for={`button-reply-${button.id}`}
													>{t('whatsapp.editor.buttons.reply')}</label
												><span class="text-[12px] text-fg-subtle"
													>{button.reply.length}/{WHATSAPP_BUTTON_REPLY_LIMIT}</span
												>
											</div>
											<textarea
												id={`button-reply-${button.id}`}
												class="min-h-24 resize-y rounded-md border border-border bg-bg-elevated px-3.5 py-3 text-fg outline-none focus:border-primary focus:shadow-focus"
												maxlength={WHATSAPP_BUTTON_REPLY_LIMIT}
												value={button.reply}
												oninput={(event) =>
													updateButton(index, { reply: event.currentTarget.value })}
												onblur={() => mark('buttons')}></textarea>
										</div>{:else}<TextField
											id={`button-url-${button.id}`}
											label={t('whatsapp.editor.buttons.url')}
											type="url"
											value={button.url}
											oninput={(event) => updateButton(index, { url: event.currentTarget.value })}
											onblur={() => mark('buttons')}
										/>{/if}
								</div>
							</div>
						{/each}
						{#if buttonMode === 'quick_reply' && buttons.length < WHATSAPP_MAX_QUICK_REPLIES}<Button
								variant="secondary"
								size="sm"
								onclick={addQuickReply}
								><Icon name="plus" size={14} />{t('whatsapp.editor.buttons.addQuickReply')}</Button
							>{/if}
						{#if buttonsError}<p class="text-[12.5px] text-danger" role="alert">
								{buttonsError}
							</p>{/if}
					</div>
				</Card>
				{#if saveError}<Alert>{saveError}</Alert>{/if}
			</div>

			<div class="min-[901px]:sticky min-[901px]:top-5">
				<p class="mb-2 text-[12px] font-bold tracking-[0.06em] text-fg-subtle uppercase">
					{t('whatsapp.editor.previewLive')}
				</p>
				<MessagePreview {message} />
			</div>
		</div>
	{/if}

	<div
		class="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-bg/95 px-4 py-3 shadow-[0_-10px_30px_rgb(0_0_0/0.18)] backdrop-blur max-[360px]:px-3"
	>
		<div
			class="mx-auto flex max-w-[1440px] items-center justify-between gap-4 max-[700px]:items-end"
		>
			<Button variant="ghost" disabled={saving} onclick={cancel}
				>{t('common.actions.cancel')}</Button
			>
			<div class="flex items-end gap-2 max-[700px]:flex-col">
				<p
					class="max-w-80 text-right text-[11.5px] leading-snug text-fg-subtle max-[700px]:max-w-56"
				>
					{t('whatsapp.editor.footer.help')}
				</p>
				<div class="flex gap-2 max-[420px]:flex-col-reverse">
					<Button type="submit" loading={saving} disabled={legacyGroup}
						>{t('whatsapp.editor.footer.saveDraft')}</Button
					>
					<span title={t('whatsapp.editor.footer.help')}>
						<Button disabled aria-describedby="activation-help"
							>{t('whatsapp.editor.footer.activate')}</Button
						>
					</span>
				</div>
			</div>
		</div>
		<span id="activation-help" class="sr-only">{t('whatsapp.editor.footer.help')}</span>
	</div>
</form>
