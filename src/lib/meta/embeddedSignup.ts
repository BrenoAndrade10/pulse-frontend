import { PUBLIC_META_APP_ID, PUBLIC_WHATSAPP_CONFIG_ID } from '$app/env/public';

const SDK_URL = 'https://connect.facebook.net/pt_BR/sdk.js';
const SDK_TIMEOUT_MS = 15_000;
const SIGNUP_TIMEOUT_MS = 120_000;
const ALLOWED_ORIGINS = new Set(['https://www.facebook.com', 'https://web.facebook.com']);
const ID_PATTERN = /^\d+$/;

type FacebookLoginResponse = { authResponse?: { code?: string } };
type FacebookSdk = {
	init(options: { appId: string; version: string; xfbml: boolean; cookie: boolean }): void;
	login(
		callback: (response: FacebookLoginResponse) => void,
		options: {
			config_id: string;
			response_type: 'code';
			override_default_response_type: true;
			extras: { setup: Record<string, never>; featureType: ''; sessionInfoVersion: '3' };
		}
	): void;
};

declare global {
	interface Window {
		FB?: FacebookSdk;
		fbAsyncInit?: () => void;
	}
}

export type EmbeddedSignupResult = { code: string; wabaId: string; phoneNumberId: string };

export class EmbeddedSignupCancelledError extends Error {
	constructor(readonly currentStep?: string) {
		super('WA_EMBEDDED_SIGNUP_CANCELLED');
		this.name = 'EmbeddedSignupCancelledError';
	}
}

export class EmbeddedSignupError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'EmbeddedSignupError';
	}
}

export const isWhatsAppEmbeddedSignupConfigured = Boolean(
	PUBLIC_META_APP_ID && PUBLIC_WHATSAPP_CONFIG_ID
);

let sdkPromise: Promise<FacebookSdk> | undefined;
let initialized = false;
let asyncInitInstalled = false;
const sdkReadyListeners = new Set<() => void>();

function initializeFacebookSdk(sdk: FacebookSdk): FacebookSdk {
	if (!initialized) {
		sdk.init({
			appId: PUBLIC_META_APP_ID,
			version: 'v25.0',
			xfbml: false,
			cookie: false
		});
		initialized = true;
	}
	return sdk;
}

function installAsyncInitHandler(): void {
	if (asyncInitInstalled) return;
	const previousAsyncInit = window.fbAsyncInit;
	window.fbAsyncInit = () => {
		try {
			previousAsyncInit?.();
		} finally {
			for (const listener of sdkReadyListeners) listener();
			sdkReadyListeners.clear();
		}
	};
	asyncInitInstalled = true;
}

function loadFacebookSdk(): Promise<FacebookSdk> {
	if (window.FB) return Promise.resolve(initializeFacebookSdk(window.FB));
	if (sdkPromise) return sdkPromise;

	sdkPromise = new Promise<FacebookSdk>((resolve, reject) => {
		let settled = false;
		const handleSdkReady = () => finish();
		const finish = (error?: Error) => {
			if (settled) return;
			settled = true;
			window.clearTimeout(timeout);
			sdkReadyListeners.delete(handleSdkReady);
			if (error) {
				reject(error);
			} else if (window.FB) resolve(window.FB);
			else reject(new EmbeddedSignupError('O SDK da Meta não ficou disponível.'));
		};

		const timeout = window.setTimeout(
			() => finish(new EmbeddedSignupError('A Meta demorou para carregar. Tente novamente.')),
			SDK_TIMEOUT_MS
		);
		installAsyncInitHandler();
		sdkReadyListeners.add(handleSdkReady);

		const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
		if (existing) {
			existing.addEventListener('load', () => finish(), { once: true });
			existing.addEventListener(
				'error',
				() => finish(new EmbeddedSignupError('Não foi possível carregar a Meta.')),
				{ once: true }
			);
			return;
		}

		const script = document.createElement('script');
		script.src = SDK_URL;
		script.async = true;
		script.defer = true;
		script.onerror = () => finish(new EmbeddedSignupError('Não foi possível carregar a Meta.'));
		document.head.append(script);
	})
		.then(initializeFacebookSdk)
		.catch((error: unknown) => {
			sdkPromise = undefined;
			throw error;
		});

	return sdkPromise;
}

function parseMessage(data: unknown): unknown {
	if (typeof data !== 'string') return data;
	try {
		return JSON.parse(data) as unknown;
	} catch {
		return null;
	}
}

export async function startWhatsAppEmbeddedSignup(): Promise<EmbeddedSignupResult> {
	if (!isWhatsAppEmbeddedSignupConfigured) {
		throw new EmbeddedSignupError('WhatsApp ainda não configurado nesta instalação');
	}

	const sdk = await loadFacebookSdk();

	return new Promise<EmbeddedSignupResult>((resolve, reject) => {
		let code: string | undefined;
		let ids: Pick<EmbeddedSignupResult, 'wabaId' | 'phoneNumberId'> | undefined;
		let settled = false;

		const cleanup = () => {
			window.clearTimeout(timeout);
			window.removeEventListener('message', handleMessage);
		};
		const fail = (error: Error) => {
			if (settled) return;
			settled = true;
			cleanup();
			reject(error);
		};
		const complete = () => {
			if (settled || !code || !ids) return;
			settled = true;
			cleanup();
			resolve({ code, ...ids });
		};
		function handleMessage(event: MessageEvent) {
			if (!ALLOWED_ORIGINS.has(event.origin)) return;
			const payload = parseMessage(event.data) as {
				type?: unknown;
				event?: unknown;
				data?: { waba_id?: unknown; phone_number_id?: unknown; current_step?: unknown };
			} | null;
			if (!payload || payload.type !== 'WA_EMBEDDED_SIGNUP') return;

			if (payload.event === 'CANCEL') {
				fail(
					new EmbeddedSignupCancelledError(
						typeof payload.data?.current_step === 'string' ? payload.data.current_step : undefined
					)
				);
				return;
			}
			if (payload.event === 'ERROR') {
				fail(new EmbeddedSignupError('A Meta não conseguiu concluir a conexão.'));
				return;
			}
			if (payload.event !== 'FINISH') return;

			const wabaId = payload.data?.waba_id;
			const phoneNumberId = payload.data?.phone_number_id;
			if (
				typeof wabaId !== 'string' ||
				typeof phoneNumberId !== 'string' ||
				!ID_PATTERN.test(wabaId) ||
				!ID_PATTERN.test(phoneNumberId)
			) {
				fail(new EmbeddedSignupError('A Meta retornou dados inválidos para a conexão.'));
				return;
			}
			ids = { wabaId, phoneNumberId };
			complete();
		}

		const timeout = window.setTimeout(
			() => fail(new EmbeddedSignupError('A conexão com a Meta expirou. Tente novamente.')),
			SIGNUP_TIMEOUT_MS
		);
		window.addEventListener('message', handleMessage);

		try {
			sdk.login(
				(response) => {
					const receivedCode = response.authResponse?.code;
					if (typeof receivedCode !== 'string' || !receivedCode) {
						return;
					}
					code = receivedCode;
					complete();
				},
				{
					config_id: PUBLIC_WHATSAPP_CONFIG_ID,
					response_type: 'code',
					override_default_response_type: true,
					extras: { setup: {}, featureType: '', sessionInfoVersion: '3' }
				}
			);
		} catch {
			fail(new EmbeddedSignupError('Não foi possível abrir a conexão com a Meta.'));
		}
	});
}
