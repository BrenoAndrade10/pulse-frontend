export const EMPTY_VALUE = '—';

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const integer = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const decimal = new Intl.NumberFormat('pt-BR', {
	minimumFractionDigits: 1,
	maximumFractionDigits: 2
});
const date = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });
const shortDate = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

type Value = number | null | undefined;

export const formatCurrency = (v: Value) => (v == null ? EMPTY_VALUE : currency.format(v));
export const formatNumber = (v: Value) => (v == null ? EMPTY_VALUE : integer.format(v));
export const formatRoas = (v: Value) => (v == null ? EMPTY_VALUE : `${decimal.format(v)}x`);

export function formatDelta(v: number) {
	const sign = v > 0 ? '+' : '';
	return `${sign}${decimal.format(v)}%`;
}

/** Datas no formato ISO (yyyy-mm-dd ou completo). */
export const formatDate = (iso: string) => date.format(new Date(iso));
export const formatShortDate = (iso: string) =>
	shortDate.format(new Date(`${iso.slice(0, 10)}T12:00:00`));

/** Converte entrada no padrão brasileiro ("1.234,56") em número. Vazio → null, inválido → NaN. */
export function parseDecimal(input: string): number | null {
	const value = input.trim();
	if (!value) return null;
	const normalized = value.replace(/\./g, '').replace(',', '.');
	return /^\d+(\.\d+)?$/.test(normalized) ? Number(normalized) : NaN;
}

/** Inverso de parseDecimal, para preencher inputs. */
export const toDecimalInput = (v: number | null) => (v == null ? '' : String(v).replace('.', ','));

export function initials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (!parts.length) return '?';
	const first = parts[0][0];
	const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
	return (first + last).toUpperCase();
}

const compactCurrency = new Intl.NumberFormat('pt-BR', {
	style: 'currency',
	currency: 'BRL',
	notation: 'compact',
	maximumFractionDigits: 1
});

/** Versão curta para eixos de gráfico (ex.: "R$ 6 mil"). */
export const formatCurrencyCompact = (v: number) => compactCurrency.format(v);

const relative = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['day', 86_400],
	['hour', 3_600],
	['minute', 60]
];

/** "agora mesmo", "há 5 minutos", "ontem"... */
export function formatRelativeTime(iso: string, now = Date.now()): string {
	const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
	if (Math.abs(seconds) < 60) return 'agora mesmo';

	for (const [unit, size] of RELATIVE_UNITS) {
		if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
	}
	return relative.format(seconds, 'second');
}
