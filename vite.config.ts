import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const apiUrl = loadEnv(mode, process.cwd(), 'PUBLIC_').PUBLIC_API_URL;
	// Origem no formato `protocolo://host[:porta]`, como a CSP espera.
	const apiOrigin = apiUrl
		? (new URL(apiUrl).origin as `${string}://${string}.${string}` | `${string}://localhost`)
		: undefined;

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},

				// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
				// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
				// See https://svelte.dev/docs/kit/adapters for more information about adapters.
				adapter: adapter(),

				// Content Security Policy: mesmo que um XSS injete HTML, o navegador só
				// executa scripts do próprio app e só envia dados para a API configurada.
				csp: {
					mode: 'auto',
					directives: {
						'default-src': ['self'],
						'script-src': ['self'],
						// Svelte/Vite aplicam estilos inline; Google Fonts serve o CSS das fontes.
						'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
						'font-src': ['self', 'https://fonts.gstatic.com'],
						'img-src': ['self', 'data:'],
						'connect-src': ['self', ...(apiOrigin ? [apiOrigin] : [])],
						// O cliente de dev do Vite usa um SharedWorker via blob: (só em desenvolvimento).
						'worker-src': ['self', ...(mode === 'development' ? (['blob:'] as const) : [])],
						'object-src': ['none'],
						'base-uri': ['self'],
						'form-action': ['self'],
						'frame-ancestors': ['none']
					}
				}
			})
		]
	};
});
