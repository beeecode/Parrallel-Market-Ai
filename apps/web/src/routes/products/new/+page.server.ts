import { fail, redirect } from '@sveltejs/kit';

import { PayloadPermissionError, PayloadValidationError } from '$lib/server/payload/errors';
import { createProduct, productFormInputFromRequest } from '$lib/server/services/products.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';
import { defaultProductFormValues } from '$lib/validation/forms';

import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
	values: defaultProductFormValues
});

export const actions: Actions = {
	default: async ({ cookies, fetch, locals, request, url }) => {
		const values = productFormInputFromRequest(await request.formData());
		let product: { id: string };

		try {
			product = await createProduct(fetch, locals.payloadToken!, locals.user!, values);
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
						form: 'You do not have permission to create products.'
					},
					values
				});
			}
			handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
		}

		redirect(303, `/products/${product.id}`);
	}
};
