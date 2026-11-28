export type SafeStore = {
	get(key: string): string;
	set(key: string, value: string): void;
	remove(key: string): void;
};

const createStore = (resolve: () => Storage | null): SafeStore => {
	const memory = new Map<string, string>();
	return {
		get(key) {
			try {
				const value = resolve()?.getItem(key);
				if (typeof value === 'string') return value;
			} catch {
				return memory.get(key) ?? '';
			}
			return memory.get(key) ?? '';
		},
		set(key, value) {
			memory.set(key, value);
			try {
				resolve()?.setItem(key, value);
			} catch {
				return;
			}
		},
		remove(key) {
			memory.delete(key);
			try {
				resolve()?.removeItem(key);
			} catch {
				return;
			}
		}
	};
};

export const sessionStore = createStore(() =>
	typeof sessionStorage === 'undefined' ? null : sessionStorage
);
export const localStore = createStore(() =>
	typeof localStorage === 'undefined' ? null : localStorage
);

export const readCookie = (name: string): string => {
	if (typeof document === 'undefined') return '';
	try {
		const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
		return match ? decodeURIComponent(match[1]) : '';
	} catch {
		return '';
	}
};

export const writeCookie = (name: string, value: string, days: number): void => {
	if (typeof document === 'undefined') return;
	try {
		const secure = location.protocol === 'https:' ? '; Secure' : '';
		document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${days * 86400}; Path=/; SameSite=Lax${secure}`;
	} catch {
		return;
	}
};

export const uuid = (): string => {
	try {
		if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
			return crypto.randomUUID();
		if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
			const bytes = crypto.getRandomValues(new Uint8Array(16));
			bytes[6] = (bytes[6] & 0x0f) | 0x40;
			bytes[8] = (bytes[8] & 0x3f) | 0x80;
			const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
			return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
		}
	} catch {
		return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
	}
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
};
