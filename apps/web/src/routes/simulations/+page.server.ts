import { handleSendMessageAction } from '$lib/server/services/message-action.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';
import { getSimulationWorkspace } from '$lib/server/services/simulations.service';

import type { Actions, PageServerLoad } from './$types';

function positiveInteger(value: FormDataEntryValue | null): number | null {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export const load: PageServerLoad = async ({ cookies, fetch, locals, url }) => {
	const requestedId = positiveInteger(url.searchParams.get('simulation'));

	try {
		return {
			simulation: await getSimulationWorkspace(
				fetch,
				locals.payloadToken!,
				requestedId ?? undefined
			)
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};

export const actions: Actions = {
	sendMessage: handleSendMessageAction
};
