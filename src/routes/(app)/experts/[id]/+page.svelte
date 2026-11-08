<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import ExpertForm from '#lib/components/experts/ExpertForm.svelte';
	import Alert from '#lib/components/ui/Alert.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import Icon from '#lib/components/ui/Icon.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { deleteExpert, updateExpert } from '#lib/services/experts.js';
	import type { ExpertInput } from '#lib/types.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let deleting = $state(false);
	let dialog = $state<HTMLDialogElement>();

	const justCreated = $derived(page.url.searchParams.get('created') === '1');

	async function handleSubmit(input: ExpertInput) {
		await updateExpert(data.expert.id, input);
		await goto('/experts');
	}

	async function handleDelete() {
		deleting = true;
		try {
			await deleteExpert(data.expert.id);
			dialog?.close();
			await goto('/experts');
		} finally {
			deleting = false;
		}
	}
</script>

<svelte:head>
	<title>{data.expert.name} · {APP_NAME}</title>
</svelte:head>

<div class="max-w-[880px]">
	<PageHeader
		title={data.expert.name}
		description={t('experts.detail.description')}
		back={{ href: '/experts', label: t('experts.title') }}
	/>

	{#if justCreated}
		<div class="mb-5">
			<Alert variant="success">{t('experts.detail.created')}</Alert>
		</div>
	{/if}

	{#key data.expert.id}
		<ExpertForm
			expert={data.expert}
			submitLabel={t('experts.detail.submit')}
			cancelHref="/experts"
			onsubmit={handleSubmit}
		/>
	{/key}

	<div class="mt-10">
		<Card title={t('experts.detail.dangerZone')}>
			<div class="flex flex-wrap items-center justify-between gap-4">
				<p class="text-[13.5px] text-fg-muted">
					{t('experts.detail.dangerDescription')}
				</p>
				<Button variant="danger" onclick={() => dialog?.showModal()}>
					<Icon name="trash" size={15} />{t('experts.detail.delete')}
				</Button>
			</div>
		</Card>
	</div>
</div>

<dialog
	class={[
		'm-auto w-[min(420px,calc(100vw-32px))] p-6',
		'rounded-lg border border-border-strong bg-bg-elevated text-fg',
		'shadow-[0_30px_60px_-20px_rgb(0_0_0/0.8)]',
		'backdrop:bg-[rgb(5_5_10/0.7)] backdrop:backdrop-blur-[3px]'
	]}
	bind:this={dialog}
	aria-labelledby="delete-title"
>
	<h2 class="text-[18px] font-bold" id="delete-title">
		{t('experts.detail.deleteTitle', { name: data.expert.name })}
	</h2>
	<p class="mt-2 mb-6 text-fg-muted">{t('experts.detail.deleteWarning')}</p>
	<div class="flex justify-end gap-2.5">
		<Button variant="ghost" onclick={() => dialog?.close()}>{t('common.actions.cancel')}</Button>
		<Button variant="danger" loading={deleting} onclick={handleDelete}
			>{t('common.actions.delete')}</Button
		>
	</div>
</dialog>
