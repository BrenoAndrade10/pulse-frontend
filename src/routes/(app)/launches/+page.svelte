<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { ApiError } from '#lib/api/http.js';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Badge from '#lib/components/ui/Badge.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import Select from '#lib/components/ui/Select.svelte';
	import TextField from '#lib/components/ui/TextField.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { createLaunch, updateLaunch } from '#lib/services/launches.js';
	import type { Launch, LaunchInput, LaunchStatus } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
	import { validateRequired } from '#lib/utils/validation.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const statusOptions = [
		{ value: 'draft', label: 'Rascunho' },
		{ value: 'planned', label: 'Planejado' },
		{ value: 'in_progress', label: 'Em andamento' },
		{ value: 'completed', label: 'Concluído' },
		{ value: 'canceled', label: 'Cancelado' },
		{ value: 'archived', label: 'Arquivado' }
	];
	const statusMeta: Record<
		LaunchStatus,
		{ label: string; variant: 'neutral' | 'warning' | 'success' | 'danger' }
	> = {
		draft: { label: 'Rascunho', variant: 'neutral' },
		planned: { label: 'Planejado', variant: 'warning' },
		in_progress: { label: 'Em andamento', variant: 'success' },
		completed: { label: 'Concluído', variant: 'neutral' },
		canceled: { label: 'Cancelado', variant: 'danger' },
		archived: { label: 'Arquivado', variant: 'neutral' }
	};

	let dialog = $state<HTMLDialogElement>();
	let editing = $state<Launch | null>(null);
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();
	let form = $state(emptyForm());

	function emptyForm() {
		return {
			name: '',
			description: '',
			startsAt: '',
			endsAt: '',
			status: 'draft' as LaunchStatus
		};
	}

	const errors = $derived({
		name: validateRequired(form.name, 'Informe o nome do lançamento.'),
		endsAt:
			form.endsAt && form.startsAt && form.endsAt < form.startsAt
				? 'A data final deve ser posterior à inicial.'
				: undefined
	});

	function openCreate() {
		editing = null;
		form = emptyForm();
		submitted = false;
		formError = undefined;
		dialog?.showModal();
	}

	function openEdit(launch: Launch) {
		editing = launch;
		form = {
			name: launch.name,
			description: launch.description ?? '',
			startsAt: launch.startsAt?.slice(0, 10) ?? '',
			endsAt: launch.endsAt?.slice(0, 10) ?? '',
			status: launch.status
		};
		submitted = false;
		formError = undefined;
		dialog?.showModal();
	}

	const toIsoDate = (value: string) => (value ? new Date(`${value}T00:00:00`).toISOString() : null);

	async function save(event: SubmitEvent) {
		event.preventDefault();
		submitted = true;
		formError = undefined;
		if (!data.expert || Object.values(errors).some(Boolean)) return;
		const input: LaunchInput = {
			name: form.name.trim(),
			description: form.description.trim() || null,
			status: form.status,
			startsAt: toIsoDate(form.startsAt),
			endsAt: toIsoDate(form.endsAt),
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
		};
		submitting = true;
		try {
			if (editing) await updateLaunch(data.expert.id, editing.id, input);
			else await createLaunch(data.expert.id, input);
			dialog?.close();
			await invalidateAll();
		} catch (error) {
			const validationMessage = error instanceof ApiError ? error.validationMessages[0] : undefined;
			formError = validationMessage ?? 'Não foi possível salvar o lançamento.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>Lançamentos · {APP_NAME}</title></svelte:head>

<PageHeader
	title="Lançamentos"
	description={data.expert
		? `Planejamento e calendário de ${data.expert.name}.`
		: 'Planejamento dos lançamentos por expert.'}
>
	{#snippet actions()}
		<Button onclick={openCreate} disabled={!data.expert || data.backendUnavailable}
			><Icon name="plus" size={16} />Novo lançamento</Button
		>
	{/snippet}
</PageHeader>

{#if data.backendUnavailable}
	<Alert>O módulo de lançamentos ainda precisa ser disponibilizado pelo backend.</Alert>
{:else if !data.expert}
	<Card><EmptyState icon="users" title="Nenhum expert cadastrado" /></Card>
{:else if data.launches.length === 0}
	<Card>
		<EmptyState
			icon="rocket"
			title="Nenhum lançamento configurado"
			description="Crie o primeiro lançamento deste expert para organizar o calendário e as metas."
		>
			{#snippet action()}<Button onclick={openCreate}>Criar lançamento</Button>{/snippet}
		</EmptyState>
	</Card>
{:else}
	<Card flush>
		<div class="overflow-x-auto">
			<table class="w-full border-collapse text-[14px]">
				<thead
					><tr
						class="text-left text-[12px] font-semibold tracking-[0.05em] text-fg-subtle uppercase"
					>
						<th class="border-b border-border px-5.5 py-3">Lançamento</th><th
							class="border-b border-border px-5.5 py-3">Período</th
						>
						<th class="border-b border-border px-5.5 py-3">Status</th><th
							class="border-b border-border px-5.5 py-3">Fuso horário</th
						><th class="border-b border-border px-5.5 py-3"></th>
					</tr></thead
				>
				<tbody
					>{#each data.launches as launch (launch.id)}
						{@const status = statusMeta[launch.status]}
						<tr>
							<td class="border-b border-border px-5.5 py-4"
								><strong>{launch.name}</strong>
								<p class="mt-0.5 line-clamp-1 text-[12.5px] text-fg-muted">
									{launch.description ?? 'Sem descrição'}
								</p></td
							>
							<td class="border-b border-border px-5.5 py-4 whitespace-nowrap text-fg-muted"
								>{launch.startsAt ? formatDate(launch.startsAt) : 'Sem início'}{launch.endsAt
									? ` – ${formatDate(launch.endsAt)}`
									: ''}</td
							>
							<td class="border-b border-border px-5.5 py-4"
								><Badge variant={status.variant}>{status.label}</Badge></td
							>
							<td class="border-b border-border px-5.5 py-4 text-fg-muted">{launch.timezone}</td>
							<td class="border-b border-border px-5.5 py-4 text-right"
								><Button variant="ghost" size="sm" onclick={() => openEdit(launch)}
									><Icon name="pencil" size={15} />Editar</Button
								></td
							>
						</tr>
					{/each}</tbody
				>
			</table>
		</div>
	</Card>
{/if}

<dialog
	class="m-auto w-[min(680px,calc(100vw-32px))] rounded-lg border border-border-strong bg-bg-elevated p-6 text-fg backdrop:bg-[rgb(5_5_10/0.72)]"
	bind:this={dialog}
>
	<form class="flex flex-col gap-5" novalidate onsubmit={save}>
		<div>
			<h2 class="text-[18px] font-bold">{editing ? 'Editar lançamento' : 'Novo lançamento'}</h2>
			<p class="mt-1 text-[13px] text-fg-muted">Configure o período e o status do lançamento.</p>
		</div>
		{#if formError}<Alert>{formError}</Alert>{/if}
		<div class="grid grid-cols-2 gap-4 max-[601px]:grid-cols-1">
			<TextField
				id="launch-name"
				label="Nome *"
				bind:value={form.name}
				error={submitted ? errors.name : undefined}
			/>
			<TextField id="start-date" type="date" label="Início" bind:value={form.startsAt} />
			<TextField
				id="end-date"
				type="date"
				label="Término"
				bind:value={form.endsAt}
				error={submitted ? errors.endsAt : undefined}
			/>
			<Select id="launch-status" label="Status" bind:value={form.status} options={statusOptions} />
		</div>
		<label class="flex flex-col gap-1.5 text-[13px] font-semibold text-fg-muted"
			>Descrição<textarea
				class="min-h-24 resize-y rounded-md border border-border bg-surface p-3 text-[14px] text-fg outline-none focus:border-primary"
				bind:value={form.description}></textarea></label
		>
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => dialog?.close()}>Cancelar</Button><Button
				type="submit"
				loading={submitting}>{editing ? 'Salvar alterações' : 'Criar lançamento'}</Button
			>
		</div>
	</form>
</dialog>
