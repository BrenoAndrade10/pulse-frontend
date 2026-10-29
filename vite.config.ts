import adapter from '@sveltejs/adapter-netlify';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	const apiUrl = loadEnv(mode, process.cwd(), 'PUBLIC_').PUBLIC_API_URL;
	const apiOrigin = apiUrl
		? (new URL(apiUrl).origin as `${string}://${string}.${string}` | `${string}://localhost`)
		: undefined;

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				compilerOptions: {
					runes: ({ filename }) =>
						filename.split(/[/\\]/).includes('node_modules') ? undefined : true
				},

				adapter: adapter(),
				csp: {
					mode: 'auto',
					directives: {
						'default-src': ['self'],
						'script-src': ['self', 'https://connect.facebook.net'],
						// Svelte/Vite aplicam estilos inline; Google Fonts serve o CSS das fontes.
						'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
						'font-src': ['self', 'https://fonts.gstatic.com'],
						// Fotos e vídeos do Instagram vêm pelo proxy da API, nunca direto da Meta.
						'img-src': ['self', 'data:', ...(apiOrigin ? [apiOrigin] : [])],
						'media-src': ['self', ...(apiOrigin ? [apiOrigin] : [])],
						'connect-src': [
							'self',
							'https://graph.facebook.com',
							'https://connect.facebook.net',
							...(apiOrigin ? [apiOrigin] : [])
						],
						'frame-src': ['https://www.facebook.com', 'https://web.facebook.com'],
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
