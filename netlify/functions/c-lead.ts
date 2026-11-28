import { createHash } from 'node:crypto';
import { OPERATION_TYPES } from '../../src/lib/commercial/contract.ts';
import {
	callAppsScript,
	clientIp,
	cleanId,
	cleanText,
	createRateLimiter,
	formulaSafe,
	isOriginAllowed,
	json,
	SLUG_PATTERN,
	toBool,
	toMoney
} from '../../src/lib/commercial/server/common.ts';
import { sanitizeAttribution } from './c-track.ts';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LEAD_KEY_PATTERN = /^[\w-]{16,64}$/;
const ID_PATTERN = /^[\w-]{8,64}$/;
const VERSION_PATTERN = /^[\w.-]{1,40}$/;
const MAX_BODY_BYTES = 8000;

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);

export const deriveLeadId = (leadKey: string): string =>
	`ld_${createHash('sha256').update(`pulse-lead:${leadKey}`).digest('hex').slice(0, 24)}`;

export const normalizeEmail = (value: unknown): string => {
	const email = cleanText(value, 180).toLowerCase();
	return EMAIL_PATTERN.test(email) ? email : '';
};

export const normalizePhone = (value: unknown): string => {
	const raw = cleanText(value, 32).replace(/[^\d+]/g, '');
	if (!raw) return '';
	let digits: string;
	let plus = false;
	if (raw.startsWith('+')) {
		plus = true;
		digits = raw.replace(/\D/g, '');
	} else {
		digits = raw.replace(/\D/g, '');
		if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
	}
	if (!plus && digits.length < 12) return '';
	if (digits.length < 10 || digits.length > 15) return '';
	return `+${digits}`;
};

export type CreateResult =
	| { kind: 'ignored'; leadId: string }
	| { kind: 'invalid'; reason: string }
	| { kind: 'ok'; leadId: string; body: Obj };

export const buildCreate = (payload: unknown, now: Date = new Date()): CreateResult => {
	if (!isObj(payload)) return { kind: 'invalid', reason: 'INVALID_BODY' };
	const leadKey = cleanText(payload.leadKey, 64);
	if (!LEAD_KEY_PATTERN.test(leadKey)) return { kind: 'invalid', reason: 'INVALID_LEAD_KEY' };
	const leadId = deriveLeadId(leadKey);
	if (cleanText(payload.website, 200)) return { kind: 'ignored', leadId };
	const email = normalizeEmail(payload.email);
	if (!email) return { kind: 'invalid', reason: 'INVALID_EMAIL' };
	const attribution = sanitizeAttribution(payload.attribution);
	const price = toMoney(payload.displayedPrice);
	return {
		kind: 'ok',
		leadId,
		body: {
			leadId,
			createdAt: now.toISOString(),
			email: formulaSafe(email),
			planId: formulaSafe(cleanId(payload.planId, SLUG_PATTERN, 40)),
			displayedPrice: price ?? '',
			currency: /^[A-Z]{3}$/.test(String(payload.currency ?? '')) ? String(payload.currency) : '',
			source: formulaSafe(cleanId(payload.source, SLUG_PATTERN, 60)),
			commsConsent: toBool(payload.commsConsent),
			privacyVersion: cleanId(payload.privacyVersion, VERSION_PATTERN, 40),
			sessionId: cleanId(payload.sessionId, ID_PATTERN),
			visitorId: cleanId(payload.visitorId, ID_PATTERN),
			isTest: toBool(payload.isTest),
			attribution: Object.fromEntries(
				Object.entries(attribution).map(([k, v]) => [k, formulaSafe(v)])
			)
		}
	};
};

export type UpdateResult =
	{ kind: 'invalid'; reason: string } | { kind: 'ok'; leadId: string; body: Obj };

export const buildUpdate = (payload: unknown, now: Date = new Date()): UpdateResult => {
	if (!isObj(payload)) return { kind: 'invalid', reason: 'INVALID_BODY' };
	const leadKey = cleanText(payload.leadKey, 64);
	if (!LEAD_KEY_PATTERN.test(leadKey)) return { kind: 'invalid', reason: 'INVALID_LEAD_KEY' };
	const phoneRaw = cleanText(payload.whatsapp, 32);
	const phone = normalizePhone(phoneRaw);
	if (phoneRaw && !phone) return { kind: 'invalid', reason: 'INVALID_PHONE' };
	const operationType =
		typeof payload.operationType === 'string' &&
		(OPERATION_TYPES as readonly string[]).includes(payload.operationType)
			? payload.operationType
			: '';
	const leadId = deriveLeadId(leadKey);
	return {
		kind: 'ok',
		leadId,
		body: {
			leadId,
			updatedAt: now.toISOString(),
			name: formulaSafe(cleanText(payload.name, 120)),
			whatsapp: formulaSafe(phone),
			operationType,
			demoInterest: toBool(payload.demoInterest),
			commsConsent: toBool(payload.commsConsent)
		}
	};
};

const allow = createRateLimiter(20, 60000);

export default async (request: Request) => {
	if (request.method !== 'POST') return json({ success: false }, 405);
	if (
		!isOriginAllowed(
			request.headers.get('origin') ?? '',
			request.headers.get('referer') ?? '',
			process.env
		)
	)
		return json({ success: false }, 403);
	if (!allow(clientIp(request))) return json({ success: false, reason: 'RATE_LIMITED' }, 429);
	try {
		const raw = await request.text();
		if (raw.length > MAX_BODY_BYTES) return json({ success: false }, 413);
		let payload: unknown;
		try {
			payload = JSON.parse(raw);
		} catch {
			return json({ success: false, reason: 'INVALID_BODY' }, 400);
		}
		const action = isObj(payload) ? payload.action : '';
		if (action !== 'create' && action !== 'update')
			return json({ success: false, reason: 'INVALID_ACTION' }, 400);
		const built = action === 'create' ? buildCreate(payload) : buildUpdate(payload);
		if (built.kind === 'invalid') return json({ success: false, reason: built.reason }, 400);
		if (built.kind === 'ignored')
			return json({ success: true, leadId: built.leadId, ignored: true });
		const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
		const secret = process.env.COMMERCIAL_SHARED_SECRET;
		if (!appsScriptUrl || !secret) {
			if (process.env.NETLIFY_DEV === 'true')
				return json({ success: true, leadId: built.leadId, skipped: true });
			console.error('c-lead not configured');
			return json({ success: false, reason: 'NOT_CONFIGURED' }, 503);
		}
		const result = await callAppsScript(appsScriptUrl, {
			type: action === 'create' ? 'c_lead' : 'c_lead_update',
			secret,
			...built.body
		});
		if (!result.ok) return json({ success: false, reason: 'PERSIST_FAILED' }, 502);
		return json({
			success: true,
			leadId: built.leadId,
			duplicate: result.data.duplicate === true
		});
	} catch (error) {
		console.error('c-lead failed', error instanceof Error ? error.message : 'unknown');
		return json({ success: false, reason: 'PERSIST_FAILED' }, 502);
	}
};
