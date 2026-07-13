import { error } from '@sveltejs/kit';

import { handleSendMessageAction } from '$lib/server/services/message-action.service';
import { handlePayloadRouteError } from '$lib/server/services/route-error.service';
import { getSimulationWorkspace } from '$lib/server/services/simulations.service';

import type { Actions, PageServerLoad } from './$types';

function simulationId(value: string): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		error(404, 'The requested simulation could not be found.');
	}
	return parsed;
}

export const load: PageServerLoad = async ({ cookies, fetch, locals, params, url }) => {
	try {
		return {
			simulation: await getSimulationWorkspace(fetch, locals.payloadToken!, simulationId(params.id))
		};
	} catch (cause) {
		handlePayloadRouteError(cause, cookies, `${url.pathname}${url.search}`);
	}
};

export const actions: Actions = {
	sendMessage: handleSendMessageAction
};
