<script lang="ts">
	import { APP_NAME } from '#lib/config.js';
</script>

<span
	class="inline-flex items-center gap-2.5 text-[19px] font-extrabold tracking-[-0.02em] text-fg"
>
	<span
		class={[
			'grid size-8.5 place-items-center rounded-[10px]',
			'bg-gradient-brand shadow-[0_6px_18px_-6px_rgb(192_77_255/0.7)]'
		]}
		aria-hidden="true"
	>
		<svg
			viewBox="0 0 24 24"
			class="size-5 fill-none stroke-white stroke-[2.4] [stroke-linecap:round] [stroke-linejoin:round]"
			><path d="M3 13h4l2.5-6 4 11 2.5-5H21" /></svg
		>
	</span>
	<span>{APP_NAME}</span>
</span>
