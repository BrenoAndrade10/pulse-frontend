export const LOCALES = [
	{ code: 'pt-BR', label: 'Português', intl: 'pt-BR' },
	{ code: 'es', label: 'Español', intl: 'es' },
	{ code: 'en', label: 'English', intl: 'en' }
] as const;

export type Locale = (typeof LOCALES)[number]['code'];

export const DEFAULT_LOCALE: Locale = 'pt-BR';

export const LOCALE_STORAGE_KEY = 'pulse:locale';

export function isLocale(value: unknown): value is Locale {
	return LOCALES.some((locale) => locale.code === value);
}
