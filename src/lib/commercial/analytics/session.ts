export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export type SessionRecord = {
	id: string;
	startedAt: number;
	lastActivityAt: number;
	seq: number;
	flags: string[];
	activeMs: number;
	totalMs: number;
};

export const isSessionRecord = (value: unknown): value is SessionRecord => {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.id === 'string' &&
		v.id.length > 0 &&
		Number.isFinite(v.startedAt) &&
		Number.isFinite(v.lastActivityAt) &&
		Number.isInteger(v.seq) &&
		Array.isArray(v.flags) &&
		Number.isFinite(v.activeMs) &&
		Number.isFinite(v.totalMs)
	);
};

export const parseSessionRecord = (raw: string): SessionRecord | null => {
	if (!raw) return null;
	try {
		const parsed: unknown = JSON.parse(raw);
		if (!isSessionRecord(parsed)) return null;
		return { ...parsed, flags: parsed.flags.filter((f) => typeof f === 'string') };
	} catch {
		return null;
	}
};

export const createSessionRecord = (now: number, id: string): SessionRecord => ({
	id,
	startedAt: now,
	lastActivityAt: now,
	seq: 0,
	flags: [],
	activeMs: 0,
	totalMs: 0
});

export const resolveSession = (
	stored: SessionRecord | null,
	now: number,
	newId: () => string,
	timeoutMs: number = SESSION_TIMEOUT_MS
): { session: SessionRecord; renewed: boolean; resumed: boolean } => {
	if (stored && now - stored.lastActivityAt <= timeoutMs && now >= stored.lastActivityAt - 60000)
		return { session: stored, renewed: false, resumed: true };
	return { session: createSessionRecord(now, newId()), renewed: Boolean(stored), resumed: false };
};

export const nextSequence = (session: SessionRecord): number => {
	session.seq += 1;
	return session.seq;
};

export const claimOnce = (session: SessionRecord, key: string): boolean => {
	if (session.flags.includes(key)) return false;
	session.flags.push(key);
	if (session.flags.length > 200) session.flags.splice(0, session.flags.length - 200);
	return true;
};
