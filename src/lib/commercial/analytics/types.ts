import type {
	DemoType,
	EventName,
	FeatureId,
	OperationType,
	ScenarioId,
	SectionId
} from '../contract.ts';

export type WireAttribution = {
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	utm_content?: string;
	utm_term?: string;
	campaign_id?: string;
	adset_id?: string;
	ad_id?: string;
	fbclid?: string;
	referrer?: string;
	fbp?: string;
	fbc?: string;
};

export type WireEvent = {
	eventId: string;
	eventName: EventName;
	occurredAt: string;
	sequenceNumber: number;
	sessionId: string;
	visitorId: string;
	pageviewId: string;
	featureId?: FeatureId;
	sectionId?: SectionId;
	operationType?: OperationType;
	planId?: string;
	displayedPrice?: number;
	currency?: string;
	ctaSource?: string;
	scenario?: ScenarioId;
	demoType?: DemoType;
	step?: number;
	maxStep?: number;
	totalSteps?: number;
	durationMs?: number;
	detail?: string;
	value?: number | string | boolean;
	attribution: WireAttribution;
	device: 'mobile' | 'tablet' | 'desktop';
	viewport: { w: number; h: number };
	language: string;
	experimentVersion: string;
	pageVersion: string;
	isTest: boolean;
	automated: boolean;
};

export type DemoStat = {
	demoType: DemoType;
	operationType: OperationType | '';
	scenario: ScenarioId | '';
	plays: number;
	progress: number;
	maxStep: number;
	completed: number;
	replays: number;
};

export type WireSnapshot = {
	sessionId: string;
	visitorId: string;
	returning: boolean;
	firstActivityAt: string;
	lastActivityAt: string;
	activeSeconds: number;
	totalSeconds: number;
	maxScroll: number;
	scrollable: boolean;
	startedHidden: boolean;
	attribution: WireAttribution;
	device: 'mobile' | 'tablet' | 'desktop';
	viewport: { w: number; h: number };
	language: string;
	featuresViewed: FeatureId[];
	featuresExplored: FeatureId[];
	operationType: OperationType | '';
	demoInteractions: number;
	demoStats: DemoStat[];
	scenariosExplored: ScenarioId[];
	viewedPricing: boolean;
	commercialInterest: boolean;
	planId: string;
	signupStarted: boolean;
	signupCompleted: boolean;
	demoInterest: boolean;
	isTest: boolean;
	automated: boolean;
	experimentVersion: string;
	pageVersion: string;
};

export type Aggregates = {
	viewed: FeatureId[];
	explored: FeatureId[];
	op: OperationType | '';
	demo: number;
	demos: DemoStat[];
	scenarios: ScenarioId[];
	price: boolean;
	interest: boolean;
	plan: string;
	started: boolean;
	done: boolean;
	demoInt: boolean;
	maxScroll: number;
};

export const emptyAggregates = (): Aggregates => ({
	viewed: [],
	explored: [],
	op: '',
	demo: 0,
	demos: [],
	scenarios: [],
	price: false,
	interest: false,
	plan: '',
	started: false,
	done: false,
	demoInt: false,
	maxScroll: 0
});
