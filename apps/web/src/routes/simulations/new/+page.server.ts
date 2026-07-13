import { fail, redirect } from '@sveltejs/kit';

import {
	PayloadNotFoundError,
	PayloadPermissionError,
	PayloadValidationError
} from '$lib/server/payload/errors';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';
import {
	createSimulation,
	getSimulationCreateData,
	simulationCreateInputFromRequest
} from '$lib/server/services/simulation-create.service';

import type { Actions, PageServerLoad } from './$types';

function selectedProductId(value: string | null): number | undefined {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export const load: PageServerLoad = async ({ cookies, fetch, locals, url }) => {
	try {
		return {
			simulationForm: await getSimulationCreateData(
				fetch,
				locals.payloadToken!,
				selectedProductId(url.searchParams.get('product'))
			)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};

export const actions: Actions = {
	default: async ({ cookies, fetch, locals, request, url }) => {
		const values = simulationCreateInputFromRequest(await request.formData());
		let simulation: { id: string };

		try {
			simulation = await createSimulation(fetch, locals.payloadToken!, locals.user!, values);
		} catch (cause) {
			if (cause instanceof PayloadValidationError) {
				return fail(400, {
					errors: cause.fieldErrors,
					values
				});
			}
			if (cause instanceof PayloadPermissionError) {
				return fail(403, {
					errors: {
						form: 'You do not have permission to create simulations.'
					},
					values
				});
			}
			if (cause instanceof PayloadNotFoundError) {
				return fail(404, {
					errors: {
						form: cause.message
					},
					values
				});
			}
			handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
		}

		redirect(303, `/simulations/${simulation.id}/live`);
	}
};
