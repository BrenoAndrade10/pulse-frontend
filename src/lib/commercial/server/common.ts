export const jsonHeaders = {
	'content-type': 'application/json; charset=utf-8',
	'cache-control': 'no-store'
};

export const json = (body: unknown, status = 200): Response =>
	new Response(JSON.stringify(body), { status, headers: jsonHeaders });

export const cleanText = (value: unknown, max: number): string =>
	String(value ?? '')
		.split('')
		.filter((char) => char.charCodeAt(0) >= 32 && char.charCodeAt(0) !== 127)
		.join('')
		.trim()
		.slice(0, max);

export const cleanId = (value: unknown, pattern: RegExp, max = 64): string => {
	const text = cleanText(value, max);
	return pattern.test(text) ? text : '';
};

export const ID_PATTERN = /^[\w-]{8,64}$/;
export const SLUG_PATTERN = /^[\w.:-]{1,64}$/;

export const toInt = (value: unknown, min: number, max: number): number => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : min;
};

export const toBool = (value: unknown): boolean => value === true;

export const toMoney = (value: unknown, max = 1000000): number | undefined => {
	if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max)
		return undefined;
	return Math.round(value * 100) / 100;
};

export const toIso = (value: unknown, now: number, pastMs = 7 * 86400000, futureMs = 600000) => {
	const t = Date.parse(String(value ?? ''));
	if (Number.isNaN(t)) return '';
	if (t < now - pastMs || t > now + futureMs) return new Date(now).toISOString();
	return new Date(t).toISOString();
};

export const formulaSafe = (value: string): string =>
	/^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

const STATIC_ORIGINS = new Set(['https://usepulselead.com', 'https://www.usepulselead.com']);

const originOf = (value: string): string => {
	try {
		return new URL(value).origin;
	} catch {
		return '';
	}
};

export const isOriginAllowed = (
	origin: string,
	referer: string,
	env: Record<string, string | undefined>
): boolean => {
	const candidate = origin && origin !== 'null' ? origin : originOf(referer);
	if (!candidate) return false;
	if (STATIC_ORIGINS.has(candidate)) return true;
	const configured = [env.PUBLIC_SITE_URL, env.URL, env.DEPLOY_URL, env.DEPLOY_PRIME_URL]
		.map((v) => (v ? originOf(v) : ''))
		.filter(Boolean);
	if (configured.includes(candidate)) return true;
	let url: URL;
	try {
		url = new URL(candidate);
	} catch {
		return false;
	}
	if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return true;
	return url.protocol === 'https:' && /^[a-z0-9-]+--[a-z0-9-]+\.netlify\.app$/.test(url.hostname);
};

export const createRateLimiter = (limit: number, windowMs: number, maxKeys = 5000) => {
	const hits = new Map<string, { count: number; resetAt: number }>();
	return (key: string, now: number = Date.now()): boolean => {
		if (hits.size > maxKeys) {
			for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
			if (hits.size > maxKeys) hits.clear();
		}
		const entry = hits.get(key);
		if (!entry || entry.resetAt <= now) {
			hits.set(key, { count: 1, resetAt: now + windowMs });
			return true;
		}
		entry.count += 1;
		return entry.count <= limit;
	};
};

export const clientIp = (request: Request): string =>
	cleanText(
		request.headers.get('x-nf-client-connection-ip') ||
			(request.headers.get('x-forwarded-for') ?? '').split(',')[0] ||
			'unknown',
		64
	);

type AppsScriptData = { success?: boolean; leadId?: string; duplicate?: boolean; message?: string };

export const callAppsScript = async (
	url: string,
	body: unknown
): Promise<{
	ok: boolean;
	data: { success?: boolean; leadId?: string; duplicate?: boolean; message?: string };
}> => {
	const response = await fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(12000)
	});
	let data: AppsScriptData;
	try {
		data = JSON.parse(await response.text()) as AppsScriptData;
	} catch {
		data = {};
	}
	return { ok: response.ok && data.success === true, data };
};
