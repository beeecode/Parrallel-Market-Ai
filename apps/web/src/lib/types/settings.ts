import type { UserRole } from '@parallel-market-ai/shared-types';

export type SettingsViewModel = {
	profile: {
		name: string;
		email: string;
		role: UserRole;
		roleLabel: string;
		company: string;
		avatarUrl?: string;
	};
	sections: {
		id: string;
		title: string;
		description: string;
		status: 'available' | 'future';
	}[];
};
