import { getInsightsData } from '$lib/server/services/insights.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, locals, url }) => {
	try {
		return {
			insights: await getInsightsData(fetch, locals.payloadToken!)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};
