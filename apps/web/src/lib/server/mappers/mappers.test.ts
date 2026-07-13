import { describe, expect, it } from 'vitest';

import { mapDashboard } from './dashboard.mapper';
import { mapReport } from './report.mapper';
import { mapSimulationWorkspace } from './simulation.mapper';
import type {
	PayloadConversation,
	PayloadCustomerAgent,
	PayloadMessage,
	PayloadReport,
	PayloadSimulation
} from '$lib/server/payload/types';

const simulation: PayloadSimulation = {
	completedAt: '2024-05-20T16:00:00.000Z',
	conversationCount: 3_842,
	createdAt: '2024-05-20T09:00:00.000Z',
	currency: 'NGN',
	customerCount: 1_000,
	id: 10,
	owner: 4,
	product: {
		category: 'Food delivery',
		currency: 'NGN',
		currentPrice: 4200,
		createdAt: '2024-05-20T09:00:00.000Z',
		description: 'A shawarma menu for delivery customers.',
		id: 3,
		name: 'Shawarma Spot Menu',
		owner: 4,
		slug: 'shawarma-spot-menu',
		status: 'active',
		targetLocation: 'Lagos, Nigeria',
		targetMarket: 'Urban food delivery customers',
		updatedAt: '2024-05-20T09:00:00.000Z'
	},
	purchaseRate: 23.7,
	repeatRate: 11.3,
	revenueMaximum: 6_800_000,
	revenueMinimum: 4_200_000,
	startedAt: '2024-05-20T09:00:00.000Z',
	status: 'completed',
	successProbability: 72,
	targetAudience: 'Lagos residents',
	targetLocation: 'Lagos, Nigeria',
	title: 'Shawarma Spot Menu',
	updatedAt: '2024-05-20T16:00:00.000Z'
};

const report: PayloadReport = {
	currency: 'NGN',
	currentAveragePrice: 4_200,
	customerObjections: [],
	executiveSummary: 'Viable with changes.',
	generatedAt: '2024-05-20T17:00:00.000Z',
	id: 20,
	negativeSentiment: 23,
	neutralSentiment: 28,
	optimalPriceMaximum: 3_800,
	optimalPriceMinimum: 3_200,
	positiveFeedback: [],
	positiveSentiment: 49,
	recommendations: [],
	revenueMaximum: 6_800_000,
	revenueMinimum: 4_200_000,
	riskFactors: [],
	simulation: 10,
	status: 'completed',
	successProbability: 72,
	version: 1
};

describe('server mappers', () => {
	it('maps dashboard aggregates and headline data', () => {
		const result = mapDashboard([simulation]);

		expect(result?.successProbability).toBe(72);
		expect(result?.metrics.map((metric) => metric.value)).toEqual([
			'1,000',
			'3,842',
			'23.7%',
			'11.3%'
		]);
		expect(result?.activity[0].targetMarket).toBe('Urban food delivery customers');
	});

	it('returns a dashboard empty state when no simulations are accessible', () => {
		expect(mapDashboard([])).toBeNull();
	});

	it('maps and orders conversations while tolerating missing media', () => {
		const agents: PayloadCustomerAgent[] = [
			{
				age: 24,
				createdAt: '2024-05-20T09:00:00.000Z',
				id: 31,
				name: 'Tunde',
				simulation: 10
			}
		];
		const conversations: PayloadConversation[] = [
			{
				customerAgent: 31,
				id: 41,
				simulation: 10,
				status: 'active'
			}
		];
		const messages: PayloadMessage[] = [
			{
				content: 'Second',
				conversation: 41,
				createdAt: '2024-05-20T11:31:00.000Z',
				customerAgent: 31,
				id: 52,
				senderType: 'business',
				sentAt: '2024-05-20T11:31:00.000Z',
				simulation: 10
			},
			{
				content: 'First',
				conversation: 41,
				createdAt: '2024-05-20T11:30:00.000Z',
				customerAgent: 31,
				id: 51,
				senderType: 'customer',
				sentAt: '2024-05-20T11:30:00.000Z',
				simulation: 10
			}
		];

		const result = mapSimulationWorkspace(simulation, agents, conversations, messages, [report]);

		expect(result.agents[0].avatarSrc).toBe('/assets/2d/avatars/man.svg');
		expect(result.messagesByAgent['31'].map((message) => message.body)).toEqual([
			'First',
			'Second'
		]);
	});

	it('maps report values and empty insight arrays', () => {
		const result = mapReport(report, simulation);

		expect(result.successProbability).toBe(72);
		expect(result.positiveFeedback).toEqual([]);
		expect(result.objections).toEqual([]);
		expect(result.optimalPriceRange).toContain('3,200');
		expect(result.revenueForecast).toContain('4.2');
	});
});
