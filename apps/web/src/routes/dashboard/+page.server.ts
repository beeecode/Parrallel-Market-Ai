import { getDashboardData } from '$lib/server/services/dashboard.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, locals }) => {
	try {
		return {
			dashboard: await getDashboardData(fetch, locals.payloadToken!)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, '/dashboard');
	}
};
