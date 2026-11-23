import { apiRequest } from '#lib/api/client.js';

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'canceled' | 'failed';
export type CampaignBand = 'hot' | 'warm' | 'cold' | 'none';
export type CampaignLocale = 'pt' | 'en' | 'es';
export type AutomationStatus = 'active' | 'paused' | 'draft';
export type AutomationTrigger = 'newLead' | 'becameHot' | 'clickedLink' | 'inactive';
export type RecordState = 'ok' | 'pending' | 'recommended';
export type DnsRecord = {
	type: 'CNAME' | 'MX' | 'TXT';
	name: string;
	value: string;
	state: RecordState;
};

export type Campaign = {
	id: string;
	name: string;
	subject: string;
	bodyHtml: string | null;
	locale: CampaignLocale;
	bands: CampaignBand[];
	status: CampaignStatus;
	scheduledAt: string | null;
	startedAt: string | null;
	completedAt: string | null;
	failureReason: string | null;
	recipients: number | null;
	sent: number;
	pending: number;
	failed: number;
	suppressed: number;
	progress: number | null;
	createdAt: string;
};

export type CampaignInput = {
	name: string;
	subject: string;
	bodyHtml: string;
	locale: CampaignLocale;
	bands: CampaignBand[];
	scheduledAt: string | null;
	draft: boolean;
};

export type EmailAutomation = {
	id: string;
	name: string;
	trigger: AutomationTrigger;
	status: AutomationStatus;
	sent: number;
	clickRate: number | null;
};

export type EmailSettings = {
	domain: string;
	verified: boolean;
	records: DnsRecord[];
	senderName: string;
	senderLocal: string;
	replyTo: string;
	health: {
		bounce: number;
		complaint: number;
		bounceLimit: number;
		complaintLimit: number;
		active: boolean;
	};
	limits: { today: number; cap: number; day: number; totalDays: number; nextCap: number };
	suppressions: { unsubscribed: number; bounced: number; complaints: number };
};

const wait = (ms = 220) => new Promise<void>((resolve) => setTimeout(resolve, ms));
let automations: EmailAutomation[] = [];

export async function listAutomations(): Promise<EmailAutomation[]> {
	await wait();
	return structuredClone(automations);
}

export async function setAutomationActive(id: string, active: boolean): Promise<EmailAutomation> {
	await wait(300);
	automations = automations.map((item) =>
		item.id === id ? { ...item, status: active ? 'active' : 'paused' } : item
	);
	return structuredClone(automations.find((item) => item.id === id)!);
}

const emailPath = (expertId: string) => `/experts/${encodeURIComponent(expertId)}/email`;

export function getEmailSettings(expertId: string): Promise<EmailSettings> {
	return apiRequest<EmailSettings>(`${emailPath(expertId)}/settings`);
}

export function saveDomain(expertId: string, domain: string): Promise<EmailSettings> {
	return apiRequest<EmailSettings>(`${emailPath(expertId)}/domain`, {
		method: 'PUT',
		body: { domain }
	});
}

export function verifyDomain(expertId: string): Promise<EmailSettings> {
	return apiRequest<EmailSettings>(`${emailPath(expertId)}/domain/verify`, { method: 'POST' });
}

export function saveSender(
	expertId: string,
	input: { senderName: string; senderLocal: string; replyTo: string }
): Promise<EmailSettings> {
	return apiRequest<EmailSettings>(`${emailPath(expertId)}/sender`, {
		method: 'PUT',
		body: { ...input, replyTo: input.replyTo.trim() || null }
	});
}

export async function sendTestEmail(expertId: string, to: string): Promise<void> {
	await apiRequest<void>(`${emailPath(expertId)}/test`, { method: 'POST', body: { to } });
}

export function listCampaigns(expertId: string): Promise<Campaign[]> {
	return apiRequest<Campaign[]>(`${emailPath(expertId)}/campaigns`);
}

export function getCampaign(expertId: string, id: string): Promise<Campaign> {
	return apiRequest<Campaign>(`${emailPath(expertId)}/campaigns/${encodeURIComponent(id)}`);
}

export function saveCampaign(
	expertId: string,
	input: CampaignInput,
	campaignId?: string
): Promise<Campaign> {
	return apiRequest<Campaign>(
		campaignId
			? `${emailPath(expertId)}/campaigns/${encodeURIComponent(campaignId)}`
			: `${emailPath(expertId)}/campaigns`,
		{ method: campaignId ? 'PUT' : 'POST', body: input }
	);
}

export async function cancelCampaign(expertId: string, id: string): Promise<void> {
	await apiRequest<void>(`${emailPath(expertId)}/campaigns/${encodeURIComponent(id)}/cancel`, {
		method: 'POST'
	});
}
