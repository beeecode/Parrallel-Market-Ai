const { RECOMMENDATION_PRIORITY } = require('../constants/recommendationPriority');

const CONVERSION_COMPLETION_WEIGHT = 0.6;
const CONVERSION_RESPONSE_WEIGHT = 0.4;
const ENGAGEMENT_RESPONSE_WEIGHT = 0.5;
const ENGAGEMENT_SENTIMENT_WEIGHT = 0.5;

const LOW_CONVERSION_THRESHOLD = 40;
const LOW_ENGAGEMENT_THRESHOLD = 40;
const LOW_SENTIMENT_THRESHOLD = 40;
const LOW_COMPLETION_THRESHOLD = 50;
const HIGH_CONVERSION_THRESHOLD = 70;

/**
 * Tallies each active customer agent's individually-configured `sentiment`
 * into three buckets. This is real per-agent data (not a fabricated split of
 * a single aggregate score) — `mixed` is folded into `neutral` since the
 * report only has three response buckets, not four.
 */
function tallySentiments(sentiments) {
  const counts = { positiveResponses: 0, neutralResponses: 0, negativeResponses: 0 };

  for (const { sentiment } of sentiments) {
    if (sentiment === 'positive') counts.positiveResponses += 1;
    else if (sentiment === 'negative') counts.negativeResponses += 1;
    else counts.neutralResponses += 1;
  }

  return counts;
}

/**
 * Every field here is a deterministic function of the simulation's own
 * stored data — no AI, no randomness.
 *
 *  - conversationCount/completionRate/responseRate/averageSentiment are
 *    carried over directly from `simulation.statistics` (already computed
 *    deterministically in simulation.service.js).
 *  - positive/neutral/negativeResponses come from tallying each active
 *    customer agent's own `sentiment` field for this simulation.
 *  - averageResponseTime (seconds) spreads the simulation's estimated
 *    duration (minutes) evenly across the conversations it actually
 *    produced: `estimatedDuration * 60 / max(conversationCount, 1)`.
 *  - conversionScore is a weighted average of completionRate (60%) and
 *    responseRate (40%) — a simulation that both finishes and gets
 *    responses converts better than one that does only one of the two.
 *  - engagementScore is a weighted average of responseRate (50%) and
 *    averageSentiment (50%) — engagement reflects both how many customers
 *    responded and how positively they felt.
 */
function computeMetrics(simulation, sentiments) {
  const { conversationCount, completionRate, responseRate, averageSentiment } = simulation.statistics;
  const { positiveResponses, neutralResponses, negativeResponses } = tallySentiments(sentiments);

  const averageResponseTime = simulation.estimatedDuration
    ? Math.round((simulation.estimatedDuration * 60) / Math.max(conversationCount, 1))
    : 0;

  const conversionScore = Math.round(completionRate * CONVERSION_COMPLETION_WEIGHT + responseRate * CONVERSION_RESPONSE_WEIGHT);
  const engagementScore = Math.round(responseRate * ENGAGEMENT_RESPONSE_WEIGHT + averageSentiment * ENGAGEMENT_SENTIMENT_WEIGHT);

  return {
    conversationCount,
    completionRate,
    responseRate,
    averageSentiment,
    positiveResponses,
    neutralResponses,
    negativeResponses,
    averageResponseTime,
    conversionScore,
    engagementScore,
  };
}

/** A short, deterministic narrative built purely from the computed numbers — no AI. */
function buildSummary(simulationTitle, metrics) {
  return (
    `"${simulationTitle}" completed ${metrics.conversationCount} conversation(s) with a ` +
    `${metrics.completionRate}% completion rate and a ${metrics.responseRate}% response rate. ` +
    `Conversion score: ${metrics.conversionScore}/100. Engagement score: ${metrics.engagementScore}/100.`
  );
}

/**
 * Fixed threshold rules, evaluated independently — any number can match.
 * Falls back to a single "steady state" recommendation when none do, so
 * `recommendations` is never empty.
 */
function buildRecommendations(metrics) {
  const recommendations = [];

  if (metrics.conversionScore < LOW_CONVERSION_THRESHOLD) {
    recommendations.push({
      title: 'Improve Conversion Funnel',
      description: `Conversion score is ${metrics.conversionScore}/100. Review pricing, messaging, and onboarding friction.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
    });
  }

  if (metrics.engagementScore < LOW_ENGAGEMENT_THRESHOLD) {
    recommendations.push({
      title: 'Boost Customer Engagement',
      description: `Engagement score is ${metrics.engagementScore}/100. Consider more interactive or personalized conversation flows.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
    });
  }

  if (metrics.averageSentiment < LOW_SENTIMENT_THRESHOLD) {
    recommendations.push({
      title: 'Address Negative Sentiment',
      description: `Average sentiment is ${metrics.averageSentiment}/100. Investigate the most common negative feedback themes.`,
      priority: RECOMMENDATION_PRIORITY.HIGH,
    });
  }

  if (metrics.completionRate < LOW_COMPLETION_THRESHOLD) {
    recommendations.push({
      title: 'Increase Simulation Completion',
      description: `Only ${metrics.completionRate}% of the simulation completed. Consider a shorter or simpler conversation flow.`,
      priority: RECOMMENDATION_PRIORITY.MEDIUM,
    });
  }

  if (metrics.conversionScore >= HIGH_CONVERSION_THRESHOLD && metrics.positiveResponses >= metrics.negativeResponses) {
    recommendations.push({
      title: 'Scale Successful Approach',
      description: `Conversion score is ${metrics.conversionScore}/100 with more positive than negative responses. This configuration is a strong candidate to reuse on similar products.`,
      priority: RECOMMENDATION_PRIORITY.LOW,
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: 'Maintain Current Strategy',
      description: 'Metrics are within normal ranges. No corrective action is indicated at this time.',
      priority: RECOMMENDATION_PRIORITY.LOW,
    });
  }

  return recommendations;
}

module.exports = { computeMetrics, buildSummary, buildRecommendations };
