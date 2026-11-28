import { localStore, readCookie, sessionStore, writeCookie } from './storage.ts';

export const VISITOR_KEY = 'pl_c_vid';
export const EPHEMERAL_KEY = 'pl_c_vid_s';
const ID_PATTERN = /^[\w-]{8,64}$/;

export type Visitor = { id: string; returning: boolean; persisted: boolean };

const readPersisted = (): string => {
	const fromLocal = localStore.get(VISITOR_KEY);
	if (ID_PATTERN.test(fromLocal)) return fromLocal;
	const fromCookie = readCookie(VISITOR_KEY);
	return ID_PATTERN.test(fromCookie) ? fromCookie : '';
};

const writePersisted = (id: string): void => {
	localStore.set(VISITOR_KEY, id);
	writeCookie(VISITOR_KEY, id, 180);
};

export const clearPersisted = (): void => {
	localStore.remove(VISITOR_KEY);
	writeCookie(VISITOR_KEY, '', 0);
};

export const resolveVisitor = (persist: boolean, newId: () => string): Visitor => {
	const ephemeral = sessionStore.get(EPHEMERAL_KEY);
	if (persist) {
		const existing = readPersisted();
		if (existing) {
			writePersisted(existing);
			sessionStore.set(EPHEMERAL_KEY, existing);
			return { id: existing, returning: true, persisted: true };
		}
		const id = ID_PATTERN.test(ephemeral) ? ephemeral : newId();
		writePersisted(id);
		sessionStore.set(EPHEMERAL_KEY, id);
		return { id, returning: false, persisted: true };
	}
	const id = ID_PATTERN.test(ephemeral) ? ephemeral : newId();
	sessionStore.set(EPHEMERAL_KEY, id);
	return { id, returning: false, persisted: false };
};
