<script lang="ts">
	import { t } from '#lib/i18n/index.svelte.js';
	import AutomationEditor from '#lib/components/whatsapp/AutomationEditor.svelte';
	import Card from '#lib/components/ui/Card.svelte';
	import EmptyState from '#lib/components/ui/EmptyState.svelte';
	import { buttonClass } from '#lib/components/ui/button.js';
	import type { EditAutomationData } from './+page.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let editor = $state<EditAutomationData | null | undefined>();
	$effect(() => {
		const request = data.editor;
		editor = undefined;
		void request.then((value) => {
			if (request === data.editor) editor = value;
		});
	});
</script>

{#if !data.expert}
	<Card
		><EmptyState
			icon="users"
			title={t('whatsapp.page.noExpert.title')}
			description={t('whatsapp.page.noExpert.descriptionEdit')}
			>{#snippet action()}<a class={buttonClass()} href="/experts/new"
					>{t('whatsapp.page.noExpert.action')}</a
				>{/snippet}</EmptyState
		></Card
	>
{:else if editor === undefined}
	<div
		class="grid grid-cols-[minmax(0,1fr)_minmax(320px,420px)] gap-5 max-[900px]:grid-cols-1"
		aria-hidden="true"
	>
		<div
			class="h-[640px] rounded-lg border border-border bg-bg-elevated motion-safe:animate-pulse"
		></div>
		<div
			class="h-96 rounded-lg border border-border bg-bg-elevated motion-safe:animate-pulse"
		></div>
	</div>
	<span class="sr-only" aria-live="polite">{t('whatsapp.page.loadingEditor')}</span>
{:else if editor}
	<AutomationEditor
		expert={data.expert}
		launches={data.launches}
		pixel={editor.pixel}
		automation={editor.automation}
	/>
{/if}
