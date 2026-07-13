import { fail, redirect, type RequestEvent } from '@sveltejs/kit';

import {
	PayloadAuthenticationError,
	PayloadNetworkError,
	PayloadNotFoundError,
	PayloadPermissionError,
	PayloadTimeoutError,
	PayloadValidationError
} from '$lib/server/payload/errors';
import { createBusinessMessage } from '$lib/server/services/messages.service';
import { clearSessionCookie } from '$lib/server/services/session.service';

type MessageActionErrorType = 'validation' | 'auth' | 'permission' | 'network' | 'server';

function positiveInteger(value: FormDataEntryValue | null): number | null {
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function messageFailure(
	status: number,
	content: string,
	type: MessageActionErrorType,
	message: string,
	fieldErrors?: Record<string, string>
) {
	return fail(status, {
		success: false,
		messageDraft: content,
		messageError: message,
		error: {
			type,
			message,
			...(fieldErrors ? { fieldErrors } : {})
		}
	});
}

export async function handleSendMessageAction(event: RequestEvent) {
	const formData = await event.request.formData();
	const agentId = positiveInteger(formData.get('agentId'));
	const conversationId = positiveInteger(formData.get('conversationId'));
	const simulationId = positiveInteger(formData.get('simulationId'));
	const content = String(formData.get('content') ?? '');
	const submissionId = String(formData.get('submissionId') ?? '');

	if (!agentId || !conversationId || !simulationId) {
		return messageFailure(
			400,
			content,
			'validation',
			'Select a customer conversation before sending a message.'
		);
	}

	try {
		const message = await createBusinessMessage(event.fetch, event.locals.payloadToken!, {
			agentId,
			content,
			conversationId,
			simulationId,
			submissionId
		});

		return {
			success: true,
			conversationId: String(conversationId),
			message,
			messageSent: true
		};
	} catch (cause) {
		if (cause instanceof PayloadAuthenticationError) {
			clearSessionCookie(event.cookies);
			const returnPath = `${event.url.pathname}${event.url.search}`;
			redirect(303, `/login?returnTo=${encodeURIComponent(returnPath)}`);
		}
		if (cause instanceof PayloadPermissionError) {
			return messageFailure(
				403,
				content,
				'permission',
				'You do not have permission to send this message.'
			);
		}
		if (cause instanceof PayloadNotFoundError) {
			return messageFailure(404, content, 'validation', cause.message);
		}
		if (cause instanceof PayloadValidationError) {
			return messageFailure(400, content, 'validation', cause.message, cause.fieldErrors);
		}
		if (cause instanceof PayloadNetworkError || cause instanceof PayloadTimeoutError) {
			return messageFailure(
				503,
				content,
				'network',
				'The CMS could not be reached. Please try again.'
			);
		}
		return messageFailure(
			500,
			content,
			'server',
			'The message could not be sent. Please try again.'
		);
	}
}
