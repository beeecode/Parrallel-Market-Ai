import { error } from '@sveltejs/kit';

import { getProductDetailData } from '$lib/server/services/products.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

function productId(value: string): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		error(404, 'The requested product could not be found.');
	}
	return parsed;
}

export const load: PageServerLoad = async ({ cookies, fetch, locals, params, url }) => {
	try {
		return {
			product: await getProductDetailData(fetch, locals.payloadToken!, productId(params.id))
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};
