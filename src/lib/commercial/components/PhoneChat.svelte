<script module lang="ts">
	import type { Segment } from './messages';

	export type RichBody = { paragraphs: Segment[][]; cta?: string; ctaVariable?: string };

	export type PhoneMessage = {
		rich?: RichBody;
		id: string;
		from: 'brand' | 'lead';
		text: string;
		time: string;
		subject?: string;
		sender?: string;
		kind?: 'comment';
	};
</script>

<script lang="ts">
	import Icon from './Icon.svelte';

	let {
		channel,
		messages,
		typing = false,
		name = 'Pulse · Sua marca',
		status = channel === 'instagram' ? 'ativo agora' : 'online',
		label = 'Prévia conceitual',
		compact = false,
		bare = false,
		highlight = '',
		emptyText = ''
	}: {
		channel: 'whatsapp' | 'email' | 'instagram';
		messages: PhoneMessage[];
		typing?: boolean;
		name?: string;
		status?: string;
		label?: string;
		compact?: boolean;
		bare?: boolean;
		highlight?: string;
		emptyText?: string;
	} = $props();

	const titles = {
		whatsapp: 'Prévia de conversa de WhatsApp',
		email: 'Prévia de e-mail na caixa de entrada',
		instagram: 'Prévia de comentário e mensagem direta do Instagram'
	};
</script>

{#snippet body(rich: RichBody)}
	{#each rich.paragraphs as paragraph, index (index)}
		<p>
			{#each paragraph as segment, at (at)}
				{#if segment.variable}{#key segment.text}<mark
							class="cl-var"
							class:is-pick={highlight === segment.variable}>{segment.text}</mark
						>{/key}{:else}{segment.text}{/if}
			{/each}
		</p>
	{/each}
	{#if rich.cta}
		<span class="cl-bub-cta" class:is-pick={!!rich.ctaVariable && highlight === rich.ctaVariable}
			>{rich.cta}</span
		>
	{/if}
{/snippet}

<figure class="cl-phone-fig" class:is-compact={compact} class:is-bare={bare}>
	<div class="cl-phone cl-phone-{channel}" role="group" aria-label={titles[channel]}>
		{#if !compact}<span class="cl-phone-notch" aria-hidden="true"></span>{/if}

		{#if channel === 'email'}
			<div class="cl-ph-head cl-ph-head-mail">
				<span class="cl-ph-ico"><Icon name="mail" size={16} /></span>
				<div>
					<b>Caixa de entrada</b>
					<small>{typing ? 'Nova mensagem chegando…' : 'Atualizado agora'}</small>
				</div>
			</div>
			<div class="cl-mail-body">
				{#each messages as message (message.id)}
					<article class="cl-mail">
						<h4>{message.subject}</h4>
						<div class="cl-mail-from">
							<span class="cl-mail-avatar" aria-hidden="true">S</span>
							<div>
								<b>{message.sender ?? 'Sua marca'}</b>
								<small>para você</small>
							</div>
							<time>{message.time}</time>
						</div>
						{#if message.rich}
							<div class="cl-mail-copy">{@render body(message.rich)}</div>
						{:else}
							<p>{message.text}</p>
						{/if}
					</article>
				{:else}
					<p class="cl-ph-empty">{typing ? 'Aguardando a mensagem…' : 'Nenhuma mensagem nova.'}</p>
				{/each}
				{#if typing && messages.length === 0}
					<div class="cl-typing" aria-hidden="true"><i></i><i></i><i></i></div>
				{/if}
			</div>
		{:else}
			{#if !bare}
				<div class="cl-ph-head cl-ph-head-{channel}">
					<span class="cl-ph-avatar">
						<Icon name={channel === 'instagram' ? 'instagram' : 'chat'} size={16} />
					</span>
					<div>
						<b>{name}</b>
						<small>{typing ? 'digitando…' : status}</small>
					</div>
				</div>
			{/if}
			<div class="cl-chat-body">
				<p class="cl-chat-day">{channel === 'instagram' ? 'Agora' : 'Hoje'}</p>
				{#each messages as message (message.id)}
					{#if message.kind === 'comment'}
						<div class="cl-comment">
							<span class="cl-comment-avatar" aria-hidden="true"></span>
							<div>
								<b>lead_exemplo</b>
								<p>{message.text}</p>
							</div>
						</div>
					{:else}
						<div class="cl-bub cl-bub-{message.from}">
							{#if message.rich}
								{@render body(message.rich)}
							{:else}
								<p>{message.text}</p>
							{/if}
							<span class="cl-bub-meta">
								{message.time}
								{#if message.from === 'lead' && channel === 'whatsapp'}
									<svg
										class="cl-ticks"
										viewBox="0 0 16 11"
										width="16"
										height="11"
										aria-hidden="true"
									>
										<path d="M1 6l3 3 6-7M6 9l1 1 7-8" />
									</svg>
								{/if}
							</span>
						</div>
					{/if}
				{/each}
				{#if typing}
					<div class="cl-bub cl-bub-brand cl-typing" aria-hidden="true"><i></i><i></i><i></i></div>
				{:else if emptyText && messages.length === 0}
					<p class="cl-ph-empty cl-ph-note">{emptyText}</p>
				{/if}
			</div>
			{#if !compact}
				<div class="cl-chat-input" aria-hidden="true">
					<span>{channel === 'instagram' ? 'Mensagem…' : 'Mensagem'}</span>
				</div>
			{/if}
		{/if}
	</div>
	{#if label}<figcaption class="cl-phone-cap">{label}</figcaption>{/if}
</figure>
