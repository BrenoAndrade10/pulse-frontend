export type FacebookConnectionStatus = 'disconnected' | 'connected' | 'expired';

export type FacebookConnection = {
	status: FacebookConnectionStatus;
	/** Nome do perfil/Business Manager autorizado na Meta. */
	accountName: string | null;
	connectedAt: string | null;
};

export type ExpertGoals = {
	roas: number | null;
	maxCpl: number | null;
	dailyBudget: number | null;
};

export type Expert = {
	id: string;
	name: string;
	email: string;
	niche: string;
	instagram: string;
	/** ID da conta de anúncios no formato act_123456789. */
	adAccountId: string;
	pixelId: string;
	goals: ExpertGoals;
	facebook: FacebookConnection;
	createdAt: string;
};

export type ExpertInput = Omit<Expert, 'id' | 'createdAt' | 'facebook'>;

export type Period = '7d' | '30d' | '90d';

export type MetricKey = 'spend' | 'revenue' | 'roas' | 'leads' | 'cpl' | 'sales';

export type Metrics = Record<MetricKey, number | null>;

export type DailyPoint = { date: string; spend: number; revenue: number };

export type ExpertPerformance = {
	expertId: string;
	name: string;
	spend: number;
	revenue: number;
	roas: number | null;
	leads: number;
	cpl: number | null;
};

export type DashboardData = {
	totals: Metrics;
	/** Variação percentual em relação ao período anterior (ex.: 12.5 = +12,5%). */
	deltas: Metrics;
	series: DailyPoint[];
	byExpert: ExpertPerformance[];
};
