import { browser } from '$app/env';
import { apiRequest } from '#lib/api/client.js';
import { ApiError } from '#lib/api/http.js';
import type { WhatsAppAutomation, WhatsAppAutomationInput, WhatsAppGroup } from '#lib/types.js';

// TODO(api): substituir o armazenamento local pelos endpoints de automações do WhatsApp.

const STORAGE_PREFIX = 'pulse:whatsapp-automations:';
const delay = () => new Promise((resolve) => setTimeout(resolve, 120));
const clone = <T>(value: T): T => structuredClone(value);

function toInput(automation: WhatsAppAutomation): WhatsAppAutomationInput {
	return {
		name: automation.name,
		eventName: automation.eventName,
		launchId: automation.launchId,
		destination: automation.destination,
		delay: automation.delay,
		message: automation.message,
		isActive: automation.isActive
	};
}

function read(expertId: string): WhatsAppAutomation[] {
	if (!browser) return [];
	try {
		const value = localStorage.getItem(`${STORAGE_PREFIX}${expertId}`);
		return value ? (JSON.parse(value) as WhatsAppAutomation[]) : [];
	} catch {
		return [];
	}
}

function write(expertId: string, automations: WhatsAppAutomation[]): void {
	if (!browser) return;
	try {
		localStorage.setItem(`${STORAGE_PREFIX}${expertId}`, JSON.stringify(automations));
	} catch {
		throw new Error('WHATSAPP_LOCAL_STORAGE_UNAVAILABLE');
	}
}

export async function listWhatsAppAutomations(expertId: string): Promise<WhatsAppAutomation[]> {
	await delay();
	return read(expertId)
		.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
		.map(clone);
}

export async function getWhatsAppAutomation(
	expertId: string,
	id: string
): Promise<WhatsAppAutomation | null> {
	await delay();
	const automation = read(expertId).find((item) => item.id === id);
	return automation ? clone(automation) : null;
}

export async function createWhatsAppAutomation(
	expertId: string,
	input: WhatsAppAutomationInput
): Promise<WhatsAppAutomation> {
	await delay();
	const now = new Date().toISOString();
	const automation: WhatsAppAutomation = {
		...clone(input),
		id: crypto.randomUUID(),
		expertId,
		createdAt: now,
		updatedAt: now
	};
	write(expertId, [...read(expertId), automation]);
	return clone(automation);
}

export async function updateWhatsAppAutomation(
	expertId: string,
	id: string,
	input: WhatsAppAutomationInput
): Promise<WhatsAppAutomation> {
	await delay();
	const automations = read(expertId);
	const index = automations.findIndex((item) => item.id === id);
	if (index < 0) throw new Error('WHATSAPP_AUTOMATION_NOT_FOUND');
	const automation: WhatsAppAutomation = {
		...automations[index],
		...clone(input),
		updatedAt: new Date().toISOString()
	};
	automations[index] = automation;
	write(expertId, automations);
	return clone(automation);
}

export async function deleteWhatsAppAutomation(expertId: string, id: string): Promise<void> {
	await delay();
	write(
		expertId,
		read(expertId).filter((item) => item.id !== id)
	);
}

export async function setWhatsAppAutomationActive(
	expertId: string,
	id: string,
	isActive: boolean
): Promise<WhatsAppAutomation> {
	const automation = await getWhatsAppAutomation(expertId, id);
	if (!automation) throw new Error('WHATSAPP_AUTOMATION_NOT_FOUND');
	return updateWhatsAppAutomation(expertId, id, { ...toInput(automation), isActive });
}

export function listWhatsAppGroups(expertId: string): Promise<WhatsAppGroup[]> {
	return apiRequest<WhatsAppGroup[]>(`/experts/${encodeURIComponent(expertId)}/whatsapp/groups`);
}

export type WhatsAppGroupsState =
	| { status: 'ready'; groups: WhatsAppGroup[] }
	| { status: 'unavailable'; groups: [] }
	| { status: 'error'; groups: [] };

export async function loadWhatsAppGroups(expertId: string): Promise<WhatsAppGroupsState> {
	try {
		return { status: 'ready', groups: await listWhatsAppGroups(expertId) };
	} catch (error) {
		return error instanceof ApiError && error.status === 404
			? { status: 'unavailable', groups: [] }
			: { status: 'error', groups: [] };
	}
}
