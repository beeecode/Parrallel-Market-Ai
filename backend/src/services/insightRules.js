const { INSIGHT_IMPORTANCE } = require('../constants/insightImportance');
const { INSIGHT_TREND } = require('../constants/insightTrend');

const INSIGHT_SOURCE = 'deterministic-engine';

const HIGH_ENGAGEMENT_THRESHOLD = 70;
const LOW_SENTIMENT_THRESHOLD = 40;
const STRONG_CONVERSION_THRESHOLD = 70;
const WEAK_CONVERSION_THRESHOLD = 40;
const SATISFACTION_THRESHOLD = 60;
const PRICING_CONCERN_THRESHOLD = 50;
const HESITATION_COMPLETION_THRESHOLD = 50;
const COMMUNICATION_RESPONSE_THRESHOLD = 50;
const PRODUCT_FIT_THRESHOLD = 60;
const SLOW_RESPONSE_TIME_SECONDS = 120;
const FAST_RESPONSE_TIME_SECONDS = 60;

function insight({ title, category, description, importance, trend, score }) {
  return {
    title,
    category,
    description,
    importance,
    trend,
    score: Math.max(0, Math.min(100, Math.round(score))),
    metadata: { tags: [category], source: INSIGHT_SOURCE, notes: null },
  };
}

/**
 * Ten fixed, independent threshold rules over a report's `metrics` — any
 * number can fire for the same report, since each measures a different
 * dimension. No AI, no randomness: every rule is a pure comparison against a
 * constant threshold, and every output field is a deterministic function of
 * the metric(s) it inspects.
 */
function buildInsights(metrics) {
  const rules = [];

  if (metrics.engagementScore >= HIGH_ENGAGEMENT_THRESHOLD) {
    rules.push(
      insight({
        title: 'High Engagement',
        category: 'engagement',
        description: `Engagement score of ${metrics.engagementScore}/100 indicates customers are actively responding.`,
        importance: INSIGHT_IMPORTANCE.MEDIUM,
        trend: INSIGHT_TREND.POSITIVE,
        score: metrics.engagementScore,
      }),
    );
  }

  if (metrics.averageSentiment < LOW_SENTIMENT_THRESHOLD) {
    rules.push(
      insight({
        title: 'Low Sentiment',
        category: 'sentiment',
        description: `Average sentiment of ${metrics.averageSentiment}/100 is below a healthy baseline.`,
        importance: INSIGHT_IMPORTANCE.HIGH,
        trend: INSIGHT_TREND.NEGATIVE,
        score: metrics.averageSentiment,
      }),
    );
  }

  if (metrics.conversionScore >= STRONG_CONVERSION_THRESHOLD) {
    rules.push(
      insight({
        title: 'Strong Conversion',
        category: 'conversion',
        description: `Conversion score of ${metrics.conversionScore}/100 reflects strong completion and response rates together.`,
        importance: INSIGHT_IMPORTANCE.MEDIUM,
        trend: INSIGHT_TREND.POSITIVE,
        score: metrics.conversionScore,
      }),
    );
  }

  if (metrics.conversionScore < WEAK_CONVERSION_THRESHOLD) {
    rules.push(
      insight({
        title: 'Weak Conversion',
        category: 'conversion',
        description: `Conversion score of ${metrics.conversionScore}/100 is low — completion and/or response rate need attention.`,
        importance: INSIGHT_IMPORTANCE.HIGH,
        trend: INSIGHT_TREND.NEGATIVE,
        score: metrics.conversionScore,
      }),
    );
  }

  if (metrics.averageSentiment >= SATISFACTION_THRESHOLD && metrics.completionRate >= SATISFACTION_THRESHOLD) {
    rules.push(
      insight({
        title: 'Customer Satisfaction',
        category: 'satisfaction',
        description: 'Both sentiment and completion rate are healthy, indicating satisfied customers.',
        importance: INSIGHT_IMPORTANCE.MEDIUM,
        trend: INSIGHT_TREND.POSITIVE,
        score: (metrics.averageSentiment + metrics.completionRate) / 2,
      }),
    );
  }

  if (metrics.averageSentiment < PRICING_CONCERN_THRESHOLD && metrics.conversionScore < PRICING_CONCERN_THRESHOLD) {
    rules.push(
      insight({
        title: 'Pricing Concern',
        category: 'pricing',
        description: 'Low sentiment combined with weak conversion often signals price sensitivity or perceived value mismatch.',
        importance: INSIGHT_IMPORTANCE.HIGH,
        trend: INSIGHT_TREND.NEGATIVE,
        score: (metrics.averageSentiment + metrics.conversionScore) / 2,
      }),
    );
  }

  if (metrics.completionRate < HESITATION_COMPLETION_THRESHOLD) {
    rules.push(
      insight({
        title: 'Purchase Hesitation',
        category: 'hesitation',
        description: `Only ${metrics.completionRate}% of the simulation completed, suggesting customers are dropping off before deciding.`,
        importance: INSIGHT_IMPORTANCE.HIGH,
        trend: INSIGHT_TREND.NEGATIVE,
        score: metrics.completionRate,
      }),
    );
  }

  if (metrics.responseRate < COMMUNICATION_RESPONSE_THRESHOLD) {
    rules.push(
      insight({
        title: 'Communication Issue',
        category: 'communication',
        description: `Response rate of ${metrics.responseRate}% is low — the conversation flow may not be reaching or engaging customers.`,
        importance: INSIGHT_IMPORTANCE.MEDIUM,
        trend: INSIGHT_TREND.NEGATIVE,
        score: metrics.responseRate,
      }),
    );
  }

  if (metrics.averageSentiment >= PRODUCT_FIT_THRESHOLD && metrics.conversionScore >= PRODUCT_FIT_THRESHOLD) {
    rules.push(
      insight({
        title: 'Product Fit',
        category: 'product-fit',
        description: 'High sentiment alongside strong conversion suggests the product resonates with this audience.',
        importance: INSIGHT_IMPORTANCE.MEDIUM,
        trend: INSIGHT_TREND.POSITIVE,
        score: (metrics.averageSentiment + metrics.conversionScore) / 2,
      }),
    );
  }

  if (metrics.averageResponseTime > SLOW_RESPONSE_TIME_SECONDS) {
    rules.push(
      insight({
        title: 'Response Quality Concern',
        category: 'response-quality',
        description: `Average response time of ${metrics.averageResponseTime}s is slower than the ${SLOW_RESPONSE_TIME_SECONDS}s target.`,
        importance: INSIGHT_IMPORTANCE.MEDIUM,
        trend: INSIGHT_TREND.NEGATIVE,
        score: metrics.averageResponseTime,
      }),
    );
  } else if (metrics.averageResponseTime > 0 && metrics.averageResponseTime <= FAST_RESPONSE_TIME_SECONDS) {
    rules.push(
      insight({
        title: 'Strong Response Quality',
        category: 'response-quality',
        description: `Average response time of ${metrics.averageResponseTime}s is at or under the ${FAST_RESPONSE_TIME_SECONDS}s target.`,
        importance: INSIGHT_IMPORTANCE.LOW,
        trend: INSIGHT_TREND.POSITIVE,
        score: 100 - metrics.averageResponseTime,
      }),
    );
  }

  return rules;
}

module.exports = { buildInsights };
