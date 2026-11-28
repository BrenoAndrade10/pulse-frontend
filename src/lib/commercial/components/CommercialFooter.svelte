<script lang="ts">
	import { section } from '../analytics/index.ts';
</script>

<footer class="cl-footer" use:section={{ id: 'footer' }}>
	<div class="cl-wrap cl-footer-grid">
		<div>
			<img
				src="/brand/pulse-logo-white-trim.png"
				alt="Pulse Lead"
				width="100"
				height="32"
				loading="lazy"
				decoding="async"
			/>
			<p class="cl-signature">Pulse Lead. Rastreie. Entenda. Automatize. Venda.</p>
		</div>
		<nav class="cl-footer-links" aria-label="Documentos legais">
			<a href="/privacidade">Privacidade</a>
			<a href="/termos">Termos</a>
		</nav>
	</div>
	<div class="cl-wrap">
		<p class="cl-footer-note">
			Produto em desenvolvimento. As telas e dados exibidos são prévias conceituais com informações
			fictícias; funcionalidades, integrações e condições podem mudar.
		</p>
	</div>
</footer>
