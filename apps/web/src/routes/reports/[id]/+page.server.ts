import { error } from '@sveltejs/kit';

import { getReportById } from '$lib/server/services/reports.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';

import type { PageServerLoad } from './$types';

function reportId(value: string): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		error(404, 'The requested report could not be found.');
	}
	return parsed;
}

export const load: PageServerLoad = async ({ cookies, fetch, locals, params, url }) => {
	try {
		return {
			report: await getReportById(fetch, locals.payloadToken!, reportId(params.id))
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};
