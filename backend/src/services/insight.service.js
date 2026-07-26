const insightRepository = require('../repositories/insight.repository');
const reportService = require('./report.service');
const { ROLES } = require('../constants/roles');
const { NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['title', 'importance', 'score', 'createdAt', 'updatedAt'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Insight not found.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters({ search, importance, trend }) {
  const filters = {};
  if (importance) filters.importance = importance;
  if (trend) filters.trend = trend;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ title: pattern }, { category: pattern }, { description: pattern }];
  }

  return filters;
}

async function listInsights(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);
  const isOwnerScoped = user.role === ROLES.BUSINESS_OWNER;

  const [items, totalItems] = await Promise.all([
    isOwnerScoped
      ? insightRepository.findByOwner(user.sub, filters, { skip, limit, sort })
      : insightRepository.findAll(filters, { skip, limit, sort }),
    insightRepository.count({ ...filters, isActive: true, ...(isOwnerScoped ? { owner: user.sub } : {}) }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

/** Backs `GET /reports/:id/insights` — access to the report is the only gate. */
async function listInsightsForReport(user, reportId, query) {
  await reportService.getReport(user, reportId);

  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);

  const [items, totalItems] = await Promise.all([
    insightRepository.findByReport(reportId, filters, { skip, limit, sort }),
    insightRepository.count({ ...filters, report: reportId, isActive: true }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getInsight(user, id) {
  const insight = await insightRepository.findById(id);
  if (!insight || !canAccessResource(insight, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return insight.toJSON();
}

module.exports = { listInsights, listInsightsForReport, getInsight };
