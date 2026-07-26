const customerAgentRepository = require('../repositories/customerAgent.repository');
const insightRepository = require('../repositories/insight.repository');
const reportRepository = require('../repositories/report.repository');
const simulationService = require('./simulation.service');
const { buildInsights } = require('./insightRules');
const { computeMetrics, buildRecommendations, buildSummary } = require('./reportAnalytics');
const { ROLES } = require('../constants/roles');
const { REPORT_STATUS } = require('../constants/reportStatus');
const { SIMULATION_STATUS } = require('../constants/simulationStatus');
const { ConflictError, NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['title', 'status', 'createdAt', 'generatedAt', 'conversionScore', 'engagementScore'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Report not found.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  // conversionScore/engagementScore live under the `metrics` sub-document.
  const path = field === 'conversionScore' || field === 'engagementScore' ? `metrics.${field}` : field;
  return { [path]: order === 'asc' ? 1 : -1 };
}

function buildFilters({ search, status }) {
  const filters = {};
  if (status) filters.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ title: pattern }, { description: pattern }, { summary: pattern }];
  }

  return filters;
}

async function listReports(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);
  const isOwnerScoped = user.role === ROLES.BUSINESS_OWNER;

  const [items, totalItems] = await Promise.all([
    isOwnerScoped
      ? reportRepository.findByOwner(user.sub, filters, { skip, limit, sort })
      : reportRepository.findAll(filters, { skip, limit, sort }),
    reportRepository.count({ ...filters, isActive: true, ...(isOwnerScoped ? { owner: user.sub } : {}) }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getReport(user, id) {
  const report = await reportRepository.findById(id);
  if (!report || !canAccessResource(report, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return report.toJSON();
}

/**
 * Idempotent: if an active report already exists for this simulation, it is
 * returned as-is (`created: false`) rather than raising a conflict or
 * minting a duplicate — the unique partial index on `Report.simulation` is
 * the last-resort safety net for a race between two concurrent calls.
 */
async function generateReport(user, payload) {
  const simulation = await simulationService.getSimulation(user, payload.simulation);

  if (simulation.status !== SIMULATION_STATUS.COMPLETED) {
    throw new ConflictError('Only completed simulations can generate a report.');
  }

  const existing = await reportRepository.findActiveBySimulation(payload.simulation);
  if (existing) {
    return { report: existing.toJSON(), created: false };
  }

  const ownerId = simulation.owner.id;
  const sentiments = await customerAgentRepository.findSentiments(payload.simulation);
  const metrics = computeMetrics(simulation, sentiments);
  const recommendations = buildRecommendations(metrics);
  const summary = buildSummary(simulation.title, metrics);

  // Built explicitly (not spread from `payload`) — metrics, recommendations,
  // generatedAt, generatedBy, owner, status, and isActive are all
  // server-generated and can never be set from client input.
  const created = await reportRepository.create({
    title: payload.title ?? `${simulation.title} — Report`,
    description: payload.description,
    summary,
    metrics,
    recommendations,
    status: REPORT_STATUS.GENERATED,
    generatedAt: new Date(),
    generatedBy: user.sub,
    owner: ownerId,
    simulation: payload.simulation,
    product: simulation.product.id,
  });

  const insights = buildInsights(metrics);
  await Promise.all(insights.map((data) => insightRepository.create({ ...data, report: created.id, owner: ownerId })));

  const populated = await reportRepository.findById(created.id);
  return { report: populated.toJSON(), created: true };
}

async function updateReport(user, id, updates) {
  const existing = await reportRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  const updated = await reportRepository.update(id, updates);
  return updated.toJSON();
}

/**
 * Backs both `DELETE /:id` and `PATCH /:id/archive` — same operation under
 * two names, mirroring Simulation. Cascades to every active insight of this
 * report, per the requirement that deleting a report must not physically
 * remove its insights.
 */
async function archiveReport(user, id) {
  const existing = await reportRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await reportRepository.softDelete(id, REPORT_STATUS.ARCHIVED);
  await insightRepository.softDeleteByReport(id);
}

/**
 * Restores the report itself only — it does not cascade-restore insights,
 * matching the precedent set by Simulation/CustomerAgent: an insight that
 * was independently soft-deleted before the report was archived can't be
 * distinguished from one removed by the cascade.
 */
async function restoreReport(user, id) {
  const existing = await reportRepository.findByIdAny(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  if (existing.isActive) {
    throw new ConflictError('Report is not archived.');
  }

  await reportRepository.restore(id, REPORT_STATUS.GENERATED);
  const restored = await reportRepository.findById(id);
  return restored.toJSON();
}

module.exports = { listReports, getReport, generateReport, updateReport, archiveReport, restoreReport };
