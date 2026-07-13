import { customerFiltersFromUrl, getCustomersData } from '$lib/server/services/customers.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, locals, url }) => {
	try {
		const filters = customerFiltersFromUrl(url);
		return {
			customers: await getCustomersData(fetch, locals.payloadToken!, filters)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};
