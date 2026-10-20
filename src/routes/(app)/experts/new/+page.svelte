<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '#lib/components/app/PageHeader.svelte';
	import ExpertForm from '#lib/components/experts/ExpertForm.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { createExpert } from '#lib/services/experts.js';
	import type { ExpertInput } from '#lib/types.js';

	async function handleSubmit(input: ExpertInput) {
		const expert = await createExpert(input);
		await goto(`/experts/${expert.id}?created=1`);
	}
</script>

<svelte:head>
	<title>Novo expert · {APP_NAME}</title>
</svelte:head>

<div class="max-w-[880px]">
	<PageHeader
		title="Novo expert"
		description="Depois de salvar, você poderá conectar a conta do Instagram."
		back={{ href: '/experts', label: 'Experts' }}
	/>

	<ExpertForm submitLabel="Salvar expert" cancelHref="/experts" onsubmit={handleSubmit} />
</div>
