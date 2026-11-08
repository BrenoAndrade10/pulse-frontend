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
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { createLaunch, updateLaunch } from '#lib/services/launches.js';
	import type { Launch, LaunchInput, LaunchStatus, LaunchType } from '#lib/types.js';
	import { formatDate } from '#lib/utils/format.js';
	import { validateRequired } from '#lib/utils/validation.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const statusValues: LaunchStatus[] = [
		'draft',
		'planned',
		'in_progress',
		'completed',
		'canceled',
		'archived'
	];
	const statusOptions = $derived(
		statusValues.map((value) => ({ value, label: t(`launches.status.${value}`) }))
	);
	const statusVariants: Record<LaunchStatus, 'neutral' | 'warning' | 'success' | 'danger'> = {
		draft: 'neutral',
		planned: 'warning',
		in_progress: 'success',
		completed: 'neutral',
		canceled: 'danger',
		archived: 'neutral'
	};
	const typeValues: LaunchType[] = ['internal', 'seed', 'perpetual', 'webinar', 'other'];
	const typeOptions = $derived(
		typeValues.map((value) => ({ value, label: t(`launches.types.${value}`) }))
	);
	const brazilTimezones = [
		'America/Sao_Paulo',
		'America/Fortaleza',
		'America/Recife',
		'America/Bahia',
		'America/Belem',
		'America/Manaus',
		'America/Cuiaba',
		'America/Campo_Grande',
		'America/Porto_Velho',
		'America/Boa_Vista',
		'America/Rio_Branco',
		'America/Noronha'
	];
	const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	const supportedTimezones =
		typeof Intl.supportedValuesOf === 'function'
			? Intl.supportedValuesOf('timeZone')
			: [...brazilTimezones, browserTimezone, 'UTC'];
	const timezoneValues = [
		...new Set([
			...brazilTimezones,
			browserTimezone,
			'UTC',
			...supportedTimezones.filter((timezone) => !brazilTimezones.includes(timezone))
		])
	];
	const baseTimezoneOptions = $derived(
		timezoneValues.map((timezone) => ({
			value: timezone,
			label: `${timezone} (${timezoneOffset(timezone)})`
		}))
	);
	const expertOptions = $derived(
		data.experts.map((expert) => ({ value: expert.id, label: expert.name }))
	);

	let dialog = $state<HTMLDialogElement>();
	let editing = $state<Launch | null>(null);
	let submitting = $state(false);
	let submitted = $state(false);
	let formError = $state<string>();
	let form = $state(emptyForm());
	const timezoneOptions = $derived(
		form.timezone && !timezoneValues.includes(form.timezone)
			? [
					...baseTimezoneOptions,
					{ value: form.timezone, label: `${form.timezone} (${timezoneOffset(form.timezone)})` }
				]
			: baseTimezoneOptions
	);

	function emptyForm() {
		return {
			expertId: data.expert?.id ?? data.experts[0]?.id ?? '',
			name: '',
			description: '',
			startsAt: '',
			endsAt: '',
			status: 'draft' as LaunchStatus,
			timezone: browserTimezone,
			type: 'internal' as LaunchType
		};
	}

	function timezoneOffset(timezone: string) {
		try {
			return (
				new Intl.DateTimeFormat(i18n.intl, {
					timeZone: timezone,
					timeZoneName: 'longOffset'
				})
					.formatToParts(new Date())
					.find((part) => part.type === 'timeZoneName')?.value ?? 'GMT'
			);
		} catch {
			return 'GMT';
		}
	}

	const errors = $derived({
		expertId: validateRequired(form.expertId, t('launches.validation.expert')),
		name: validateRequired(form.name, t('launches.validation.name')),
		timezone: validateRequired(form.timezone, t('launches.validation.timezone')),
		endsAt:
			form.endsAt && form.startsAt && form.endsAt < form.startsAt
				? t('launches.validation.endsAfterStart')
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
			expertId: launch.expertId,
			name: launch.name,
			description: launch.description ?? '',
			startsAt: launch.startsAt?.slice(0, 10) ?? '',
			endsAt: launch.endsAt?.slice(0, 10) ?? '',
			status: launch.status,
			timezone: launch.timezone || browserTimezone,
			type: launch.type ?? 'internal'
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
		if (Object.values(errors).some(Boolean)) return;
		const input: LaunchInput = {
			expertId: form.expertId,
			name: form.name.trim(),
			description: form.description.trim() || null,
			status: form.status,
			type: form.type,
			startsAt: toIsoDate(form.startsAt),
			endsAt: toIsoDate(form.endsAt),
			timezone: form.timezone
		};
		submitting = true;
		try {
			if (editing) {
				const { expertId, ...launchChanges } = input;
				await updateLaunch(
					editing.id,
					expertId === editing.expertId ? launchChanges : { ...launchChanges, expertId }
				);
			} else await createLaunch(input);
			dialog?.close();
			await invalidateAll();
		} catch (error) {
			const validationMessage = error instanceof ApiError ? error.validationMessages[0] : undefined;
			formError = validationMessage ?? t('launches.form.saveError');
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head><title>{t('launches.title')} · {APP_NAME}</title></svelte:head>

<PageHeader
	title={t('launches.title')}
	description={data.expert
		? t('launches.description', { expert: data.expert.name })
		: t('launches.descriptionAll')}
>
	{#snippet actions()}
		<Button onclick={openCreate} disabled={data.experts.length === 0 || data.backendUnavailable}
			><Icon name="plus" size={16} />{t('launches.new')}</Button
		>
	{/snippet}
</PageHeader>

{#if data.backendUnavailable}
	<Alert>{t('launches.backendUnavailable')}</Alert>
{:else if data.experts.length === 0}
	<Card><EmptyState icon="users" title={t('launches.noExperts')} /></Card>
{:else if data.launches.length === 0}
	<Card>
		<EmptyState
			icon="rocket"
			title={t('launches.empty.title')}
			description={t('launches.empty.description')}
		>
			{#snippet action()}<Button onclick={openCreate}>{t('launches.empty.create')}</Button
				>{/snippet}
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
						<th class="border-b border-border px-5.5 py-3">{t('launches.table.launch')}</th><th
							class="border-b border-border px-5.5 py-3">{t('launches.table.type')}</th
						><th class="border-b border-border px-5.5 py-3">{t('launches.table.period')}</th>
						<th class="border-b border-border px-5.5 py-3">{t('launches.table.status')}</th><th
							class="border-b border-border px-5.5 py-3">{t('launches.table.timezone')}</th
						><th class="border-b border-border px-5.5 py-3"></th>
					</tr></thead
				>
				<tbody
					>{#each data.launches as launch (launch.id)}
						{@const statusVariant = statusVariants[launch.status]}
						<tr>
							<td class="border-b border-border px-5.5 py-4"
								><strong>{launch.name}</strong>
								<p class="mt-0.5 line-clamp-1 text-[12.5px] text-fg-muted">
									{data.expert
										? ''
										: `${data.experts.find((item) => item.id === launch.expertId)?.name ?? t('launches.table.expertFallback')} · `}{launch.description ??
										t('launches.table.noDescription')}
								</p></td
							>
							<td class="border-b border-border px-5.5 py-4 whitespace-nowrap text-fg-muted"
								>{t(`launches.types.${launch.type ?? 'other'}`)}</td
							>
							<td class="border-b border-border px-5.5 py-4 whitespace-nowrap text-fg-muted"
								>{launch.startsAt
									? formatDate(launch.startsAt)
									: t('launches.table.noStart')}{launch.endsAt
									? ` – ${formatDate(launch.endsAt)}`
									: ''}</td
							>
							<td class="border-b border-border px-5.5 py-4"
								><Badge variant={statusVariant}>{t(`launches.status.${launch.status}`)}</Badge></td
							>
							<td class="border-b border-border px-5.5 py-4 text-fg-muted">{launch.timezone}</td>
							<td class="border-b border-border px-5.5 py-4 text-right"
								><Button variant="ghost" size="sm" onclick={() => openEdit(launch)}
									><Icon name="pencil" size={15} />{t('launches.table.edit')}</Button
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
	class="m-auto max-h-[calc(100dvh-32px)] w-[min(780px,calc(100vw-32px))] overflow-y-auto rounded-lg border border-border-strong bg-bg-elevated p-6 text-fg backdrop:bg-[rgb(5_5_10/0.72)] max-[420px]:p-4.5"
	bind:this={dialog}
>
	<form class="flex flex-col gap-5" novalidate onsubmit={save}>
		<div>
			<h2 class="text-[18px] font-bold">
				{editing ? t('launches.form.editTitle') : t('launches.form.newTitle')}
			</h2>
			<p class="mt-1 text-[13px] text-fg-muted">
				{t('launches.form.description')}
			</p>
		</div>
		{#if formError}<Alert>{formError}</Alert>{/if}
		<div class="grid grid-cols-2 gap-4 max-[601px]:grid-cols-1">
			<Select
				id="launch-expert"
				label={t('launches.form.expert')}
				bind:value={form.expertId}
				options={expertOptions}
				error={submitted ? errors.expertId : undefined}
			/>
			<TextField
				id="launch-name"
				label={t('launches.form.name')}
				bind:value={form.name}
				error={submitted ? errors.name : undefined}
			/>
			<TextField
				id="start-date"
				type="date"
				label={t('launches.form.start')}
				bind:value={form.startsAt}
			/>
			<TextField
				id="end-date"
				type="date"
				label={t('launches.form.end')}
				bind:value={form.endsAt}
				error={submitted ? errors.endsAt : undefined}
			/>
			<Select
				id="launch-status"
				label={t('launches.form.status')}
				bind:value={form.status}
				options={statusOptions}
			/>
			<Select
				id="launch-timezone"
				label={t('launches.form.timezone')}
				bind:value={form.timezone}
				options={timezoneOptions}
				error={submitted ? errors.timezone : undefined}
			/>
		</div>
		<fieldset>
			<legend class="text-[13px] font-semibold text-fg-muted">{t('launches.form.type')}</legend>
			<p class="mt-1 text-[12.5px] text-fg-subtle">
				{t('launches.form.typeHint')}
			</p>
			<div class="mt-3 grid grid-cols-2 gap-2.5 max-[560px]:grid-cols-1">
				{#each typeOptions as option (option.value)}
					<label
						class={[
							'flex cursor-pointer items-center gap-3 rounded-md border px-3.5 py-3 text-[13.5px] outline-none transition-colors focus-within:shadow-focus',
							form.type === option.value
								? 'border-primary bg-primary/8 text-fg'
								: 'border-border bg-surface text-fg-muted hover:border-border-strong'
						]}
					>
						<input
							type="radio"
							name="launch-type"
							value={option.value}
							bind:group={form.type}
							class="size-4 accent-primary"
						/>
						<span class="font-semibold">{option.label}</span>
					</label>
				{/each}
			</div>
		</fieldset>
		<label class="flex flex-col gap-1.5 text-[13px] font-semibold text-fg-muted"
			>{t('launches.form.descriptionLabel')}<textarea
				class="min-h-24 resize-y rounded-md border border-border bg-surface p-3 text-[14px] text-fg outline-none focus:border-primary"
				bind:value={form.description}></textarea></label
		>
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => dialog?.close()}>{t('common.actions.cancel')}</Button
			><Button type="submit" loading={submitting}
				>{editing ? t('launches.form.saveChanges') : t('launches.form.create')}</Button
			>
		</div>
	</form>
</dialog>
