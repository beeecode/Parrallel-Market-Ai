import { beforeEach, describe, expect, it, vi } from 'vitest';

const serviceMocks = vi.hoisted(() => ({
	createBusinessMessage: vi.fn(),
	getDashboardData: vi.fn(),
	getReportData: vi.fn(),
	getSimulationWorkspace: vi.fn()
}));

vi.mock('$lib/server/services/dashboard.service', () => ({
	getDashboardData: serviceMocks.getDashboardData
}));
vi.mock('$lib/server/services/reports.service', () => ({
	getReportData: serviceMocks.getReportData
}));
vi.mock('$lib/server/services/simulations.service', () => ({
	getSimulationWorkspace: serviceMocks.getSimulationWorkspace
}));
vi.mock('$lib/server/services/messages.service', () => ({
	createBusinessMessage: serviceMocks.createBusinessMessage
}));

import { load as dashboardLoad } from './dashboard/+page.server';
import { load as reportLoad } from './reports/+page.server';
import { actions as simulationActions, load as simulationLoad } from './simulations/+page.server';

const eventBase = {
	cookies: {},
	fetch,
	locals: {
		payloadToken: 'valid-token',
		user: {
			email: 'owner@example.com',
			id: 7,
			name: 'Demo Owner',
			role: 'business-owner' as const
		}
	}
};

describe('protected route server modules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads dashboard data through the server service', async () => {
		serviceMocks.getDashboardData.mockResolvedValue({ successProbability: 72 });

		const result = await dashboardLoad(eventBase as never);

		expect(result).toEqual({ dashboard: { successProbability: 72 } });
		expect(serviceMocks.getDashboardData).toHaveBeenCalledWith(fetch, 'valid-token');
	});

	it('passes a valid simulation query to the simulation service', async () => {
		serviceMocks.getSimulationWorkspace.mockResolvedValue({ simulationId: '10' });

		const result = await simulationLoad({
			...eventBase,
			url: new URL('http://localhost/simulations?simulation=10')
		} as never);

		expect(result).toEqual({ simulation: { simulationId: '10' } });
		expect(serviceMocks.getSimulationWorkspace).toHaveBeenCalledWith(fetch, 'valid-token', 10);
	});

	it('passes a valid simulation query to the report service', async () => {
		serviceMocks.getReportData.mockResolvedValue({ simulationId: '10' });

		const result = await reportLoad({
			...eventBase,
			url: new URL('http://localhost/reports?simulation=10')
		} as never);

		expect(result).toEqual({ report: { simulationId: '10' } });
		expect(serviceMocks.getReportData).toHaveBeenCalledWith(fetch, 'valid-token', 10);
	});

	it('rejects an empty message before calling Payload', async () => {
		const sendMessage = simulationActions.sendMessage;
		expect(sendMessage).toBeTypeOf('function');
		const request = new Request('http://localhost/simulations?/sendMessage', {
			body: new URLSearchParams({
				agentId: '31',
				content: '   ',
				conversationId: '41',
				simulationId: '10',
				submissionId: 'submission_1234567890'
			}),
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST'
		});
		serviceMocks.createBusinessMessage.mockRejectedValue(
			new (await import('$lib/server/payload/errors')).PayloadValidationError(
				'Message content is required.'
			)
		);

		const result = await sendMessage!({
			...eventBase,
			request,
			url: new URL('http://localhost/simulations')
		} as never);

		expect(result).toMatchObject({
			data: {
				error: {
					message: 'Message content is required.',
					type: 'validation'
				},
				messageDraft: '   ',
				messageError: 'Message content is required.',
				success: false
			},
			status: 400
		});
	});

	it('returns the saved business message after a valid action submission', async () => {
		const sendMessage = simulationActions.sendMessage;
		expect(sendMessage).toBeTypeOf('function');
		const savedMessage = {
			body: 'Please add extra pepper.',
			id: '53',
			sender: 'business' as const,
			sentAt: '2024-05-20T11:32:00.000Z',
			timestamp: '12:32 PM'
		};
		const request = new Request('http://localhost/simulations?/sendMessage', {
			body: new URLSearchParams({
				agentId: '31',
				content: savedMessage.body,
				conversationId: '41',
				simulationId: '10',
				submissionId: 'submission_1234567890'
			}),
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			method: 'POST'
		});
		serviceMocks.createBusinessMessage.mockResolvedValue(savedMessage);

		const result = await sendMessage!({
			...eventBase,
			request,
			url: new URL('http://localhost/simulations')
		} as never);

		expect(result).toEqual({
			conversationId: '41',
			message: savedMessage,
			messageSent: true,
			success: true
		});
		expect(serviceMocks.createBusinessMessage).toHaveBeenCalledWith(fetch, 'valid-token', {
			agentId: 31,
			content: savedMessage.body,
			conversationId: 41,
			simulationId: 10,
			submissionId: 'submission_1234567890'
		});
	});
});
