<script lang="ts">
	import { untrack } from 'svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { APP_NAME } from '#lib/config.js';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import MessagePreview from '#lib/components/whatsapp/MessagePreview.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import {
		createWhatsAppAutomation,
		loadWhatsAppGroups,
		type WhatsAppGroupsState,
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
		groupsState: WhatsAppGroupsState;
		automation: WhatsAppAutomation | null;
	};

	let { expert, launches, pixel, groupsState, automation }: Props = $props();

	const defaults: WhatsAppAutomationInput = {
		name: '',
		eventName: 'Lead',
		launchId: null,
		destination: { type: 'private' },
		delay: null,
		message: { header: '', body: '', footer: '', buttons: [] },
		isActive: true
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

	let name = $state(initial.name);
	let eventName = $state(initial.eventName);
	let launchId = $state(initial.launchId ?? '');
	let destinationType = $state<'private' | 'group'>(initial.destination.type);
	let groupId = $state(initial.destination.type === 'group' ? initial.destination.groupId : '');
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
	let isActive = $state(initial.isActive);
	let submitted = $state(false);
	let touched = $state<Record<string, boolean>>({});
	let saving = $state(false);
	let saveError = $state<string>();
	let groupNotice = $state(false);
	let bodyField = $state<HTMLTextAreaElement>();
	let allowNavigation = false;
	let currentGroupsState = $state<WhatsAppGroupsState>(untrack(() => groupsState));
	let loadingGroups = $state(false);
	const groups = $derived(currentGroupsState.groups);

	const eventOptions = $derived([
		...['Lead', 'Cadastro', 'Compra', 'Clique no WhatsApp'].map((value) => ({
			value,
			label: value
		}))
	]);
	const launchOptions = $derived([
		{ value: '', label: 'Qualquer lançamento' },
		...launches.map((launch) => ({ value: launch.id, label: launch.name }))
	]);
	const groupOptions = $derived([
		{ value: '', label: 'Selecione um grupo' },
		...groups.map((group) => ({ value: group.id, label: group.name }))
	]);
	const unknownVariables = $derived(unknownWhatsAppVariables(`${header}\n${body}\n${footer}`));
	const message = $derived<WhatsAppMessage>({ header, body, footer, buttons });
	const input = $derived<WhatsAppAutomationInput>({
		name: name.trim(),
		eventName,
		launchId: launchId || null,
		destination:
			destinationType === 'group'
				? {
						type: 'group',
						groupId,
						groupName:
							groups.find((group) => group.id === groupId)?.name ??
							(initial.destination.type === 'group' && initial.destination.groupId === groupId
								? initial.destination.groupName
								: '')
					}
				: { type: 'private' },
		delay: delayMode === 'later' ? { value: Number(delayValue), unit: delayUnit } : null,
		message,
		isActive
	});
	const dirty = $derived(JSON.stringify(input) !== JSON.stringify(initial));

	const show = (field: string) => submitted || touched[field];
	const nameError = $derived(
		show('name') && !name.trim()
			? 'Informe um nome para a automação.'
			: name.length > WHATSAPP_NAME_LIMIT
				? `Use no máximo ${WHATSAPP_NAME_LIMIT} caracteres.`
				: undefined
	);
	const bodyError = $derived(
		show('body') && !body.trim()
			? 'Escreva a mensagem que será enviada.'
			: body.length > WHATSAPP_BODY_LIMIT
				? `Use no máximo ${WHATSAPP_BODY_LIMIT} caracteres.`
				: undefined
	);
	const groupError = $derived(
		show('group') && destinationType === 'group' && !groupId ? 'Selecione um grupo.' : undefined
	);
	const delayError = $derived(
		show('delay') &&
			delayMode === 'later' &&
			(!Number.isInteger(Number(delayValue)) || Number(delayValue) < 1)
			? 'Informe um número inteiro maior que zero.'
			: undefined
	);
	const buttonsError = $derived.by(() => {
		if (!submitted && !touched.buttons) return undefined;
		for (const button of buttons) {
			if (!button.label.trim()) return 'Informe o texto de todos os botões.';
			if (button.type === 'quick_reply' && !button.reply.trim()) {
				return 'Informe a resposta automática de todos os botões.';
			}
			if (button.type === 'url' && !isValidHttpsUrl(button.url.trim())) {
				return 'Informe uma URL válida começando com https://.';
			}
		}
		return undefined;
	});
	const valid = $derived(
		!nameError &&
			!bodyError &&
			!groupError &&
			!delayError &&
			!buttonsError &&
			unknownVariables.length === 0 &&
			name.trim() &&
			body.trim()
	);

	beforeNavigate((navigation) => {
		if (
			!allowNavigation &&
			dirty &&
			!window.confirm('Você tem alterações não salvas. Deseja sair?')
		) {
			navigation.cancel();
		}
	});

	function mark(field: string) {
		touched = { ...touched, [field]: true };
	}

	function updateDestination(type: 'private' | 'group') {
		if (type === 'group' && buttons.length > 0) {
			buttons = [];
			buttonMode = 'none';
			groupNotice = true;
		}
		destinationType = type;
	}

	async function retryGroups() {
		loadingGroups = true;
		currentGroupsState = await loadWhatsAppGroups(expert.id);
		loadingGroups = false;
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

	async function save(event: SubmitEvent) {
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
			saveError = 'Não foi possível salvar a automação. Tente novamente.';
		} finally {
			saving = false;
		}
	}

	function cancel() {
		if (!dirty || window.confirm('Descartar as alterações desta automação?')) {
			allowNavigation = true;
			void goto('/whatsapp');
		}
	}
</script>

<svelte:head>
	<title>{automation ? 'Editar automação' : 'Nova automação'} · {APP_NAME}</title>
</svelte:head>

<PageHeader
	title={automation ? 'Editar automação' : 'Nova automação'}
	description="Configure quando e como a mensagem será enviada pelo WhatsApp."
/>

<form
	class="grid grid-cols-[minmax(0,1fr)_minmax(320px,420px)] items-start gap-5 max-[900px]:grid-cols-1"
	novalidate
	onsubmit={save}
>
	<div class="flex min-w-0 flex-col gap-5">
		<Card title="Gatilho" description="Escolha o evento que inicia esta automação.">
			<div class="grid gap-4">
				<TextField
					id="automation-name"
					label="Nome da automação"
					maxlength={WHATSAPP_NAME_LIMIT}
					bind:value={name}
					error={nameError}
					onblur={() => mark('name')}
					placeholder="Ex.: Boas-vindas após cadastro"
				/>
				<div class="grid grid-cols-2 gap-3 max-[561px]:grid-cols-1">
					<Select
						id="automation-event"
						label="Evento gatilho"
						options={eventOptions}
						bind:value={eventName}
					/>
					<Select
						id="automation-launch"
						label="Lançamento"
						options={launchOptions}
						bind:value={launchId}
					/>
				</div>
				{#if !pixel}
					<p class="text-[12.5px] text-fg-subtle">
						Os eventos personalizados aparecerão depois que o rastreamento for configurado.
					</p>
				{/if}
			</div>
		</Card>

		<Card title="Entrega" description="Defina quem recebe e quando a mensagem é enviada.">
			<div class="flex flex-col gap-4">
				<fieldset>
					<legend class="mb-1.5 text-[13px] font-semibold text-fg-muted">Destino</legend>
					<div
						class="grid grid-cols-2 rounded-md border border-border bg-surface p-1"
						role="radiogroup"
					>
						<button
							type="button"
							role="radio"
							aria-checked={destinationType === 'private'}
							class={[
								'min-h-9 rounded-sm px-3 text-[13px] font-semibold',
								destinationType === 'private'
									? 'bg-primary text-white'
									: 'text-fg-muted hover:bg-surface-hover'
							]}
							onclick={() => updateDestination('private')}>Privado (para o lead)</button
						>
						<button
							type="button"
							role="radio"
							aria-checked={destinationType === 'group'}
							class={[
								'min-h-9 rounded-sm px-3 text-[13px] font-semibold',
								destinationType === 'group'
									? 'bg-primary text-white'
									: 'text-fg-muted hover:bg-surface-hover'
							]}
							onclick={() => updateDestination('group')}>Grupo</button
						>
					</div>
				</fieldset>
				{#if destinationType === 'private'}
					<Alert variant="warning">O lead precisa ter informado o WhatsApp no formulário.</Alert>
				{:else}
					{#if loadingGroups}
						<div aria-hidden="true">
							<span class="mb-1.5 block h-4 w-14 rounded bg-surface motion-safe:animate-pulse"
							></span>
							<span class="block h-10.5 w-full rounded-md bg-surface motion-safe:animate-pulse"
							></span>
						</div>
						<span class="sr-only" aria-live="polite">Carregando grupos do WhatsApp</span>
					{:else if currentGroupsState.status === 'error'}
						<div
							class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-danger/30 bg-danger/8 p-3.5"
						>
							<p class="text-[13.5px] text-danger-soft">
								Não foi possível carregar os grupos do WhatsApp.
							</p>
							<Button variant="secondary" size="sm" onclick={retryGroups}>Tentar novamente</Button>
						</div>
					{:else if groups.length === 0}
						<div
							class="rounded-md border border-border bg-surface p-3.5 text-[13.5px] text-fg-muted"
						>
							Nenhum grupo disponível. Conecte o WhatsApp em
							<a class="font-semibold text-primary-hover" href="/integrations">Integrações</a>
							para escolher um grupo.
						</div>
					{:else}
						<Select
							id="automation-group"
							label="Grupo"
							options={groupOptions}
							bind:value={groupId}
							error={groupError}
							onblur={() => mark('group')}
						/>
					{/if}
					{#if groupNotice}<Alert variant="warning"
							>Os botões foram removidos porque mensagens em grupos não aceitam botões interativos.</Alert
						>{/if}
				{/if}

				<fieldset>
					<legend class="mb-1.5 text-[13px] font-semibold text-fg-muted">Atraso</legend>
					<div class="flex flex-wrap gap-4 text-[13.5px] text-fg-muted">
						<label class="flex items-center gap-2"
							><input
								type="radio"
								name="delay"
								checked={delayMode === 'now'}
								onchange={() => (delayMode = 'now')}
							/>Enviar na hora</label
						>
						<label class="flex items-center gap-2"
							><input
								type="radio"
								name="delay"
								checked={delayMode === 'later'}
								onchange={() => (delayMode = 'later')}
							/>Depois de</label
						>
					</div>
				</fieldset>
				{#if delayMode === 'later'}
					<div class="grid grid-cols-2 gap-3 max-[420px]:grid-cols-1">
						<TextField
							id="automation-delay"
							label="Tempo"
							type="number"
							min="1"
							step="1"
							bind:value={delayValue}
							error={delayError}
							onblur={() => mark('delay')}
						/>
						<Select
							id="automation-delay-unit"
							label="Unidade"
							options={[
								{ value: 'minutes', label: 'Minutos' },
								{ value: 'hours', label: 'Horas' }
							]}
							bind:value={delayUnit}
						/>
					</div>
				{/if}
			</div>
		</Card>

		<Card title="Mensagem" description="Personalize o conteúdo enviado ao contato.">
			<div class="flex flex-col gap-4">
				<TextField
					id="automation-header"
					label="Cabeçalho (opcional)"
					maxlength={WHATSAPP_HEADER_LIMIT}
					bind:value={header}
					hint={`${header.length}/${WHATSAPP_HEADER_LIMIT}`}
				/>
				<div class="flex flex-col gap-1.5">
					<div class="flex items-end justify-between gap-3">
						<label class="text-[13px] font-semibold text-fg-muted" for="automation-body"
							>Corpo da mensagem</label
						><span
							class={[
								'text-[12px] tabular-nums',
								body.length > WHATSAPP_BODY_LIMIT ? 'text-danger' : 'text-fg-subtle'
							]}>{body.length}/{WHATSAPP_BODY_LIMIT}</span
						>
					</div>
					<div
						class="flex flex-wrap gap-1 rounded-t-md border border-b-0 border-border bg-surface px-2 py-1.5"
						aria-label="Formatação da mensagem"
					>
						<button
							type="button"
							class="size-8 rounded-sm font-bold hover:bg-surface-hover"
							aria-label="Negrito"
							title="Negrito"
							onclick={() => insertText('*', '*')}>B</button
						>
						<button
							type="button"
							class="size-8 rounded-sm italic hover:bg-surface-hover"
							aria-label="Itálico"
							title="Itálico"
							onclick={() => insertText('_', '_')}>I</button
						>
						<button
							type="button"
							class="size-8 rounded-sm line-through hover:bg-surface-hover"
							aria-label="Riscado"
							title="Riscado"
							onclick={() => insertText('~', '~')}>S</button
						>
						<button
							type="button"
							class="h-8 rounded-sm px-2 font-mono hover:bg-surface-hover"
							aria-label="Monoespaçado"
							title="Monoespaçado"
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
						placeholder={'Oi, {{primeiro_nome}}! Sua inscrição foi confirmada.'}></textarea>
					{#if bodyError}<p class="text-[12.5px] text-danger" role="alert">{bodyError}</p>{/if}
				</div>
				<div>
					<p class="mb-2 text-[12.5px] text-fg-subtle">Inserir variável:</p>
					<div class="flex flex-wrap gap-1.5">
						{#each WHATSAPP_VARIABLES as variable (variable)}
							<button
								type="button"
								class="rounded-full border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-primary-hover hover:border-primary"
								onclick={() => insertText(`{{${variable}}}`)}>{`{{${variable}}}`}</button
							>
						{/each}
					</div>
				</div>
				{#if unknownVariables.length > 0}<Alert variant="warning"
						>Variável desconhecida: {unknownVariables
							.map((value) => `{{${value}}}`)
							.join(', ')}.</Alert
					>{/if}
				<TextField
					id="automation-footer"
					label="Rodapé (opcional)"
					maxlength={WHATSAPP_FOOTER_LIMIT}
					bind:value={footer}
					hint={`${footer.length}/${WHATSAPP_FOOTER_LIMIT}`}
				/>
			</div>
		</Card>

		<Card title="Botões" description="Adicione respostas rápidas ou um link abaixo da mensagem.">
			{#if destinationType === 'group'}
				<div class="rounded-md border border-border bg-surface p-4 text-[13.5px] text-fg-muted">
					<strong class="block text-fg">Indisponível para grupos</strong>O WhatsApp não suporta
					botões interativos em mensagens enviadas para grupos.
				</div>
			{:else}
				<div class="flex flex-col gap-4">
					<Select
						id="automation-button-type"
						label="Tipo"
						value={buttonMode}
						options={[
							{ value: 'none', label: 'Sem botões' },
							{ value: 'quick_reply', label: 'Respostas rápidas' },
							{ value: 'url', label: 'Link' }
						]}
						onchange={(event) =>
							changeButtonMode(event.currentTarget.value as 'none' | 'quick_reply' | 'url')}
					/>
					{#each buttons as button, index (button.id)}
						<div class="rounded-md border border-border bg-surface p-3.5">
							<div class="mb-3 flex items-center justify-between gap-2">
								<strong class="text-[13px]">Botão {index + 1}</strong>
								<div class="flex">
									<button
										type="button"
										class="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-surface-hover disabled:opacity-35"
										disabled={index === 0}
										aria-label="Mover botão para cima"
										onclick={() => moveButton(index, -1)}>↑</button
									><button
										type="button"
										class="grid size-8 place-items-center rounded-sm text-fg-muted hover:bg-surface-hover disabled:opacity-35"
										disabled={index === buttons.length - 1}
										aria-label="Mover botão para baixo"
										onclick={() => moveButton(index, 1)}>↓</button
									><button
										type="button"
										class="grid size-8 place-items-center rounded-sm text-danger hover:bg-danger/10"
										aria-label="Remover botão"
										onclick={() => removeButton(index)}><Icon name="trash" size={15} /></button
									>
								</div>
							</div>
							<div class="flex flex-col gap-3">
								<TextField
									id={`button-label-${button.id}`}
									label="Rótulo"
									maxlength={WHATSAPP_BUTTON_LABEL_LIMIT}
									value={button.label}
									oninput={(event) => updateButton(index, { label: event.currentTarget.value })}
									hint={`${button.label.length}/${WHATSAPP_BUTTON_LABEL_LIMIT}`}
								/>
								{#if button.type === 'quick_reply'}
									<div class="flex flex-col gap-1.5">
										<div class="flex justify-between gap-2">
											<label
												class="text-[13px] font-semibold text-fg-muted"
												for={`button-reply-${button.id}`}>Resposta automática</label
											><span class="text-[12px] text-fg-subtle"
												>{button.reply.length}/{WHATSAPP_BUTTON_REPLY_LIMIT}</span
											>
										</div>
										<textarea
											id={`button-reply-${button.id}`}
											class="min-h-24 resize-y rounded-md border border-border bg-bg-elevated px-3.5 py-3 text-fg outline-none focus:border-primary focus:shadow-focus"
											maxlength={WHATSAPP_BUTTON_REPLY_LIMIT}
											value={button.reply}
											oninput={(event) => updateButton(index, { reply: event.currentTarget.value })}
											onblur={() => mark('buttons')}></textarea>
									</div>
								{:else}<TextField
										id={`button-url-${button.id}`}
										label="URL"
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
							><Icon name="plus" size={14} />Adicionar resposta rápida</Button
						>{/if}
					{#if buttonsError}<p class="text-[12.5px] text-danger" role="alert">
							{buttonsError}
						</p>{/if}
				</div>
			{/if}
		</Card>

		<label class="flex items-center gap-2.5 text-[13.5px] text-fg-muted"
			><input type="checkbox" bind:checked={isActive} /><span
				><strong class="block text-fg">Automação ativa</strong>Começa a funcionar assim que for
				salva.</span
			></label
		>
		{#if saveError}<Alert>{saveError}</Alert>{/if}
		<div class="flex flex-wrap justify-end gap-2">
			<Button variant="ghost" disabled={saving} onclick={cancel}>Cancelar</Button><Button
				type="submit"
				loading={saving}>Salvar automação</Button
			>
		</div>
	</div>

	<div class="sticky top-5 max-[900px]:static">
		<p class="mb-2 text-[12px] font-bold tracking-[0.06em] text-fg-subtle uppercase">Prévia</p>
		<MessagePreview {message} />
	</div>
</form>
