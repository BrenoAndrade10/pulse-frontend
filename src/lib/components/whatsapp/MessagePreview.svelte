<script lang="ts">
	import Icon from '#lib/components/ui/Icon.svelte';
	import type { WhatsAppButton, WhatsAppMessage } from '#lib/types.js';
	import { tokenizeWhatsAppText } from '#lib/utils/whatsappMessage.js';

	type Props = { message: WhatsAppMessage };
	let { message }: Props = $props();
	let reply = $state('');

	const tokens = $derived(tokenizeWhatsAppText(message.body || 'Sua mensagem aparece aqui.'));

	function choose(button: WhatsAppButton) {
		if (button.type === 'quick_reply') reply = button.reply;
	}
</script>

<section
	class="overflow-hidden rounded-lg border border-border bg-[#efeae2] text-[#111b21] dark:bg-[#0b141a] dark:text-[#e9edef]"
	aria-label="Prévia da mensagem no WhatsApp"
>
	<header class="flex items-center gap-3 bg-[#008069] px-4 py-3 text-white dark:bg-[#202c33]">
		<span class="grid size-9 place-items-center rounded-full bg-white/20" aria-hidden="true">
			<Icon name="whatsapp" size={18} />
		</span>
		<div>
			<h2 class="text-[14px] font-bold">Sua empresa</h2>
			<p class="text-[11px] text-white/75">online</p>
		</div>
	</header>

	<div
		class="min-h-96 bg-[radial-gradient(circle_at_20%_15%,rgb(0_0_0/0.035)_1px,transparent_1px)] bg-size-[18px_18px] p-4"
	>
		<div class="ml-auto max-w-[88%] text-[13.5px]">
			<div class="rounded-lg rounded-tr-sm bg-[#d9fdd3] px-3 py-2 shadow-sm dark:bg-[#005c4b]">
				{#if message.header.trim()}
					<p class="mb-1 font-bold break-words">{message.header}</p>
				{/if}
				<p class:opacity-60={!message.body.trim()} class="break-words whitespace-pre-wrap">
					{#each tokens as token, index (`${index}-${token.text}`)}
						{#if token.style === 'bold'}<strong>{token.text}</strong>
						{:else if token.style === 'italic'}<em>{token.text}</em>
						{:else if token.style === 'strike'}<s>{token.text}</s>
						{:else if token.style === 'mono'}<code class="rounded bg-black/8 px-1 dark:bg-white/10"
								>{token.text}</code
							>
						{:else}{token.text}{/if}
					{/each}
				</p>
				<div class="mt-1 flex items-end justify-between gap-3">
					{#if message.footer.trim()}
						<span class="text-[11px] text-[#667781] dark:text-[#aebac1]">{message.footer}</span>
					{:else}<span></span>{/if}
					<time class="shrink-0 text-[10px] text-[#667781] dark:text-[#aebac1]">10:42 ✓✓</time>
				</div>
			</div>

			{#if message.buttons.length > 0}
				<div class="mt-1 overflow-hidden rounded-lg bg-white shadow-sm dark:bg-[#202c33]">
					{#each message.buttons as button (button.id)}
						<button
							type="button"
							class="flex min-h-10 w-full items-center justify-center gap-1.5 border-t border-black/8 px-3 py-2 font-semibold text-[#027eb5] first:border-t-0 dark:border-white/8 dark:text-[#53bdeb]"
							onclick={() => choose(button)}
						>
							<Icon name={button.type === 'url' ? 'external-link' : 'message-circle'} size={13} />
							{button.label || 'Texto do botão'}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		{#if reply}
			<div
				class="mt-3 max-w-[88%] rounded-lg rounded-tl-sm bg-white px-3 py-2 text-[13.5px] break-words whitespace-pre-wrap shadow-sm dark:bg-[#202c33]"
			>
				{reply || 'A resposta automática aparece aqui.'}
				<time class="mt-1 block text-right text-[10px] text-[#667781] dark:text-[#aebac1]"
					>10:42</time
				>
			</div>
		{/if}
	</div>
</section>
