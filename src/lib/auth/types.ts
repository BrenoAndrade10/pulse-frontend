export type TenantRole = 'admin' | 'member';

export type AuthUser = {
	id: string;
	firstName: string;
	lastName?: string;
	email: string;
};

export type AuthMembership = {
	tenantId: string;
	tenantName: string;
	role: TenantRole;
};

/** Dados não sensíveis do usuário logado (nunca contém tokens). */
export type AuthProfile = {
	user: AuthUser;
	activeTenant: AuthMembership | null;
	tenants: AuthMembership[];
};

/** Resposta de POST /auth/login e POST /auth/refresh. */
export type AuthResponse = AuthProfile & {
	accessToken: string;
	tokenType: 'Bearer';
	/** Validade do access token, em segundos. */
	expiresIn: number;
};
