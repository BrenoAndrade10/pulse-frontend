import { apiRequest } from '#lib/api/client.js';
import type {
	CreateLinkInput,
	Link,
	LinkListParams,
	LinkPage,
	LinkUpdateInput
} from '#lib/types.js';

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

export function listLinks(params: LinkListParams = {}): Promise<LinkPage> {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(params)) {
		if (value !== undefined && value !== '') query.set(key, String(value));
	}
	const suffix = query.toString() ? `?${query}` : '';
	return apiRequest<LinkPage>(`/links${suffix}`);
}

export function updateLink(id: string, input: LinkUpdateInput): Promise<Link> {
	const body = { ...input } as LinkUpdateInput;
	if (body.utm) {
		body.utm = Object.fromEntries(Object.entries(body.utm).filter(([, value]) => value !== ''));
		if (!Object.keys(body.utm).length) delete body.utm;
	}
	return apiRequest<Link>(`/links/${id}`, { method: 'PATCH', body });
}
