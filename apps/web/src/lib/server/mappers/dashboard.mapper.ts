import type { DashboardViewModel, SimulationActivityItem } from '$lib/types/dashboard';
import type { PayloadProduct, PayloadSimulation } from '$lib/server/payload/types';
import { formatCompactCurrency, formatDate, titleCase } from '$lib/server/mappers/mapper-utils';

const revenueShape = [0, 0.16, 0.08, 0.36, 0.22, 0.31, 0.61, 0.38, 0.58, 0.49, 1];

function productFromSimulation(simulation: PayloadSimulation): PayloadProduct | null {
	return typeof simulation.product === 'object' ? simulation.product : null;
}

function activityStatus(status: PayloadSimulation['status']): SimulationActivityItem['status'] {
	const label = titleCase(status);
	if (
		label === 'Completed' ||
		label === 'Running' ||
		label === 'Paused' ||
		label === 'Failed' ||
		label === 'Queued'
	) {
		return label;
	}
	return 'Draft';
}

function revenueRange(simulation: PayloadSimulation): string {
	const minimum = simulation.revenueMinimum ?? 0;
	const maximum = simulation.revenueMaximum ?? minimum;
	return `${formatCompactCurrency(minimum, simulation.currency)} - ${formatCompactCurrency(
		maximum,
		simulation.currency
	)}`;
}

function trendForSimulation(simulation: PayloadSimulation): number[] {
	const minimum = simulation.revenueMinimum ?? 0;
	const maximum = simulation.revenueMaximum ?? minimum;
	const span = Math.max(maximum - minimum, 1);
	return revenueShape.map((point) => minimum + span * point);
}

export function mapDashboard(simulations: PayloadSimulation[]): DashboardViewModel | null {
	if (simulations.length === 0) return null;

	const sorted = [...simulations].sort((left, right) => {
		const leftDate = left.completedAt ?? left.startedAt ?? left.updatedAt;
		const rightDate = right.completedAt ?? right.startedAt ?? right.updatedAt;
		return new Date(rightDate).getTime() - new Date(leftDate).getTime();
	});
	const headline = sorted[0];
	const totalCustomers = simulations.reduce((sum, simulation) => sum + simulation.customerCount, 0);
	const totalConversations = simulations.reduce(
		(sum, simulation) => sum + simulation.conversationCount,
		0
	);

	return {
		successProbability: headline.successProbability ?? 0,
		successCopy: 'Your business is likely to succeed in this market with the right changes.',
		revenueForecast: revenueRange(headline),
		revenueSubtitle: 'Expected Monthly Revenue',
		revenueTrend: trendForSimulation(headline),
		metrics: [
			{
				iconAlt: 'Customer avatar',
				iconSrc: '/assets/3d/avatars/person.png',
				label: 'Total Customers Simulated',
				tone: 'neutral',
				value: totalCustomers.toLocaleString('en-NG')
			},
			{
				iconAlt: 'Conversation icon',
				iconSrc: '/assets/3d/icons/chat-bubble.png',
				label: 'Total Conversations',
				tone: 'primary',
				value: totalConversations.toLocaleString('en-NG')
			},
			{
				iconAlt: 'Purchase icon',
				iconSrc: '/assets/3d/illustrations/money-bag.png',
				label: 'Purchase Rate',
				tone: 'primary',
				value: `${headline.purchaseRate ?? 0}%`
			},
			{
				iconAlt: 'Repeat rate icon',
				iconSrc: '/assets/3d/illustrations/rocket.png',
				label: 'Repeat Rate',
				tone: 'primary',
				value: `${headline.repeatRate ?? 0}%`
			}
		],
		activity: sorted.slice(0, 8).map((simulation) => {
			const product = productFromSimulation(simulation);
			return {
				id: simulation.id,
				simulation: simulation.title,
				targetMarket: product?.targetMarket || simulation.targetLocation,
				status: activityStatus(simulation.status),
				successScore: `${simulation.successProbability ?? 0}%`,
				revenueForecast: revenueRange(simulation),
				date: formatDate(simulation.completedAt ?? simulation.startedAt ?? simulation.updatedAt)
			};
		})
	};
}
