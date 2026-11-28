import { disposeObservers } from './actions.ts';
import { initAnalytics as initRuntime } from './runtime.ts';

export { onVisible, section } from './actions.ts';
export type { OnVisibleParam, SectionParam } from './actions.ts';
export {
	getAttribution,
	getConsent,
	getIdentity,
	onConsentChange,
	setConsent,
	track
} from './runtime.ts';
export type { Consent } from './pixel.ts';

export function initAnalytics(): () => void {
	const release = initRuntime();
	return () => {
		release();
		disposeObservers();
	};
}
