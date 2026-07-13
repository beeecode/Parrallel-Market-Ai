import { fail, redirect } from '@sveltejs/kit';

import { PayloadPermissionError, PayloadValidationError } from '$lib/server/payload/errors';
import {
	createCustomSimulationRequest,
	customRequestInputFromFormData
} from '$lib/server/services/custom-requests.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';
import { defaultRequestAgentValues } from '$lib/features/request-agent/request-agent.utils';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => ({
	initialValues: defaultRequestAgentValues(locals.user)
});

export const actions: Actions = {
	default: async ({ cookies, fetch, locals, request, url }) => {
		if (!locals.user || !locals.payloadToken) {
			redirect(303, `/login?returnTo=${encodeURIComponent(`${url.pathname}${url.search}`)}`);
		}

		const values = customRequestInputFromFormData(await request.formData());

		try {
			return {
				request: await createCustomSimulationRequest(fetch, locals.payloadToken, values),
				success: true as const,
				values
			};
		} catch (cause) {
			if (cause instanceof PayloadValidationError) {
				return fail(400, {
					errorMessage: cause.message,
					errors: cause.fieldErrors,
					success: false as const,
					values
				});
			}

			if (cause instanceof PayloadPermissionError) {
				return fail(403, {
					errorMessage: 'You do not have permission to submit this request.',
					errors: {
						form: 'You do not have permission to submit this request.'
					},
					success: false as const,
					values
				});
			}

			handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
		}
	}
};
