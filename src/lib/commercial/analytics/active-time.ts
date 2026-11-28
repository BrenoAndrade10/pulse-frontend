export const INACTIVITY_TIMEOUT_MS = 30000;
export const ENGAGED_THRESHOLD_MS = 10000;

export class ActiveTimer {
	private readonly timeoutMs: number;
	private readonly startedAt: number;
	private activeAccrued = 0;
	private anchor: number;
	private lastInteraction: number;
	private visible: boolean;
	readonly startedHidden: boolean;

	constructor(now: number, visible: boolean, timeoutMs: number = INACTIVITY_TIMEOUT_MS) {
		this.timeoutMs = timeoutMs;
		this.startedAt = now;
		this.anchor = now;
		this.visible = visible;
		this.startedHidden = !visible;
		this.lastInteraction = visible ? now : Number.NEGATIVE_INFINITY;
	}

	private accrue(now: number): void {
		if (this.visible && now > this.anchor) {
			const end = Math.min(now, this.lastInteraction + this.timeoutMs);
			if (end > this.anchor) this.activeAccrued += end - this.anchor;
		}
		if (now > this.anchor) this.anchor = now;
	}

	interact(now: number): void {
		if (!this.visible) return;
		this.accrue(now);
		this.lastInteraction = now;
	}

	setVisible(visible: boolean, now: number): void {
		this.accrue(now);
		this.visible = visible;
		if (visible) this.lastInteraction = now;
	}

	isVisible(): boolean {
		return this.visible;
	}

	activeMs(now: number): number {
		this.accrue(now);
		return this.activeAccrued;
	}

	totalMs(now: number): number {
		return Math.max(0, now - this.startedAt);
	}

	isIdle(now: number): boolean {
		return !this.visible || now - this.lastInteraction >= this.timeoutMs;
	}
}
