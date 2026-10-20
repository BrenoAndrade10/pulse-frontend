import type { DashboardData, Metrics, Period } from '#lib/types.js';

export const PERIODS: { value: Period; label: string }[] = [
	{ value: '7d', label: '7 dias' },
	{ value: '30d', label: '30 dias' },
	{ value: '90d', label: '90 dias' }
];

export const DEFAULT_PERIOD: Period = '30d';

export function parsePeriod(value: string | null): Period {
	return PERIODS.some((p) => p.value === value) ? (value as Period) : DEFAULT_PERIOD;
}

const emptyMetrics = (): Metrics => ({
	spend: null,
	revenue: null,
	roas: null,
	leads: null,
	cpl: null,
	sales: null
});

export type DashboardFilters = {
	period: Period;
	expertId: string | null;
	launchId: string | null;
};

export async function getDashboard(filters: DashboardFilters): Promise<DashboardData> {
	// TODO: buscar da API. Sem integração com a Meta ainda não existem dados.
	void filters;
	return { totals: emptyMetrics(), deltas: emptyMetrics(), series: [], byExpert: [] };
}
