<script lang="ts">
	import Icon from '../Icon.svelte';
	import { reveal } from '../motion';

	let {
		channel,
		icon,
		kicker,
		title,
		desc
	}: {
		channel: 'instagram' | 'email' | 'whatsapp';
		icon: string;
		kicker: string;
		title: string;
		desc: string;
	} = $props();
</script>

<header class="cl-ch-head cl-ch-{channel}" use:reveal>
	<span class="cl-ch-ico"><Icon name={icon} size={18} /></span>
	<div class="cl-ch-copy">
		<p class="cl-ch-kicker">{kicker}</p>
		<h3>{title}</h3>
	</div>
	<p class="cl-ch-desc">{desc}</p>
</header>
