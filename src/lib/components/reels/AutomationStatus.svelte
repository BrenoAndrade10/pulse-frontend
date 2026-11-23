<script lang="ts">
	import { t } from '#lib/i18n/index.svelte.js';
	import type { AutomationStatus } from '#lib/utils/commentAutomation.js';

	let { status }: { status: AutomationStatus } = $props();

	const styles: Record<AutomationStatus, { chip: string; dot: string }> = {
		none: { chip: 'bg-white/6 text-fg-muted', dot: 'bg-fg-subtle' },
		active: { chip: 'bg-success/12 text-success', dot: 'bg-success' },
		paused: { chip: 'bg-white/8 text-fg-muted', dot: 'bg-fg-muted' },
		draft: { chip: 'bg-primary/16 text-primary-hover', dot: 'bg-primary' }
	};
</script>

<span
	class={[
		'inline-flex items-center gap-2 rounded-full px-3 py-1 text-[13px] font-semibold whitespace-nowrap',
		styles[status].chip
	]}
>
	<span class={['size-2 rounded-full', styles[status].dot]} aria-hidden="true"></span>
	{t(`reels.auto.status.${status}`)}
</span>
