import { browser } from '$app/env';

export type OnboardingStatus = 'active' | 'dismissed' | 'completed';

const STORAGE_PREFIX = 'pulse:onboarding:';

const state = $state<{ scope: string | null; status: OnboardingStatus }>({
	scope: null,
	status: 'active'
});

function read(scope: string): OnboardingStatus {
	if (!browser) return 'active';

	try {
		const raw = localStorage.getItem(`${STORAGE_PREFIX}${scope}`);
		const parsed: unknown = raw ? JSON.parse(raw) : null;
		const status =
			typeof parsed === 'object' && parsed !== null
				? (parsed as Record<string, unknown>).status
				: null;

		return status === 'dismissed' || status === 'completed' ? status : 'active';
	} catch {
		return 'active';
	}
}

function write(status: OnboardingStatus): void {
	state.status = status;
	if (!browser || !state.scope) return;

	try {
		if (status === 'active') localStorage.removeItem(`${STORAGE_PREFIX}${state.scope}`);
		else localStorage.setItem(`${STORAGE_PREFIX}${state.scope}`, JSON.stringify({ status }));
	} catch {
		return;
	}
}

export const onboardingPreference = {
	get status(): OnboardingStatus {
		return state.status;
	},
	load(scope: string): void {
		if (scope === state.scope) return;
		state.scope = scope;
		state.status = read(scope);
	},
	dismiss(): void {
		write('dismissed');
	},
	complete(): void {
		write('completed');
	},
	reopen(): void {
		write('active');
	}
};
