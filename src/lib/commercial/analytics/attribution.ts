export type Attribution = {
	utm_source: string;
	utm_medium: string;
	utm_campaign: string;
	utm_content: string;
	utm_term: string;
	campaign_id: string;
	adset_id: string;
	ad_id: string;
	fbclid: string;
	referrer: string;
};

export const ATTRIBUTION_KEYS = [
	'utm_source',
	'utm_medium',
	'utm_campaign',
	'utm_content',
	'utm_term',
	'campaign_id',
	'adset_id',
	'ad_id',
	'fbclid'
] as const;

export const emptyAttribution = (): Attribution => ({
	utm_source: '',
	utm_medium: '',
	utm_campaign: '',
	utm_content: '',
	utm_term: '',
	campaign_id: '',
	adset_id: '',
	ad_id: '',
	fbclid: '',
	referrer: ''
});

const clip = (value: string | null | undefined, max: number) =>
	(value ?? '')
		.split('')
		.filter((c) => c.charCodeAt(0) >= 32)
		.join('')
		.trim()
		.slice(0, max);

export const parseAttribution = (
	search: string,
	referrer: string,
	ownHost: string
): Attribution => {
	const params = new URLSearchParams(search);
	const out = emptyAttribution();
	for (const key of ATTRIBUTION_KEYS)
		out[key] = clip(params.get(key), key === 'fbclid' ? 240 : 150);
	if (referrer) {
		try {
			const url = new URL(referrer);
			if (url.hostname !== ownHost) out.referrer = clip(`${url.hostname}${url.pathname}`, 200);
		} catch {
			out.referrer = '';
		}
	}
	return out;
};

export const hasCampaignSignal = (a: Attribution): boolean =>
	ATTRIBUTION_KEYS.some((key) => a[key] !== '') || a.referrer !== '';

export const hasUrlSignal = (a: Attribution): boolean => ATTRIBUTION_KEYS.some((k) => a[k] !== '');

export const mergeAttribution = (stored: Attribution | null, current: Attribution): Attribution => {
	if (!stored) return current;
	if (hasUrlSignal(current)) return { ...current, referrer: current.referrer || stored.referrer };
	if (current.referrer && !stored.referrer) return { ...stored, referrer: current.referrer };
	return stored;
};

export const parseStoredAttribution = (raw: string): Attribution | null => {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Partial<Attribution>;
		const out = emptyAttribution();
		for (const key of Object.keys(out) as (keyof Attribution)[])
			out[key] = typeof parsed[key] === 'string' ? clip(parsed[key], 240) : '';
		return out;
	} catch {
		return null;
	}
};

export const deriveFbc = (fbc: string, fbclid: string, nowMs: number): string => {
	if (fbc) return fbc;
	if (!fbclid) return '';
	return `fb.1.${nowMs}.${fbclid}`;
};
