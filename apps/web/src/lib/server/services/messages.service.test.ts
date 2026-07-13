import { describe, expect, it, vi } from 'vitest';

import { PayloadNotFoundError } from '$lib/server/payload/errors';
import { createBusinessMessage } from './messages.service';

function listResponse(docs: unknown[]): Response {
	return new Response(
		JSON.stringify({
			docs,
			hasNextPage: false,
			hasPrevPage: false,
			limit: 1,
			nextPage: null,
			page: 1,
			pagingCounter: 1,
			prevPage: null,
			totalDocs: docs.length,
			totalPages: docs.length ? 1 : 0
		}),
		{ status: 200 }
	);
}

function asFetch(mock: ReturnType<typeof vi.fn>): typeof globalThis.fetch {
	return mock as unknown as typeof globalThis.fetch;
}

describe('createBusinessMessage', () => {
	const input = {
		agentId: 31,
		content: 'Please add extra pepper.',
		conversationId: 41,
		simulationId: 10,
		submissionId: 'submission_1234567890'
	};

	it('validates relationships and creates a business message', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(listResponse([]))
			.mockResolvedValueOnce(
				listResponse([
					{
						customerAgent: 31,
						id: 41,
						simulation: 10,
						status: 'active'
					}
				])
			)
			.mockResolvedValueOnce(
				new Response(
					JSON.stringify({
						doc: {
							clientSubmissionId: input.submissionId,
							content: input.content,
							conversation: 41,
							createdAt: '2024-05-20T11:32:00.000Z',
							customerAgent: 31,
							id: 53,
							senderType: 'business',
							sentAt: '2024-05-20T11:32:00.000Z',
							simulation: 10
						},
						message: 'Message successfully created.'
					}),
					{ status: 201 }
				)
			);

		const result = await createBusinessMessage(asFetch(fetchMock), 'valid-token', input);

		expect(result).toMatchObject({
			body: input.content,
			id: '53',
			sender: 'business'
		});
		expect(fetchMock).toHaveBeenCalledTimes(3);
		const createRequest = fetchMock.mock.calls[2][1] as RequestInit;
		expect(createRequest.method).toBe('POST');
		expect(String(createRequest.body)).toContain('"senderType":"business"');
	});

	it('returns an existing message for a repeated submission identifier', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(
			listResponse([
				{
					clientSubmissionId: input.submissionId,
					content: input.content,
					conversation: 41,
					createdAt: '2024-05-20T11:32:00.000Z',
					customerAgent: 31,
					id: 53,
					senderType: 'business',
					sentAt: '2024-05-20T11:32:00.000Z',
					simulation: 10
				}
			])
		);

		const result = await createBusinessMessage(asFetch(fetchMock), 'valid-token', input);

		expect(result.id).toBe('53');
		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it('rejects a conversation that does not belong to the selected agent', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(listResponse([]))
			.mockResolvedValueOnce(
				listResponse([
					{
						customerAgent: 99,
						id: 41,
						simulation: 10,
						status: 'active'
					}
				])
			);

		await expect(
			createBusinessMessage(asFetch(fetchMock), 'valid-token', input)
		).rejects.toBeInstanceOf(PayloadNotFoundError);
	});
});
