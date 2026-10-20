import { apiRequest } from '#lib/api/client.js';
import type { CommentAutomation, CommentAutomationInput } from '#lib/types.js';

// Os mesmos limites validados pela API.
export const MAX_KEYWORDS = 10;
export const MAX_KEYWORD_LENGTH = 50;
export const MAX_REPLY_MESSAGE_LENGTH = 1000;
export const MAX_BUTTON_MESSAGE_LENGTH = 640;
export const MAX_BUTTON_LABEL_LENGTH = 20;
export const MAX_COMMENT_REPLY_LENGTH = 2200;

const basePath = (expertId: string) =>
	`/experts/${encodeURIComponent(expertId)}/instagram/automations`;

export function listCommentAutomations(expertId: string): Promise<CommentAutomation[]> {
	return apiRequest<CommentAutomation[]>(basePath(expertId));
}

export function saveCommentAutomation(
	expertId: string,
	mediaId: string,
	input: CommentAutomationInput
): Promise<CommentAutomation> {
	return apiRequest<CommentAutomation>(`${basePath(expertId)}/${encodeURIComponent(mediaId)}`, {
		method: 'PUT',
		body: input
	});
}

export async function deleteCommentAutomation(expertId: string, mediaId: string): Promise<void> {
	await apiRequest<void>(`${basePath(expertId)}/${encodeURIComponent(mediaId)}`, {
		method: 'DELETE'
	});
}
