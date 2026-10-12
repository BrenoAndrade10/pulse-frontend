import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_API_URL: {
		public: true,
		static: true,
		description: 'Origem da API (backend), ex.: http://localhost:3000',
		schema: (value) => {
			if (!value) throw new Error('Configure PUBLIC_API_URL com a URL da API.');

			const url = new URL(value);

			if (url.protocol !== 'https:' && url.protocol !== 'http:') {
				throw new Error('PUBLIC_API_URL deve usar http ou https.');
			}

			return url.origin;
		}
	}
});
