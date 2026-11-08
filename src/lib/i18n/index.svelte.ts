import { browser } from '$app/env';
import { DEFAULT_LOCALE, LOCALES, LOCALE_STORAGE_KEY, isLocale, type Locale } from './locales.js';
import { messages, type Messages } from './messages/index.js';
import type { DotPaths, PluralForms } from './types.js';

export type MessageKey = DotPaths<Messages>;
export type MessageParams = Record<string, string | number>;

const state = $state<{ locale: Locale }>({ locale: DEFAULT_LOCALE });

function readStored(): Locale | null {
	try {
		const stored = localStorage.getItem(LOCALE_STORAGE_KEY);

		return isLocale(stored) ? stored : null;
	} catch {
		return null;
	}
}

function apply(locale: Locale): void {
	state.locale = locale;
	if (browser) document.documentElement.lang = locale;
}

export const i18n = {
	get locale(): Locale {
		return state.locale;
	},
	get intl(): string {
		return LOCALES.find((item) => item.code === state.locale)?.intl ?? DEFAULT_LOCALE;
	},
	init(): void {
		if (!browser) return;
		apply(readStored() ?? DEFAULT_LOCALE);
	},
	set(locale: Locale): void {
		apply(locale);
		if (!browser) return;

		try {
			localStorage.setItem(LOCALE_STORAGE_KEY, locale);
		} catch {
			return;
		}
	}
};

function lookup(locale: Locale, key: string): string | PluralForms | undefined {
	let node: unknown = messages[locale];

	for (const part of key.split('.')) {
		if (typeof node !== 'object' || node === null) return undefined;
		node = (node as Record<string, unknown>)[part];
	}

	if (typeof node === 'string') return node;
	if (typeof node === 'object' && node !== null && 'one' in node && 'other' in node) {
		return node as PluralForms;
	}

	return undefined;
}

export function t(key: MessageKey, params?: MessageParams): string {
	const locale = state.locale;
	const value = lookup(locale, key) ?? lookup(DEFAULT_LOCALE, key) ?? key;
	const template =
		typeof value === 'string'
			? value
			: new Intl.PluralRules(locale).select(Number(params?.count ?? 0)) === 'one'
				? value.one
				: value.other;

	return params
		? template.replace(/\{(\w+)\}/g, (match, name: string) =>
				name in params ? String(params[name]) : match
			)
		: template;
}
