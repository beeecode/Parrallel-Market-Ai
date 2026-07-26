const { buildRecommendations, buildSummary, computeMetrics } = require('../../src/services/reportAnalytics');

describe('computeMetrics', () => {
  const simulation = {
    title: 'Test Sim',
    estimatedDuration: 10,
    statistics: { conversationCount: 5, completionRate: 100, responseRate: 50, averageSentiment: 80 },
  };

  it('carries statistics fields over unchanged', () => {
    const metrics = computeMetrics(simulation, []);
    expect(metrics.conversationCount).toBe(5);
    expect(metrics.completionRate).toBe(100);
    expect(metrics.responseRate).toBe(50);
    expect(metrics.averageSentiment).toBe(80);
  });

  it('tallies positive/neutral/negative responses from real agent sentiments, folding "mixed" into neutral', () => {
    const sentiments = [{ sentiment: 'positive' }, { sentiment: 'positive' }, { sentiment: 'negative' }, { sentiment: 'mixed' }, { sentiment: 'neutral' }];
    const metrics = computeMetrics(simulation, sentiments);
    expect(metrics.positiveResponses).toBe(2);
    expect(metrics.negativeResponses).toBe(1);
    expect(metrics.neutralResponses).toBe(2);
  });

  it('computes averageResponseTime as estimatedDuration (minutes->seconds) spread across conversationCount', () => {
    const metrics = computeMetrics(simulation, []);
    expect(metrics.averageResponseTime).toBe(Math.round((10 * 60) / 5));
  });

  it('returns 0 averageResponseTime when estimatedDuration is not set', () => {
    const metrics = computeMetrics({ ...simulation, estimatedDuration: null }, []);
    expect(metrics.averageResponseTime).toBe(0);
  });

  it('computes conversionScore as 60% completionRate + 40% responseRate', () => {
    const metrics = computeMetrics(simulation, []);
    expect(metrics.conversionScore).toBe(Math.round(100 * 0.6 + 50 * 0.4));
  });

  it('computes engagementScore as 50% responseRate + 50% averageSentiment', () => {
    const metrics = computeMetrics(simulation, []);
    expect(metrics.engagementScore).toBe(Math.round(50 * 0.5 + 80 * 0.5));
  });
});

describe('buildRecommendations', () => {
  it('recommends improving conversion when conversionScore is low', () => {
    const recs = buildRecommendations({ conversionScore: 20, engagementScore: 80, averageSentiment: 80, completionRate: 100, positiveResponses: 5, negativeResponses: 0 });
    expect(recs.map((r) => r.title)).toContain('Improve Conversion Funnel');
  });

  it('falls back to a single steady-state recommendation when nothing is wrong', () => {
    const recs = buildRecommendations({ conversionScore: 60, engagementScore: 60, averageSentiment: 60, completionRate: 60, positiveResponses: 1, negativeResponses: 1 });
    expect(recs).toEqual([expect.objectContaining({ title: 'Maintain Current Strategy' })]);
  });

  it('never returns an empty array', () => {
    const recs = buildRecommendations({ conversionScore: 50, engagementScore: 50, averageSentiment: 50, completionRate: 50, positiveResponses: 0, negativeResponses: 0 });
    expect(recs.length).toBeGreaterThan(0);
  });

  it('recommends scaling when conversion is strong and positive responses outweigh negative', () => {
    const recs = buildRecommendations({ conversionScore: 90, engagementScore: 90, averageSentiment: 90, completionRate: 100, positiveResponses: 5, negativeResponses: 1 });
    expect(recs.map((r) => r.title)).toContain('Scale Successful Approach');
  });
});

describe('buildSummary', () => {
  it('builds a deterministic string from the metrics, with no randomness', () => {
    const metrics = { conversationCount: 3, completionRate: 100, responseRate: 75, conversionScore: 88, engagementScore: 70 };
    const summary = buildSummary('My Sim', metrics);
    expect(summary).toBe(
      '"My Sim" completed 3 conversation(s) with a 100% completion rate and a 75% response rate. Conversion score: 88/100. Engagement score: 70/100.',
    );
  });
});
