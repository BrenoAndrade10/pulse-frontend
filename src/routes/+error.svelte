<script lang="ts">
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.svelte.js';
	import { buttonClass } from '#lib/components/ui/button.js';
</script>

<svelte:head>
	<title>{page.status} · {t('common.error.title')}</title>
</svelte:head>

<div class="flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
	<p class="text-gradient-brand text-[64px] font-extrabold tracking-[-0.04em]">{page.status}</p>
	<h1 class="mb-3 text-[20px] font-bold">{page.error?.message ?? t('common.error.fallback')}</h1>
	<a class={buttonClass({ variant: 'secondary' })} href="/dashboard">{t('common.error.backHome')}</a
	>
</div>
