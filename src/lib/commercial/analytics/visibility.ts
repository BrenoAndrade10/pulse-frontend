export const SECTION_COVERAGE = 0.35;
export const SECTION_RATIO = 0.5;
export const VISIBILITY_THRESHOLDS: number[] = Array.from({ length: 51 }, (_, i) => i / 50);

export type VisibilitySample = {
	intersecting: boolean;
	intersectionRatio: number;
	intersectionHeight: number;
	viewportHeight: number;
};

export const isViewed = (
	sample: VisibilitySample,
	options: { ratio?: number; coverage?: number } = {}
): boolean => {
	if (!sample.intersecting) return false;
	const ratio = options.ratio ?? SECTION_RATIO;
	const coverage = options.coverage ?? SECTION_COVERAGE;
	if (sample.intersectionRatio >= ratio - 1e-9) return true;
	if (sample.viewportHeight <= 0) return false;
	return sample.intersectionHeight / sample.viewportHeight >= coverage - 1e-9;
};
