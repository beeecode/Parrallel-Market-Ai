import type { AuthenticatedUser } from '$lib/types/auth';
import type { SettingsViewModel } from '$lib/types/settings';
import { mapSettings } from '$lib/server/mappers/settings.mapper';

export function getSettingsData(user: AuthenticatedUser): SettingsViewModel {
	return mapSettings(user);
}
