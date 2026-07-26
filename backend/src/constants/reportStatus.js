/**
 * Capitalized per this phase's spec (unlike the lowercase enums used by
 * Product/Simulation/CustomerAgent in earlier phases) — intentional, not an
 * inconsistency: Report/Insight fields (status, priority, importance, trend)
 * were all specified capitalized.
 */
const REPORT_STATUS = Object.freeze({
  DRAFT: 'Draft',
  GENERATED: 'Generated',
  ARCHIVED: 'Archived',
});

module.exports = { REPORT_STATUS };
