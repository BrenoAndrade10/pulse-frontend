<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import ExpertForm from '#lib/components/experts/ExpertForm.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { createExpert } from '#lib/services/experts.js';
	import type { ExpertInput } from '#lib/types.js';

	async function handleSubmit(input: ExpertInput) {
		const expert = await createExpert(input);
		await goto(`/experts/${expert.id}?created=1`);
	}
</script>

<svelte:head>
	<title>{t('experts.new.pageTitle')} · {APP_NAME}</title>
</svelte:head>

<div class="max-w-[880px]">
	<PageHeader
		title={t('experts.new.pageTitle')}
		description={t('experts.new.description')}
		back={{ href: '/experts', label: t('experts.title') }}
	/>

	<ExpertForm submitLabel={t('experts.new.submit')} cancelHref="/experts" onsubmit={handleSubmit} />
</div>
