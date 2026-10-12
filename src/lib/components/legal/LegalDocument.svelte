<script lang="ts">
	import type { Snippet } from 'svelte';
	import { dev } from '$app/env';
	import Logo from '#lib/components/auth/Logo.svelte';
	import { APP_NAME } from '#lib/config.js';
	import { formatLegalDate, pendingLegalFields } from '#lib/legal.js';

	type Section = { id: string; title: string };

	type Props = {
		title: string;
		description: string;
		updatedAt: string;
		sections: Section[];
		children: Snippet;
	};

	let { title, description, updatedAt, sections, children }: Props = $props();
</script>

<svelte:head>
	<title>{title} · {APP_NAME}</title>
	<meta name="description" content={description} />
</svelte:head>

<div
	class="min-h-dvh [background:radial-gradient(900px_400px_at_100%_-10%,rgb(124_92_255/0.08),transparent_70%),var(--color-bg)]"
>
	<header class="border-b border-border">
		<div class="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
			<a href="/" class="hover:no-underline" aria-label="{APP_NAME} — página inicial"><Logo /></a>
			<nav class="flex gap-5 text-[13.5px] font-semibold" aria-label="Documentos legais">
				<a href="/termos">Termos de uso</a>
				<a href="/privacidade">Privacidade</a>
			</nav>
		</div>
	</header>

	<main class="mx-auto max-w-3xl px-4 pt-10 pb-20">
		{#if dev && pendingLegalFields.length}
			<p
				class="mb-8 rounded-md border border-warning/40 bg-warning/10 px-4 py-3 text-[13.5px] text-warning"
				role="note"
			>
				Aviso de desenvolvimento: preencha em <code>src/lib/legal.ts</code> os campos pendentes ({pendingLegalFields.join(
					', '
				)}) e submeta o texto à revisão jurídica antes de publicar.
			</p>
		{/if}

		<h1 class="text-[32px] leading-tight font-extrabold tracking-[-0.02em]">{title}</h1>
		<p class="mt-2 text-[13.5px] text-fg-subtle">
			Última atualização: <time datetime={updatedAt}>{formatLegalDate(updatedAt)}</time>
		</p>

		<nav
			class="mt-8 rounded-lg border border-border bg-surface p-5"
			aria-labelledby="legal-toc-title"
		>
			<h2
				id="legal-toc-title"
				class="text-[12px] font-bold tracking-[0.08em] text-fg-subtle uppercase"
			>
				Nesta página
			</h2>
			<ol class="mt-3 grid list-decimal gap-1.5 pl-5 text-[14px] sm:grid-cols-2">
				{#each sections as section (section.id)}
					<li><a href="#{section.id}">{section.title}</a></li>
				{/each}
			</ol>
		</nav>

		<!-- Estilos do conteúdo jurídico aplicados aos elementos filhos. -->
		<article
			class={[
				'mt-10 text-[15px] leading-[1.75] text-fg-muted',
				'[&_h2]:mt-12 [&_h2]:scroll-mt-6 [&_h2]:text-[21px] [&_h2]:leading-snug [&_h2]:font-bold [&_h2]:text-fg',
				'[&_h3]:mt-6 [&_h3]:text-[16px] [&_h3]:font-bold [&_h3]:text-fg',
				'[&_p]:mt-3 [&_strong]:font-semibold [&_strong]:text-fg',
				'[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-6',
				'[&_ol]:mt-3 [&_ol]:list-[lower-alpha] [&_ol]:space-y-1.5 [&_ol]:pl-6',
				'[&_li]:pl-1 [&_li::marker]:text-fg-subtle',
				'[&_code]:rounded-sm [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:text-fg',
				'[&_table]:mt-4 [&_table]:w-full [&_table]:text-left [&_table]:text-[14px]',
				'[&_th]:border-b [&_th]:border-border-strong [&_th]:px-3 [&_th]:py-2.5 [&_th]:font-semibold [&_th]:text-fg [&_th]:align-bottom',
				'[&_td]:border-b [&_td]:border-border [&_td]:px-3 [&_td]:py-2.5 [&_td]:align-top'
			]}
		>
			{@render children()}
		</article>
	</main>
</div>
