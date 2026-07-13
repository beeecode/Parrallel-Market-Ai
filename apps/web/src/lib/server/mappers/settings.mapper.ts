import type { AuthenticatedUser } from '$lib/types/auth';
import type { SettingsViewModel } from '$lib/types/settings';
import { titleCase } from './mapper-utils';

export function mapSettings(user: AuthenticatedUser): SettingsViewModel {
	return {
		profile: {
			name: user.name,
			email: user.email,
			role: user.role,
			roleLabel: titleCase(user.role),
			company: user.company || 'Not provided',
			avatarUrl: user.avatarUrl
		},
		sections: [
			{
				id: 'security',
				title: 'Session and security',
				description: 'Your current session is stored in a secure HttpOnly cookie.',
				status: 'available'
			},
			{
				id: 'reports',
				title: 'Report preferences',
				description:
					'Default export formatting and report delivery preferences will be added later.',
				status: 'future'
			},
			{
				id: 'ai',
				title: 'AI settings',
				description: 'Provider and model controls are locked until the request-agent phase.',
				status: 'future'
			},
			{
				id: 'billing',
				title: 'Billing',
				description:
					'Subscription and usage controls are outside the current implementation phase.',
				status: 'future'
			}
		]
	};
}
