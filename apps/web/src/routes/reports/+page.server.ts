import { getReportData } from '$lib/server/services/reports.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, locals, url }) => {
	const rawId = url.searchParams.get('simulation');
	const parsedId = rawId ? Number(rawId) : undefined;
	const simulationId =
		parsedId && Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined;

	try {
		return {
			report: await getReportData(fetch, locals.payloadToken!, simulationId)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};
