export type ConnectionStatus = 'disconnected' | 'connected' | 'expired';

export type ExpertConnection = {
	status: ConnectionStatus;
	/** Nome da conta autorizada (ex.: @usuario da conta profissional do Instagram). */
	accountName: string | null;
	connectedAt: string | null;
};

export type IntegrationChannel = 'instagram' | 'meta-ads' | 'whatsapp';

export type WhatsAppQualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export type WhatsAppConnection =
	| { status: 'disconnected' }
	| {
			status: 'connected';
			phoneNumberId: string;
			displayPhoneNumber: string;
			verifiedName: string;
			qualityRating: WhatsAppQualityRating;
			connectedAt: string;
	  };

export type ExpertStatus = 'active' | 'inactive';

export type Expert = {
	id: string;
	name: string;
	email: string;
	commercialName: string | null;
	status: ExpertStatus;
	instagram: ExpertConnection;
	createdAt: string;
	updatedAt: string;
};

export type ExpertInput = Pick<Expert, 'name' | 'email' | 'commercialName'>;

export type InstagramPost = {
	id: string;
	caption?: string;
	mediaType?: string;
	mediaProductType?: string;
	mediaUrl?: string;
	permalink?: string;
	thumbnailUrl?: string;
	timestamp?: string;
	commentsCount?: number;
	likeCount?: number;
	/** Itens do carrossel, na ordem em que aparecem no Instagram. */
	children?: InstagramMediaChild[];
};

export type InstagramMediaChild = {
	id: string;
	mediaType?: string;
	mediaUrl?: string;
	thumbnailUrl?: string;
};

export type InstagramPostsPage = {
	expertId: string;
	instagram: { userId: string; username: string | null };
	data: InstagramPost[];
	paging: { before?: string; after?: string } | null;
};

/** DM automática de um Reel: comentário com a palavra-chave recebe a mensagem. */
export type CommentAutomation = {
	id: string;
	mediaId: string;
	keywords: string[];
	message: string;
	/** Botão de link na DM. */
	button: { label: string; url: string } | null;
	/** Resposta pública ao comentário, publicada depois que a DM sai. */
	commentReply: string | null;
	isActive: boolean;
	sentCount: number;
	lastSentAt: string | null;
	updatedAt: string;
};

export type CommentAutomationInput = Pick<
	CommentAutomation,
	'keywords' | 'message' | 'button' | 'commentReply' | 'isActive'
>;

export type LaunchStatus =
	'draft' | 'planned' | 'in_progress' | 'completed' | 'canceled' | 'archived';

export type LaunchType = 'internal' | 'seed' | 'perpetual' | 'webinar' | 'other';

export type Launch = {
	id: string;
	expertId: string;
	name: string;
	description: string | null;
	status: LaunchStatus;
	type: LaunchType;
	startsAt: string | null;
	endsAt: string | null;
	timezone: string;
	createdAt: string;
	updatedAt: string;
};

export type LaunchInput = Pick<
	Launch,
	'expertId' | 'name' | 'description' | 'status' | 'type' | 'startsAt' | 'endsAt' | 'timezone'
>;

export type LinkChannel = 'instagram' | 'whatsapp' | 'telegram' | 'email' | 'ads' | 'other';
export type LinkPurpose = 'content' | 'capture' | 'event' | 'offer' | 'checkout' | 'other';
export type LinkStatus = 'active' | 'inactive';
export type Link = {
	id: string;
	expertId: string | null;
	launchId: string | null;
	name: string;
	destinationUrl: string;
	code: string;
	shortUrl: string;
	channel: LinkChannel | null;
	placement: string | null;
	campaign: string | null;
	utm: {
		source: string | null;
		medium: string | null;
		campaign: string | null;
		content: string | null;
		term: string | null;
	};
	purpose: LinkPurpose;
	status: LinkStatus;
	destinationVersion: number;
	createdAt: string;
	updatedAt: string;
};
export type CreateLinkInput = {
	name: string;
	destinationUrl: string;
	channel?: LinkChannel;
	purpose?: LinkPurpose;
	placement?: string;
	campaign?: string;
	utm?: Partial<Link['utm']>;
	expertId?: string;
	launchId?: string;
};

export type LinkListParams = {
	expertId?: string;
	launchId?: string;
	channel?: LinkChannel;
	status?: LinkStatus;
	search?: string;
	limit?: number;
	cursor?: string;
};

export type LinkPage = { data: Link[]; nextCursor: string | null };

export type LinkUpdateInput = {
	name?: string;
	destinationUrl?: string;
	status?: LinkStatus;
	purpose?: LinkPurpose;
	channel?: LinkChannel;
	placement?: string | null;
	campaign?: string | null;
	utm?: Partial<Link['utm']>;
	expertId?: string | null;
	launchId?: string | null;
	regenerateUtm?: boolean;
};

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

export type TrackingInstallation = {
	status: 'waiting' | 'installed';
	/** Último evento recebido de qualquer página do pixel. */
	lastEventAt: string | null;
};

export type TrackingPage = {
	url: string;
	eventsCount: number;
	updatedAt: string;
	/** Lançamento dos cadastros da página; sem ele vale o lançamento em andamento. */
	launchId: string | null;
};

export type TrackingPixel = {
	id: string;
	/** Chave pública que vai no script; não é segredo. */
	publicKey: string;
	scriptUrl: string;
	allowedDomains: string[];
	installation: TrackingInstallation;
	pages: TrackingPage[];
};

export type WhatsAppDestination =
	{ type: 'private' } | { type: 'group'; groupId: string; groupName: string };

export type WhatsAppButton =
	| { id: string; type: 'quick_reply'; label: string; reply: string }
	| { id: string; type: 'url'; label: string; url: string };

export type WhatsAppMessage = {
	header: string;
	body: string;
	footer: string;
	buttons: WhatsAppButton[];
};

export type WhatsAppAutomation = {
	id: string;
	expertId: string;
	name: string;
	eventName: string;
	launchId: string | null;
	destination: WhatsAppDestination;
	delay: { value: number; unit: 'minutes' | 'hours' } | null;
	message: WhatsAppMessage;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type WhatsAppAutomationInput = Omit<
	WhatsAppAutomation,
	'id' | 'expertId' | 'createdAt' | 'updatedAt'
>;

export type WhatsAppGroup = {
	id: string;
	name: string;
};

export type LeadUtm = {
	source?: string;
	medium?: string;
	campaign?: string;
	content?: string;
	term?: string;
};

export type LeadLaunch = {
	launchId: string;
	firstSubmittedAt: string;
	lastSubmittedAt: string;
	submissionsCount: number;
	firstUtm: LeadUtm;
};

export type LeadHeatBand = 'cold' | 'warm' | 'hot';

export type LeadHeat = {
	score: number;
	band: LeadHeatBand;
	calculatedAt: string | null;
};

export type LeadHeatDay = {
	day: string;
	pageViews: number;
	engagedSeconds: number;
	maxScroll: number;
	interactions: number;
	leads: number;
	linkClicks: number;
};

export type LeadHeatDetail = {
	score: number;
	band: LeadHeatBand;
	hasIdentity: boolean;
	timezone: string;
	windowDays: number;
	lastActivityDay: string | null;
	days: LeadHeatDay[];
};

export type Lead = {
	id: string;
	name: string | null;
	email: string | null;
	phone: string | null;
	custom: Record<string, string>;
	consent: boolean | null;
	firstSeenAt: string;
	lastSeenAt: string;
	launches: LeadLaunch[];
	heat: LeadHeat;
};

export type LeadsPage = {
	data: Lead[];
	/** Total do filtro; vem só na primeira página. */
	total: number | null;
	nextCursor: string | null;
};
