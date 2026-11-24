type TrackPayload = Record<string, unknown>;

const headers = { 'content-type': 'application/json; charset=utf-8' };
const json = (body: unknown, status = 200) =>
	new Response(JSON.stringify(body), { status, headers });
const text = (value: unknown, max: number) =>
	String(value ?? '')
		.trim()
		.slice(0, max)
		.replace(/[\u0000-\u001f]/g, '');
const num = (value: unknown, max: number) => {
	const n = Number(value);
	return Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : 0;
};
const bool = (value: unknown) => value === true;
const iso = (value: unknown) => {
	const t = Date.parse(String(value ?? ''));
	return Number.isNaN(t) ? '' : new Date(t).toISOString();
};

export default async (request: Request) => {
	if (request.method !== 'POST') return json({ success: false }, 405);
	const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
	if (!appsScriptUrl) return json({ success: true, skipped: true });
	try {
		const raw = await request.text();
		if (raw.length > 4000) return json({ success: false }, 413);
		const p = JSON.parse(raw) as TrackPayload;
		const sessionId = text(p.sessionId, 64);
		if (!/^[\w-]{8,64}$/.test(sessionId)) return json({ success: false }, 400);
		const body = {
			type: 'track',
			sessionId,
			visitorId: text(p.visitorId, 64),
			returning: bool(p.returning),
			firstSeen: iso(p.firstSeen),
			lastSeen: iso(p.lastSeen),
			activeSeconds: num(p.activeSeconds, 86400),
			totalSeconds: num(p.totalSeconds, 86400),
			maxScroll: num(p.maxScroll, 100),
			formViewed: bool(p.formViewed),
			formStarted: bool(p.formStarted),
			maxStep: num(p.maxStep, 3),
			lastField: text(p.lastField, 60),
			submitted: bool(p.submitted),
			leadId: text(p.leadId, 64),
			device: text(p.device, 16),
			width: num(p.width, 10000),
			language: text(p.language, 16),
			referrer: text(p.referrer, 200),
			fbclid: text(p.fbclid, 240),
			fbp: text(p.fbp, 80),
			fbc: text(p.fbc, 240),
			reason: text(p.reason, 24)
		};
		const response = await fetch(appsScriptUrl, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
			signal: AbortSignal.timeout(10000)
		});
		if (!response.ok) return json({ success: false }, 502);
		return json({ success: true });
	} catch (error) {
		console.error('track failed', error instanceof Error ? error.message : 'unknown');
		return json({ success: false }, 502);
	}
};
