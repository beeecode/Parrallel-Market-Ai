import type { InsightDashboardViewModel } from '$lib/types/insight';
import type { PayloadReport } from '$lib/server/payload/types';
import { formatCurrency } from './mapper-utils';

function mostFrequentLabel(
	reports: PayloadReport[],
	field: 'customerObjections' | 'positiveFeedback' | 'recommendations' | 'riskFactors'
): string | null {
	const counts = new Map<string, number>();

	for (const report of reports) {
		for (const item of report[field] ?? []) {
			counts.set(item.label, (counts.get(item.label) ?? 0) + 1);
		}
	}

	return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function uniqueLabels(
	reports: PayloadReport[],
	field: 'recommendations' | 'riskFactors'
): string[] {
	return [
		...new Set(reports.flatMap((report) => (report[field] ?? []).map((item) => item.label)))
	].slice(0, 5);
}

export function mapInsights(reports: PayloadReport[]): InsightDashboardViewModel | null {
	if (reports.length === 0) return null;

	const latest = [...reports].sort((left, right) => {
		const leftDate = new Date(left.generatedAt ?? '').getTime();
		const rightDate = new Date(right.generatedAt ?? '').getTime();
		return rightDate - leftDate;
	})[0];
	const averagePositive = Math.round(
		reports.reduce((sum, report) => sum + report.positiveSentiment, 0) / reports.length
	);
	const averageNegative = Math.round(
		reports.reduce((sum, report) => sum + report.negativeSentiment, 0) / reports.length
	);
	const objection = mostFrequentLabel(reports, 'customerObjections');
	const risk = mostFrequentLabel(reports, 'riskFactors');

	// These rules intentionally derive plain-language insights from accessible reports only.
	// They are deterministic summaries, not predictive analytics or AI-generated claims.
	return {
		cards: [
			{
				id: 'pricing',
				title: 'Pricing Insight',
				value: `${formatCurrency(latest.optimalPriceMinimum, latest.currency)} - ${formatCurrency(
					latest.optimalPriceMaximum,
					latest.currency
				)}`,
				description: `Latest reports show strongest demand inside this tested range. Current average: ${formatCurrency(
					latest.currentAveragePrice,
					latest.currency
				)}.`,
				tone: 'success'
			},
			{
				id: 'sentiment',
				title: 'Sentiment Insight',
				value: `${averagePositive}% positive`,
				description: `Positive sentiment is ${
					averagePositive >= averageNegative ? 'ahead of' : 'behind'
				} negative sentiment at ${averageNegative}%.`,
				tone: averagePositive >= averageNegative ? 'success' : 'warning'
			},
			{
				id: 'objection',
				title: 'Customer Objection',
				value: objection ?? 'No dominant objection',
				description: objection
					? 'This appears most often in accessible report objections.'
					: 'No repeated customer objection has been recorded yet.',
				tone: objection ? 'warning' : 'neutral'
			},
			{
				id: 'risk',
				title: 'Conversion Risk',
				value: risk ?? 'No major risk',
				description: risk
					? 'Prioritize this before scaling the next simulation cycle.'
					: 'Reports do not show a recurring conversion risk yet.',
				tone: risk ? 'danger' : 'neutral'
			}
		],
		recommendations: uniqueLabels(reports, 'recommendations'),
		riskFactors: uniqueLabels(reports, 'riskFactors'),
		sourceReportCount: reports.length,
		summary: `Insights are derived from ${reports.length.toLocaleString('en-NG')} accessible report${
			reports.length === 1 ? '' : 's'
		}.`
	};
}
