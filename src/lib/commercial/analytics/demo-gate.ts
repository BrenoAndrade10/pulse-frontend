import type { EventName, EventProps } from '../contract.ts';

export const DEMO_EVENTS: ReadonlySet<EventName> = new Set([
	'DemoPlay',
	'DemoProgress',
	'DemoCompleted',
	'DemoReplay'
]);

export const DEMO_DEBOUNCE_MS = 400;
export const MAX_STEP_VALUE = 50;
export const MAX_DURATION_MS = 1800000;

const clampInt = (value: unknown, max: number): number | undefined => {
	const n = Number(value);
	if (value === undefined || value === null || value === '' || !Number.isFinite(n))
		return undefined;
	return Math.min(max, Math.max(0, Math.round(n)));
};

export const normalizeDemoProps = (props: EventProps): EventProps => {
	const out: EventProps = { ...props };
	for (const key of ['step', 'maxStep', 'totalSteps'] as const) {
		const v = clampInt(props[key], MAX_STEP_VALUE);
		if (v === undefined) delete out[key];
		else out[key] = v;
	}
	const d = clampInt(props.durationMs, MAX_DURATION_MS);
	if (d === undefined) delete out.durationMs;
	else out.durationMs = d;
	return out;
};

export class DemoGate {
	private runs = new Map<string, string>();
	private counters = new Map<string, number>();
	private maxSteps = new Map<string, number>();
	private seen = new Set<string>();
	private lastStart = new Map<string, number>();

	private base(props: EventProps): string {
		return `${props.operationType || props.scenario || ''}|${props.demoType ?? ''}`;
	}

	private run(base: string): string {
		return this.runs.get(base) ?? '0';
	}

	allow(name: EventName, props: EventProps, now: number): boolean {
		if (!DEMO_EVENTS.has(name)) return true;
		if (!props.demoType) return false;
		const base = this.base(props);
		if (name === 'DemoPlay' || name === 'DemoReplay') {
			const explicit = props.value !== undefined && props.value !== '' ? String(props.value) : '';
			if (explicit) {
				const key = `${name}|${base}|${explicit}`;
				if (this.seen.has(key)) return false;
				this.seen.add(key);
			} else {
				const last = this.lastStart.get(`${name}|${base}`);
				if (last !== undefined && now - last < DEMO_DEBOUNCE_MS) return false;
			}
			this.lastStart.set(`${name}|${base}`, now);
			const next = (this.counters.get(base) ?? 0) + 1;
			this.counters.set(base, next);
			this.runs.set(base, explicit || String(next));
			return true;
		}
		const run = this.run(base);
		if (name === 'DemoProgress') {
			const step = props.step ?? props.maxStep;
			if (step === undefined) return false;
			const reached = Math.max(step, props.maxStep ?? step);
			const mk = `${base}|${run}`;
			if (reached <= (this.maxSteps.get(mk) ?? -1)) return false;
			const key = `DemoProgress|${mk}|${step}`;
			if (this.seen.has(key)) return false;
			this.seen.add(key);
			this.maxSteps.set(mk, reached);
			return true;
		}
		const key = `DemoCompleted|${base}|${run}`;
		if (this.seen.has(key)) return false;
		this.seen.add(key);
		return true;
	}
}

export const CTA_THROTTLE_MS = 2000;

export class CtaThrottle {
	private last = new Map<string, number>();

	allow(name: EventName, props: EventProps, now: number): boolean {
		if (name !== 'FeatureExplore' || props.scenario !== 'intermediate_cta') return true;
		const key = props.ctaSource ?? '';
		const last = this.last.get(key);
		if (last !== undefined && now - last < CTA_THROTTLE_MS) return false;
		this.last.set(key, now);
		return true;
	}
}
