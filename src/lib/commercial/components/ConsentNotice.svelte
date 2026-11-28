<script lang="ts">
	import { onMount } from 'svelte';
	import { getConsent, setConsent, type Consent } from '../analytics/index.ts';

	let consent = $state<Consent | null>(null);
	let ready = $state(false);

	onMount(() => {
		consent = getConsent();
		ready = true;
	});

	const answer = (value: Consent) => {
		consent = value;
		setConsent(value);
	};
</script>

{#if ready && consent === null}
	<div class="cl-cookie" role="region" aria-label="Preferências de cookies">
		<p>
			Usamos cookies para medir o uso da página e, com a sua autorização, para anúncios mais
			relevantes. <a href="/privacidade">Privacidade</a>
		</p>
		<div class="cl-cookie-actions">
			<button type="button" class="cl-cookie-deny" onclick={() => answer('denied')}>Recusar</button>
			<button type="button" class="cl-cookie-accept" onclick={() => answer('granted')}
				>Aceitar</button
			>
		</div>
	</div>
{/if}

<style>
	.cl-cookie {
		position: fixed;
		right: 12px;
		bottom: calc(12px + env(safe-area-inset-bottom));
		left: 12px;
		z-index: 90;
		display: flex;
		max-width: 720px;
		margin: 0 auto;
		padding: 10px 12px;
		align-items: center;
		gap: 12px;
		border: 1px solid #2a2338;
		border-radius: 14px;
		background: #12101c;
		box-shadow: 0 12px 40px rgb(0 0 0 / 0.5);
		color: #cfc9dc;
		font-size: 12px;
		line-height: 1.4;
	}
	.cl-cookie p {
		margin: 0;
	}
	.cl-cookie a {
		color: #b692ff;
		text-decoration: underline;
	}
	.cl-cookie-actions {
		display: flex;
		flex-shrink: 0;
		gap: 8px;
	}
	.cl-cookie-actions button {
		min-height: 36px;
		padding: 0 14px;
		border-radius: 9px;
		font-size: 12.5px;
		font-weight: 700;
		cursor: pointer;
	}
	.cl-cookie-actions button:focus-visible {
		outline: 2px solid #b692ff;
		outline-offset: 2px;
	}
	.cl-cookie-deny {
		border: 1px solid #34304a;
		background: transparent;
		color: #cfc9dc;
	}
	.cl-cookie-accept {
		border: 0;
		background: linear-gradient(90deg, #7045ff, #b05cf0);
		color: #fff;
	}
	@media (max-width: 560px) {
		.cl-cookie {
			flex-direction: column;
			align-items: stretch;
			gap: 8px;
		}
		.cl-cookie-actions button {
			flex: 1;
		}
	}
</style>
