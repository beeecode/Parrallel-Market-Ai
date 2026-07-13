import { getProductsData, productFiltersFromUrl } from '$lib/server/services/products.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, locals, url }) => {
	try {
		const filters = productFiltersFromUrl(url);
		return {
			products: await getProductsData(fetch, locals.payloadToken!, filters)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};
