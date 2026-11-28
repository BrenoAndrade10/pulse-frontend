import type { OperationType, SignupOpenOptions } from './contract.ts';
import { getAttribution, getIdentity, track } from './analytics/index.ts';
import { sessionStore, uuid } from './analytics/storage.ts';

export const PRIVACY_VERSION = '2026-11-v1';
export const LEAD_ENDPOINT = '/.netlify/functions/c-lead';
const LEAD_KEY = 'pl_c_leadkey';
const LEAD_DONE_KEY = 'pl_c_leaddone';
const DEMO_KEY = 'pl_c_demoint';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUEST_TIMEOUT_MS = 12000;

export type SignupPhase = 'form' | 'success';
export type DetailsStatus = 'idle' | 'saving' | 'saved' | 'error';
export type CloseDetail = 'submitted' | 'dismissed';

export const isValidEmail = (value: string): boolean =>
	value.length <= 180 && EMAIL_PATTERN.test(value.trim());

export const phoneDigits = (value: string): string => value.replace(/\D/g, '');

export const isValidPhone = (value: string): boolean => {
	const digits = phoneDigits(value);
	return digits.length >= 10 && digits.length <= 15;
};

type LeadResponse = {
	success?: boolean;
	leadId?: string;
	duplicate?: boolean;
	ignored?: boolean;
	skipped?: boolean;
	message?: string;
	reason?: string;
};

async function post(body: unknown): Promise<{ status: number; data: LeadResponse }> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
	try {
		const response = await fetch(LEAD_ENDPOINT, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(body),
			signal: controller.signal,
			credentials: 'omit'
		});
		let data: LeadResponse = {};
		try {
			data = (await response.json()) as LeadResponse;
		} catch {
			data = {};
		}
		return { status: response.status, data };
	} finally {
		clearTimeout(timeout);
	}
}

class SignupState {
	isOpen = $state(false);
	phase = $state<SignupPhase>('form');
	email = $state('');
	commsConsent = $state(false);
	honeypot = $state('');
	submitting = $state(false);
	error = $state('');
	name = $state('');
	whatsapp = $state('');
	operationType = $state<OperationType | ''>('');
	demoInterest = $state(false);
	detailsStatus = $state<DetailsStatus>('idle');
	detailsError = $state('');
	options = $state<SignupOpenOptions | null>(null);
	returnFocus: HTMLElement | null = null;

	private started = false;
	private submittedThisOpen = false;
	private leadKey = '';

	private ensureLeadKey(): string {
		if (!this.leadKey) {
			const stored = sessionStore.get(LEAD_KEY);
			this.leadKey = /^[\w-]{16,64}$/.test(stored) ? stored : uuid();
			sessionStore.set(LEAD_KEY, this.leadKey);
		}
		return this.leadKey;
	}

	private ctaProps() {
		const o = this.options;
		return {
			ctaSource: o?.source,
			planId: o?.planId,
			displayedPrice: o?.displayedPrice,
			currency: o?.currency
		};
	}

	open(opts: SignupOpenOptions): void {
		if (this.isOpen || typeof document === 'undefined') return;
		this.options = opts;
		this.returnFocus =
			document.activeElement instanceof HTMLElement ? document.activeElement : null;
		this.started = false;
		this.submittedThisOpen = false;
		this.error = '';
		this.detailsError = '';
		this.detailsStatus = 'idle';
		this.submitting = false;
		this.phase = sessionStore.get(LEAD_DONE_KEY) ? 'success' : 'form';
		this.isOpen = true;
		track('SignupOpen', this.ctaProps());
	}

	close(): void {
		if (!this.isOpen) return;
		this.isOpen = false;
		track('SignupClose', {
			ctaSource: this.options?.source,
			detail: (this.submittedThisOpen || this.phase === 'success'
				? 'submitted'
				: 'dismissed') satisfies CloseDetail
		});
	}

	markInteraction(): void {
		if (this.started || this.phase !== 'form') return;
		this.started = true;
		track('SignupStart', { ctaSource: this.options?.source });
	}

	async submit(): Promise<void> {
		if (this.submitting || this.phase !== 'form') return;
		const email = this.email.trim().toLowerCase();
		if (!isValidEmail(email)) {
			this.error = 'Informe um e-mail válido.';
			return;
		}
		this.error = '';
		this.submitting = true;
		const identity = getIdentity();
		try {
			const { status, data } = await post({
				action: 'create',
				leadKey: this.ensureLeadKey(),
				email,
				commsConsent: this.commsConsent,
				privacyVersion: PRIVACY_VERSION,
				planId: this.options?.planId ?? '',
				displayedPrice: this.options?.displayedPrice,
				currency: this.options?.currency ?? '',
				source: this.options?.source ?? '',
				sessionId: identity?.sessionId ?? '',
				visitorId: identity?.visitorId ?? '',
				isTest: identity?.isTest ?? false,
				attribution: getAttribution(),
				website: this.honeypot
			});
			if (status >= 200 && status < 300 && data.success === true && data.leadId) {
				this.phase = 'success';
				this.submittedThisOpen = true;
				if (!data.ignored) {
					sessionStore.set(LEAD_DONE_KEY, data.leadId);
					if (!data.duplicate) track('Lead', this.ctaProps());
				}
				return;
			}
			if (status === 400) this.error = 'Informe um e-mail válido.';
			else if (status === 429)
				this.error = 'Muitas tentativas em sequência. Aguarde um instante e tente novamente.';
			else this.error = 'Não foi possível concluir agora. Tente novamente em instantes.';
		} catch {
			this.error = 'Não foi possível concluir agora. Verifique sua conexão e tente novamente.';
		} finally {
			this.submitting = false;
		}
	}

	setDemoInterest(value: boolean): void {
		this.demoInterest = value;
		if (value && !sessionStore.get(DEMO_KEY)) {
			sessionStore.set(DEMO_KEY, '1');
			track('DemoInterest', { ctaSource: this.options?.source, planId: this.options?.planId });
		}
	}

	async saveDetails(): Promise<void> {
		if (this.detailsStatus === 'saving' || this.phase !== 'success') return;
		const name = this.name.trim();
		const whatsapp = this.whatsapp.trim();
		if (!name && !whatsapp && !this.operationType && !this.demoInterest) {
			this.detailsError = 'Preencha ao menos uma informação para salvar.';
			this.detailsStatus = 'error';
			return;
		}
		if (whatsapp && !isValidPhone(whatsapp)) {
			this.detailsError = 'Informe um WhatsApp válido, com DDD.';
			this.detailsStatus = 'error';
			return;
		}
		this.detailsError = '';
		this.detailsStatus = 'saving';
		try {
			const { status, data } = await post({
				action: 'update',
				leadKey: this.ensureLeadKey(),
				name,
				whatsapp,
				operationType: this.operationType,
				demoInterest: this.demoInterest,
				commsConsent: this.commsConsent
			});
			if (status >= 200 && status < 300 && data.success === true) {
				this.detailsStatus = 'saved';
				return;
			}
			this.detailsError =
				status === 400
					? 'Revise os dados informados.'
					: 'Não foi possível salvar agora. Tente novamente em instantes.';
			this.detailsStatus = 'error';
		} catch {
			this.detailsError = 'Não foi possível salvar agora. Verifique sua conexão.';
			this.detailsStatus = 'error';
		}
	}
}

export const signup = new SignupState();
