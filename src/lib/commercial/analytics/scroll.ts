export const SCROLL_MILESTONES = [25, 50, 75, 100] as const;

export type ScrollMetrics = { scrollable: boolean; percent: number };

export const SCROLLABLE_TOLERANCE_PX = 4;

export const computeScroll = (m: {
	scrollTop: number;
	scrollHeight: number;
	clientHeight: number;
}): ScrollMetrics => {
	const range = m.scrollHeight - m.clientHeight;
	if (!Number.isFinite(range) || range <= SCROLLABLE_TOLERANCE_PX)
		return { scrollable: false, percent: 0 };
	const raw = (Math.max(0, m.scrollTop) / range) * 100;
	return { scrollable: true, percent: Math.min(100, Math.max(0, Math.round(raw))) };
};

export const reachedMilestones = (percent: number): number[] =>
	SCROLL_MILESTONES.filter((milestone) => percent >= milestone);

export const USER_SCROLL_WINDOW_MS = 1500;
export const SCROLL_CHAIN_MS = 350;

export class ScrollGate {
	private lastInput = Number.NEGATIVE_INFINITY;
	private lastAccepted = Number.NEGATIVE_INFINITY;

	input(now: number): void {
		this.lastInput = now;
	}

	accept(now: number): boolean {
		const direct = now - this.lastInput <= USER_SCROLL_WINDOW_MS;
		const chained = now - this.lastAccepted <= SCROLL_CHAIN_MS;
		if (!direct && !chained) return false;
		this.lastAccepted = now;
		return true;
	}
}
