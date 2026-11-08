export const LOCALES = [
	{ code: 'pt-BR', label: 'Português', flag: '🇧🇷', intl: 'pt-BR' },
	{ code: 'es', label: 'Español', flag: '🇪🇸', intl: 'es' },
	{ code: 'en', label: 'English', flag: '🇺🇸', intl: 'en' }
] as const;

export type Locale = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export const LOCALE_STORAGE_KEY = 'pulse:locale';

export function isLocale(value: unknown): value is Locale {
	return LOCALES.some((locale) => locale.code === value);
}

export function matchLocale(candidates: readonly string[]): Locale | null {
	for (const candidate of candidates) {
		const language = candidate.toLowerCase().split('-')[0];
		const match = LOCALES.find((locale) => locale.code.toLowerCase().split('-')[0] === language);
		if (match) return match.code;
	}

	return null;
}
