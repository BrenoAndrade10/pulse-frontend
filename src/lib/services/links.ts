import { apiRequest } from '#lib/api/client.js';
import type { CreateLinkInput, Link } from '#lib/types.js';

export function createLink(input: CreateLinkInput): Promise<Link> {
	const body = Object.fromEntries(
		Object.entries(input).filter(
			([, value]) => value !== '' && value !== undefined && value !== null
		)
	) as CreateLinkInput;
	if (input.utm) {
		const utm = Object.fromEntries(
			Object.entries(input.utm).filter(
				([, value]) => value !== '' && value !== undefined && value !== null
			)
		);
		if (Object.keys(utm).length) body.utm = utm;
		else delete body.utm;
	}
	return apiRequest<Link>('/links', { method: 'POST', body });
}
