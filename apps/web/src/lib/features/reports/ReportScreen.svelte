<script lang="ts">
	import FeedbackPanel from '$lib/components/reports/FeedbackPanel.svelte';
	import ObjectionPanel from '$lib/components/reports/ObjectionPanel.svelte';
	import PricingIntelligencePanel from '$lib/components/reports/PricingIntelligencePanel.svelte';
	import ReportHeader from '$lib/components/reports/ReportHeader.svelte';
	import ReportSuccessCard from '$lib/components/reports/ReportSuccessCard.svelte';
	import SentimentCard from '$lib/components/reports/SentimentCard.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import { reportTabs } from '$lib/constants/tabs';
	import { getReportData } from '$lib/data/report';
	import type { ReportTabId } from '$lib/types/report';

	const reportData = getReportData();
	let activeTab = $state<ReportTabId>('overview');

	const reportText = [
		reportData.title,
		'',
		`Success Probability: ${reportData.successProbability}%`,
		`Optimal Price Range: ${reportData.optimalPriceRange}`,
		`Current Average Price: ${reportData.currentAveragePrice}`,
		'',
		'Top Positive Feedback',
		...reportData.positiveFeedback.map((item) => `- ${item}`),
		'',
		'Top Customer Objections',
		...reportData.objections.map((item) => `- ${item}`)
	].join('\n');

	function handleTabChange(tab: string): void {
		activeTab = tab as ReportTabId;
	}
</script>

<Card class="overflow-hidden">
	<ReportHeader {reportText} title={reportData.title} />
	<Tabs
		{activeTab}
		ariaLabel="Simulation report sections"
		onchange={handleTabChange}
		tabs={reportTabs}
	/>

	{#if activeTab === 'overview'}
		<div class="space-y-4 p-4 sm:p-5">
			<div class="grid gap-4 lg:grid-cols-[0.8fr_1.45fr]">
				<ReportSuccessCard label={reportData.successLabel} value={reportData.successProbability} />
				<SentimentCard sentiment={reportData.sentiment} />
			</div>
			<div class="grid gap-4 lg:grid-cols-2">
				<FeedbackPanel items={reportData.positiveFeedback} title="Top Positive Feedback" />
				<ObjectionPanel items={reportData.objections} title="Top Customer Objections" />
			</div>
			<PricingIntelligencePanel
				currentAveragePrice={reportData.currentAveragePrice}
				optimalPriceRange={reportData.optimalPriceRange}
			/>
		</div>
	{:else if activeTab === 'customer-insights'}
		<div class="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.35fr_1fr]">
			<SentimentCard sentiment={reportData.sentiment} />
			<FeedbackPanel items={reportData.positiveFeedback} title="Top Positive Feedback" />
		</div>
	{:else if activeTab === 'pricing-analysis'}
		<div class="p-4 sm:p-5">
			<PricingIntelligencePanel
				currentAveragePrice={reportData.currentAveragePrice}
				optimalPriceRange={reportData.optimalPriceRange}
			/>
		</div>
	{:else if activeTab === 'recommendations'}
		<div class="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
			<FeedbackPanel items={reportData.recommendations} title="Recommendations" />
			<ObjectionPanel items={reportData.risks} title="Risk Factors" />
		</div>
	{:else}
		<div class="p-4 sm:p-5">
			<ObjectionPanel items={reportData.risks} title="Risk Factors" />
		</div>
	{/if}
</Card>
