const SENTIMENT = Object.freeze({
  POSITIVE: 'positive',
  NEUTRAL: 'neutral',
  NEGATIVE: 'negative',
  MIXED: 'mixed',
});

/**
 * Deterministic numeric projection of a sentiment label onto a 0–100 scale,
 * used to compute `statistics.averageSentiment` without any AI/randomness —
 * a pure function of the simulation's own configured sentiment.
 */
const SENTIMENT_SCORE = Object.freeze({
  [SENTIMENT.POSITIVE]: 100,
  [SENTIMENT.NEUTRAL]: 50,
  [SENTIMENT.MIXED]: 50,
  [SENTIMENT.NEGATIVE]: 0,
});

module.exports = { SENTIMENT, SENTIMENT_SCORE };
