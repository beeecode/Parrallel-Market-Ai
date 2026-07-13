import type { ReportData } from '$lib/types/report';
import type { PayloadReport, PayloadSimulation } from '$lib/server/payload/types';
import {
	formatCompactCurrency,
	formatCurrency,
	relationshipId,
	titleCase
} from '$lib/server/mappers/mapper-utils';

export function mapReport(report: PayloadReport, simulation: PayloadSimulation): ReportData {
	const status = titleCase(report.status) as ReportData['status'];

	return {
		id: String(report.id),
		simulationId: String(relationshipId(report.simulation) ?? simulation.id),
		title: `Simulation Report - ${simulation.title}`,
		successProbability: report.successProbability,
		successLabel:
			report.successProbability >= 70
				? 'Viable with improvements'
				: report.successProbability >= 50
					? 'Promising with material risks'
					: 'Requires significant changes',
		sentiment: [
			{ label: 'Positive', value: report.positiveSentiment, color: '#65d88c' },
			{ label: 'Neutral', value: report.neutralSentiment, color: '#a3e6a6' },
			{ label: 'Negative', value: report.negativeSentiment, color: '#fb7185' }
		],
		positiveFeedback: (report.positiveFeedback ?? []).map((item) => ({ label: item.label })),
		objections: (report.customerObjections ?? []).map((item) => ({ label: item.label })),
		recommendations: (report.recommendations ?? []).map((item) => ({ label: item.label })),
		risks: (report.riskFactors ?? []).map((item) => ({ label: item.label })),
		optimalPriceRange: `${formatCurrency(
			report.optimalPriceMinimum,
			report.currency
		)} - ${formatCurrency(report.optimalPriceMaximum, report.currency)}`,
		currentAveragePrice: formatCurrency(report.currentAveragePrice, report.currency),
		revenueForecast: `${formatCompactCurrency(
			report.revenueMinimum,
			report.currency
		)} - ${formatCompactCurrency(report.revenueMaximum, report.currency)}`,
		status
	};
}
