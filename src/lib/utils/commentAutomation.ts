import type { CommentAutomation } from '#lib/types.js';

export type AutomationStatus = 'none' | 'active' | 'paused' | 'draft';

export function automationStatus(
	automation: CommentAutomation | null | undefined
): AutomationStatus {
	if (!automation) return 'none';
	if (automation.isActive) return 'active';
	return automation.sentCount === 0 && automation.lastSentAt === null ? 'draft' : 'paused';
}
