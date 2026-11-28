<script lang="ts">
	import { track } from '../analytics/index.ts';
	import type { FeatureId } from '../contract.ts';
	import { signup } from '../signup.svelte.ts';
	import { anchorClick } from './nav';

	type Props = {
		label: string;
		kind: 'scroll' | 'pricing' | 'signup';
		target?: string;
		ctaSource: string;
		featureId?: FeatureId;
		note?: string;
	};

	let { label, kind, target = 'planos', ctaSource, featureId, note }: Props = $props();

	function onClick(event: MouseEvent) {
		if (kind === 'signup') {
			signup.open({ source: ctaSource });
			return;
		}
		if (kind === 'pricing') {
			track('PricingClick', { ctaSource });
		} else {
			track('FeatureExplore', { featureId, scenario: 'intermediate_cta', ctaSource });
		}
		anchorClick(event, target);
	}
</script>

<div class="cl-icta">
	{#if kind === 'signup'}
		<button class="cl-icta-link" type="button" onclick={onClick}>
			<span>{label}</span><span aria-hidden="true">→</span>
		</button>
	{:else}
		<a class="cl-icta-link" href={`#${target}`} onclick={onClick}>
			<span>{label}</span><span aria-hidden="true">→</span>
		</a>
	{/if}
	{#if note}<small>{note}</small>{/if}
</div>

<style>
	.cl-icta {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 6px;
		margin-top: var(--cl-gap-4, 32px);
	}
	.cl-icta-link {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		padding: 10px 18px;
		border: 1px solid var(--cl-line2, #3a3a54);
		border-radius: 999px;
		background: transparent;
		color: var(--cl-fg, #f3f3f8);
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
		cursor: pointer;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease,
			gap 0.2s ease;
	}
	.cl-icta-link:focus-visible {
		outline: 2px solid var(--cl-violet-hi, #ad96ff);
		outline-offset: 3px;
	}
	small {
		color: var(--cl-dim, #8c8caa);
		font-size: 12px;
	}
	@media (hover: hover) {
		.cl-icta-link:hover {
			gap: 14px;
			border-color: var(--cl-violet-hi, #ad96ff);
			background: rgba(173, 150, 255, 0.08);
		}
	}
</style>
