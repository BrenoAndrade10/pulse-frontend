let expertId: string | null = null;
let launchId: string | null = null;

export function getContextSelection() {
	return { expertId, launchId };
}

export function selectExpert(id: string | null): void {
	expertId = id;
	launchId = null;
}

export function selectLaunch(id: string | null): void {
	launchId = id;
}

export function reconcileContextSelection(
	nextExpertId: string | null,
	nextLaunchId: string | null
) {
	expertId = nextExpertId;
	launchId = nextLaunchId;
}
