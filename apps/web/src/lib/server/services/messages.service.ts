import { validateMessageContent } from '@parallel-market-ai/validation';

import type { ChatMessageViewModel } from '$lib/types/simulation';
import { formatTime, relationshipId } from '$lib/server/mappers/mapper-utils';
import { createMockBusinessMessage } from '$lib/server/mock/data';
import { isFrontendMockMode } from '$lib/server/mock/mode';
import { payloadRequest } from '$lib/server/payload/client';
import {
	PayloadConflictError,
	PayloadNotFoundError,
	PayloadValidationError
} from '$lib/server/payload/errors';
import {
	isPayloadConversation,
	isPayloadMessage,
	payloadDocumentValidator,
	payloadListValidator,
	type PayloadConversation,
	type PayloadMessage
} from '$lib/server/payload/types';

export type CreateBusinessMessageInput = {
	agentId: number;
	content: string;
	conversationId: number;
	simulationId: number;
	submissionId: string;
};

function mapCreatedMessage(message: PayloadMessage): ChatMessageViewModel {
	return {
		id: String(message.id),
		sender: message.senderType,
		body: message.content,
		timestamp: formatTime(message.sentAt),
		sentAt: message.sentAt
	};
}

async function findBySubmissionId(
	fetch: typeof globalThis.fetch,
	token: string,
	submissionId: string
): Promise<PayloadMessage | null> {
	const response = await payloadRequest({
		fetch,
		path: '/api/messages',
		query: {
			depth: 0,
			limit: 1,
			where: { clientSubmissionId: { equals: submissionId } }
		},
		token,
		validate: payloadListValidator<PayloadMessage>(isPayloadMessage)
	});

	return response.docs[0] ?? null;
}

export async function createBusinessMessage(
	fetch: typeof globalThis.fetch,
	token: string,
	input: CreateBusinessMessageInput
): Promise<ChatMessageViewModel> {
	const validation = validateMessageContent(input.content, 4_000);
	if (!validation.valid) {
		throw new PayloadValidationError(validation.error);
	}

	if (!/^[a-zA-Z0-9_-]{16,100}$/.test(input.submissionId)) {
		throw new PayloadValidationError('The message submission identifier is invalid.');
	}

	if (isFrontendMockMode()) return createMockBusinessMessage(input.content);

	const existing = await findBySubmissionId(fetch, token, input.submissionId);
	if (existing) return mapCreatedMessage(existing);

	const conversationResponse = await payloadRequest({
		fetch,
		path: '/api/conversations',
		query: {
			depth: 0,
			limit: 1,
			where: { id: { equals: input.conversationId } }
		},
		token,
		validate: payloadListValidator<PayloadConversation>(isPayloadConversation)
	});
	const conversation = conversationResponse.docs[0];

	if (
		!conversation ||
		relationshipId(conversation.simulation) !== input.simulationId ||
		relationshipId(conversation.customerAgent) !== input.agentId
	) {
		throw new PayloadNotFoundError('The selected conversation could not be found.');
	}

	try {
		const response = await payloadRequest({
			body: {
				clientSubmissionId: input.submissionId,
				content: input.content.trim(),
				conversation: input.conversationId,
				customerAgent: input.agentId,
				senderType: 'business',
				sentAt: new Date().toISOString(),
				simulation: input.simulationId
			},
			fetch,
			method: 'POST',
			path: '/api/messages',
			token,
			validate: payloadDocumentValidator<PayloadMessage>(isPayloadMessage)
		});

		return mapCreatedMessage(response.doc);
	} catch (error) {
		if (error instanceof PayloadConflictError || error instanceof PayloadValidationError) {
			const duplicate = await findBySubmissionId(fetch, token, input.submissionId);
			if (duplicate) return mapCreatedMessage(duplicate);
		}
		throw error;
	}
}
