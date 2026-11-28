import type { EventName, EventProps, FeatureId, SectionId } from '../contract.ts';
import { deferUntilVisible, isBrowser, track } from './runtime.ts';
import { isViewed, VISIBILITY_THRESHOLDS } from './visibility.ts';

type Disposer = () => void;
const disposers = new Set<Disposer>();

export function disposeObservers(): void {
	for (const dispose of [...disposers]) dispose();
}

const pageVisible = () => document.visibilityState === 'visible';

function observe(
	node: Element,
	criteria: { ratio?: number; coverage?: number },
	onView: () => void,
	rearm: boolean
): Disposer {
	if (!isBrowser() || typeof IntersectionObserver === 'undefined') return () => {};
	let armed = true;
	const attempt = () => {
		if (!armed) return;
		armed = false;
		onView();
	};
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const sample = {
					intersecting: entry.isIntersecting,
					intersectionRatio: entry.intersectionRatio,
					intersectionHeight: entry.intersectionRect.height,
					viewportHeight: entry.rootBounds?.height ?? window.innerHeight
				};
				if (isViewed(sample, criteria)) {
					if (!armed) continue;
					if (pageVisible()) attempt();
					else deferUntilVisible(attempt);
					if (!rearm && !armed) dispose();
				} else if (rearm && !entry.isIntersecting) {
					armed = true;
				}
			}
		},
		{ threshold: VISIBILITY_THRESHOLDS }
	);
	const dispose = () => {
		observer.disconnect();
		disposers.delete(dispose);
	};
	disposers.add(dispose);
	observer.observe(node);
	return dispose;
}

export type SectionParam = SectionId | { id: SectionId; featureId?: FeatureId };

const normalize = (param: SectionParam) =>
	typeof param === 'string' ? { id: param, featureId: undefined } : param;

export function section(node: HTMLElement, param: SectionParam) {
	let current = normalize(param);
	let dispose = observe(
		node,
		{ ratio: 0.5, coverage: 0.35 },
		() => {
			track('SectionView', { sectionId: current.id });
			if (current.featureId)
				track('FeatureView', { featureId: current.featureId, sectionId: current.id });
		},
		false
	);
	return {
		update(next: SectionParam) {
			current = normalize(next);
		},
		destroy() {
			dispose();
			dispose = () => {};
		}
	};
}

export type OnVisibleParam = {
	event: EventName;
	props?: EventProps;
	ratio?: number;
	once?: boolean;
};

export function onVisible(node: HTMLElement, param: OnVisibleParam) {
	let current = param;
	const dispose = observe(
		node,
		{ ratio: current.ratio ?? 0.5, coverage: Math.max(current.ratio ?? 0.5, 0.5) },
		() => track(current.event, current.props ?? {}),
		current.once === false
	);
	return {
		update(next: OnVisibleParam) {
			current = next;
		},
		destroy: dispose
	};
}
