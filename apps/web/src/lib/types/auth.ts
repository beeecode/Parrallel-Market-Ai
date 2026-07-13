import type { UserRole } from '@parallel-market-ai/shared-types';

export type AuthenticatedUser = {
	id: number;
	name: string;
	email: string;
	role: UserRole;
	company?: string;
	avatarUrl?: string;
};

export type LoginInput = {
	email: string;
	password: string;
};

export type LoginResult = {
	exp: number;
	token: string;
	user: AuthenticatedUser;
};
