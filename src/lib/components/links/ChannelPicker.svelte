<script lang="ts">
	import Icon, { type IconName } from '#lib/components/ui/Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
	import type { LinkChannel } from '#lib/types.js';

	type Props = { value: LinkChannel | ''; onchange?: (channel: LinkChannel) => void };
	let { value = $bindable(''), onchange }: Props = $props();

	const channels = $derived([
		{ value: 'instagram' as LinkChannel, icon: 'instagram' as IconName },
		{ value: 'whatsapp' as LinkChannel, icon: 'whatsapp' as IconName },
		{ value: 'telegram' as LinkChannel, icon: 'send' as IconName },
		{ value: 'email' as LinkChannel, icon: 'mail' as IconName },
		{ value: 'ads' as LinkChannel, icon: 'megaphone' as IconName },
		{ value: 'other' as LinkChannel, icon: 'link' as IconName }
	]);
</script>

<fieldset>
	<legend class="mb-2 text-[13px] font-semibold text-fg-muted">{t('links.channel')}</legend>
	<div
		class="grid grid-cols-2 gap-2 sm:grid-cols-3"
		role="radiogroup"
		aria-label={t('links.channel')}
	>
		{#each channels as channel (channel.value)}
			<label
				class="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-[12.5px] font-semibold transition-colors focus-within:border-primary {value ===
				channel.value
					? 'border-primary bg-primary/10 text-fg'
					: 'border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg'}"
			>
				<input
					class="sr-only"
					type="radio"
					name="link-channel"
					value={channel.value}
					bind:group={value}
					onchange={() => onchange?.(channel.value)}
					aria-label={t(`links.channels.${channel.value}`)}
				/>
				<Icon name={channel.icon} size={16} />
				<span>{t(`links.channels.${channel.value}`)}</span>
			</label>
		{/each}
	</div>
</fieldset>
