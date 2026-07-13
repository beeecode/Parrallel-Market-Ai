import { getSettingsData } from '$lib/server/services/settings.service';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	settings: getSettingsData(locals.user!)
});
