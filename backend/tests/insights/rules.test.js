const { buildInsights } = require('../../src/services/insightRules');

const BASE_METRICS = {
  conversationCount: 5,
  completionRate: 55,
  responseRate: 55,
  averageSentiment: 55,
  positiveResponses: 2,
  neutralResponses: 2,
  negativeResponses: 1,
  averageResponseTime: 90,
  conversionScore: 55,
  engagementScore: 55,
};

function titlesOf(insights) {
  return insights.map((item) => item.title);
}

describe('buildInsights (deterministic rule engine)', () => {
  it('produces no insights when every metric sits in the neutral middle band', () => {
    const insights = buildInsights(BASE_METRICS);
    expect(insights).toEqual([]);
  });

  it('fires High Engagement when engagementScore >= 70', () => {
    const insights = buildInsights({ ...BASE_METRICS, engagementScore: 70 });
    expect(titlesOf(insights)).toContain('High Engagement');
    expect(insights.find((i) => i.title === 'High Engagement')).toEqual(
      expect.objectContaining({ category: 'engagement', trend: 'Positive', importance: 'Medium', score: 70 }),
    );
  });

  it('does not fire High Engagement just under the threshold', () => {
    const insights = buildInsights({ ...BASE_METRICS, engagementScore: 69 });
    expect(titlesOf(insights)).not.toContain('High Engagement');
  });

  it('fires Low Sentiment when averageSentiment < 40', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageSentiment: 39 });
    expect(titlesOf(insights)).toContain('Low Sentiment');
    expect(insights.find((i) => i.title === 'Low Sentiment').trend).toBe('Negative');
  });

  it('fires Strong Conversion when conversionScore >= 70', () => {
    const insights = buildInsights({ ...BASE_METRICS, conversionScore: 70 });
    expect(titlesOf(insights)).toContain('Strong Conversion');
  });

  it('fires Weak Conversion when conversionScore < 40', () => {
    const insights = buildInsights({ ...BASE_METRICS, conversionScore: 39 });
    expect(titlesOf(insights)).toContain('Weak Conversion');
  });

  it('fires Customer Satisfaction when sentiment and completion are both >= 60', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageSentiment: 60, completionRate: 60 });
    expect(titlesOf(insights)).toContain('Customer Satisfaction');
  });

  it('fires Pricing Concern when sentiment and conversion are both < 50', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageSentiment: 49, conversionScore: 49 });
    expect(titlesOf(insights)).toContain('Pricing Concern');
  });

  it('fires Purchase Hesitation when completionRate < 50', () => {
    const insights = buildInsights({ ...BASE_METRICS, completionRate: 49 });
    expect(titlesOf(insights)).toContain('Purchase Hesitation');
  });

  it('fires Communication Issue when responseRate < 50', () => {
    const insights = buildInsights({ ...BASE_METRICS, responseRate: 49 });
    expect(titlesOf(insights)).toContain('Communication Issue');
  });

  it('fires Product Fit when sentiment and conversion are both >= 60', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageSentiment: 60, conversionScore: 60 });
    expect(titlesOf(insights)).toContain('Product Fit');
  });

  it('fires Response Quality Concern when averageResponseTime > 120', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageResponseTime: 121 });
    expect(titlesOf(insights)).toContain('Response Quality Concern');
  });

  it('fires Strong Response Quality when averageResponseTime is between 1 and 60 seconds', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageResponseTime: 60 });
    expect(titlesOf(insights)).toContain('Strong Response Quality');
  });

  it('never fires both Response Quality insights at once', () => {
    const slow = buildInsights({ ...BASE_METRICS, averageResponseTime: 200 });
    const fast = buildInsights({ ...BASE_METRICS, averageResponseTime: 30 });
    expect(titlesOf(slow).filter((t) => t.startsWith('Response Quality') || t === 'Strong Response Quality')).toHaveLength(1);
    expect(titlesOf(fast).filter((t) => t.startsWith('Response Quality') || t === 'Strong Response Quality')).toHaveLength(1);
  });

  it('can fire multiple independent rules simultaneously', () => {
    const insights = buildInsights({
      ...BASE_METRICS,
      engagementScore: 90,
      averageSentiment: 90,
      conversionScore: 90,
      completionRate: 90,
      responseRate: 90,
    });
    const titles = titlesOf(insights);
    expect(titles).toEqual(
      expect.arrayContaining(['High Engagement', 'Strong Conversion', 'Customer Satisfaction', 'Product Fit']),
    );
  });

  it('clamps score to the 0-100 range', () => {
    const insights = buildInsights({ ...BASE_METRICS, averageResponseTime: 500 });
    const concern = insights.find((i) => i.title === 'Response Quality Concern');
    expect(concern.score).toBeLessThanOrEqual(100);
  });

  it('every generated insight includes deterministic metadata (tags derived from category, fixed source)', () => {
    const insights = buildInsights({ ...BASE_METRICS, engagementScore: 90 });
    const highEngagement = insights.find((i) => i.title === 'High Engagement');
    expect(highEngagement.metadata).toEqual({ tags: ['engagement'], source: 'deterministic-engine', notes: null });
  });
});
