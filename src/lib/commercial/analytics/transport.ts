import type { SendResult } from './queue.ts';

export const ENDPOINT = '/.netlify/functions/c-track';

export async function postBatch(body: string, exit: boolean): Promise<SendResult> {
	if (exit) {
		try {
			if (navigator.sendBeacon?.(ENDPOINT, new Blob([body], { type: 'text/plain' }))) return 'ok';
		} catch {
			void 0;
		}
	}
	try {
		const response = await fetch(ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'text/plain;charset=UTF-8' },
			body,
			keepalive: body.length < 60000,
			credentials: 'omit'
		});
		if (response.ok) return 'ok';
		if (response.status === 408 || response.status === 429 || response.status >= 500)
			return 'retry';
		return 'drop';
	} catch {
		return 'retry';
	}
}
