import type { ReportData } from '$lib/types/report';

const reportData: ReportData = {
	title: 'Simulation Report - Shawarma Spot Menu',
	successProbability: 72,
	successLabel: 'Viable with improvements',
	sentiment: [
		{ label: 'Positive', value: 49, color: '#65d88c' },
		{ label: 'Neutral', value: 28, color: '#a3e6a6' },
		{ label: 'Negative', value: 23, color: '#fb7185' }
	],
	positiveFeedback: ['Taste & quality of food', 'Packaging is good', 'Variety of options'],
	objections: ['Delivery fee too high', 'Prices slightly expensive', 'Checkout page not trusted'],
	recommendations: ['Add WhatsApp ordering', 'Offer smaller portions', 'Build trust signals'],
	risks: ['Delivery fee too high', 'Checkout not trusted', 'Price slightly high'],
	optimalPriceRange: '₦3,200 - ₦3,800',
	currentAveragePrice: '₦4,200'
};

export function getReportData(): ReportData {
	return reportData;
}
