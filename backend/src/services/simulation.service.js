const customerAgentRepository = require('../repositories/customerAgent.repository');
const simulationRepository = require('../repositories/simulation.repository');
const productService = require('./product.service');
const { ROLES } = require('../constants/roles');
const { SENTIMENT, SENTIMENT_SCORE } = require('../constants/sentiment');
const { SIMULATION_STATUS, SIMULATION_STATUS_TRANSITIONS } = require('../constants/simulationStatus');
const { ConflictError, NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource, resolveRefId } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['title', 'status', 'progress', 'createdAt', 'updatedAt'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Simulation not found.';
const DUPLICATE_MESSAGE = 'You already have a simulation with this title for this product.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters({ search, status }) {
  const filters = {};
  if (status) filters.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ title: pattern }, { industry: pattern }, { description: pattern }];
  }

  return filters;
}

/**
 * Simple, deterministic statistics — no AI, no randomness. `conversationCount`
 * and `responseRate` are derived from the actual count of active customer
 * agents; `completionRate` mirrors `progress` (forced to 100 once the
 * simulation is completed); `averageSentiment` is a fixed numeric projection
 * of the configured sentiment label.
 */
function computeStatistics({ status, progress, sentiment, activeAgentCount, customerCount }) {
  const responseRate = customerCount > 0 ? Math.min(100, Math.round((activeAgentCount / customerCount) * 100)) : 0;
  const completionRate = status === SIMULATION_STATUS.COMPLETED ? 100 : progress;
  const averageSentiment = SENTIMENT_SCORE[sentiment] ?? SENTIMENT_SCORE[SENTIMENT.NEUTRAL];

  return { conversationCount: activeAgentCount, completionRate, responseRate, averageSentiment };
}

function assertValidTransition(currentStatus, nextStatus) {
  const allowed = SIMULATION_STATUS_TRANSITIONS[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw new ConflictError(`Cannot transition simulation from "${currentStatus}" to "${nextStatus}".`);
  }
}

async function listSimulations(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);
  const isOwnerScoped = user.role === ROLES.BUSINESS_OWNER;

  const [items, totalItems] = await Promise.all([
    isOwnerScoped
      ? simulationRepository.findByOwner(user.sub, filters, { skip, limit, sort })
      : simulationRepository.findAll(filters, { skip, limit, sort }),
    simulationRepository.count({ ...filters, isActive: true, ...(isOwnerScoped ? { owner: user.sub } : {}) }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getSimulation(user, id) {
  const simulation = await simulationRepository.findById(id);
  if (!simulation || !canAccessResource(simulation, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return simulation.toJSON();
}

async function createSimulation(user, payload) {
  // Confirms the product exists and is accessible to this caller (404
  // otherwise) — reuses product.service.js unmodified, so a BUSINESS_OWNER
  // can only build a simulation on a product they own.
  await productService.getProduct(user, payload.product);

  const existing = await simulationRepository.findDuplicateTitle(user.sub, payload.product, payload.title);
  if (existing) {
    throw new ConflictError(DUPLICATE_MESSAGE);
  }

  const statistics = computeStatistics({
    status: SIMULATION_STATUS.DRAFT,
    progress: 0,
    sentiment: payload.configuration?.sentiment,
    activeAgentCount: 0,
    customerCount: payload.customerCount ?? 0,
  });

  // Built explicitly (not spread from `payload`) so a client can never sneak
  // an unlisted field — e.g. `status`, `isActive`, or `statistics` — into a
  // newly created simulation.
  const created = await simulationRepository.create({
    title: payload.title,
    description: payload.description,
    industry: payload.industry,
    targetAudience: payload.targetAudience,
    objective: payload.objective,
    customerCount: payload.customerCount,
    estimatedDuration: payload.estimatedDuration,
    configuration: payload.configuration,
    owner: user.sub,
    product: payload.product,
    status: SIMULATION_STATUS.DRAFT,
    progress: 0,
    statistics,
  });

  const populated = await simulationRepository.findById(created.id);
  return populated.toJSON();
}

async function updateSimulation(user, id, updates) {
  const existing = await simulationRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  if (updates.title && updates.title !== existing.title) {
    const ownerId = resolveRefId(existing, 'owner');
    const productId = resolveRefId(existing, 'product');
    const duplicate = await simulationRepository.findDuplicateTitle(ownerId, productId, updates.title, { excludeId: id });
    if (duplicate) {
      throw new ConflictError(DUPLICATE_MESSAGE);
    }
  }

  const patch = {
    title: updates.title,
    description: updates.description,
    industry: updates.industry,
    targetAudience: updates.targetAudience,
    objective: updates.objective,
    customerCount: updates.customerCount,
    estimatedDuration: updates.estimatedDuration,
    status: updates.status,
    progress: updates.progress,
  };

  // Nested objects are merged, never replaced — a partial `configuration`
  // update must not wipe out fields the client didn't mention.
  if (updates.configuration) {
    patch.configuration = { ...existing.configuration.toObject(), ...updates.configuration };
  }

  if (updates.status && updates.status !== existing.status) {
    assertValidTransition(existing.status, updates.status);

    if (updates.status === SIMULATION_STATUS.RUNNING && !existing.startedAt) {
      patch.startedAt = new Date();
    }
    if (updates.status === SIMULATION_STATUS.COMPLETED) {
      patch.completedAt = new Date();
      patch.progress = 100;
    }
    if (updates.status === SIMULATION_STATUS.CANCELLED) {
      patch.completedAt = new Date();
    }
  }

  // Statistics are never accepted from client input — always recomputed server-side.
  const activeAgentCount = await customerAgentRepository.count({ simulation: id, isActive: true });
  patch.statistics = computeStatistics({
    status: patch.status ?? existing.status,
    progress: patch.progress ?? existing.progress,
    sentiment: patch.configuration?.sentiment ?? existing.configuration?.sentiment,
    activeAgentCount,
    customerCount: patch.customerCount ?? existing.customerCount,
  });

  const updated = await simulationRepository.update(id, patch);
  return updated.toJSON();
}

/**
 * Backs both `DELETE /:id` and `PATCH /:id/archive` — the schema has no
 * separate "archived" status distinct from the soft-delete flag, so the two
 * routes are intentionally the same operation under two names. Cascades to
 * every active customer agent of this simulation, per the requirement that
 * deleting a simulation must not physically remove its agents.
 */
async function archiveSimulation(user, id) {
  const existing = await simulationRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await simulationRepository.softDelete(id);
  await customerAgentRepository.softDeleteBySimulation(id);
}

/**
 * Restores the simulation itself only — it does not cascade-restore agents,
 * since an agent may have been independently soft-deleted for its own
 * reasons before the simulation was archived.
 */
async function restoreSimulation(user, id) {
  const existing = await simulationRepository.findByIdAny(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  if (existing.isActive) {
    throw new ConflictError('Simulation is not archived.');
  }

  await simulationRepository.restore(id);
  const restored = await simulationRepository.findById(id);
  return restored.toJSON();
}

/** Called by customerAgentService after an agent is created or soft-deleted. */
async function recalculateStatistics(simulationId) {
  const simulation = await simulationRepository.findById(simulationId);
  if (!simulation) return;

  const activeAgentCount = await customerAgentRepository.count({ simulation: simulationId, isActive: true });
  const statistics = computeStatistics({
    status: simulation.status,
    progress: simulation.progress,
    sentiment: simulation.configuration?.sentiment,
    activeAgentCount,
    customerCount: simulation.customerCount,
  });

  await simulationRepository.update(simulationId, { statistics });
}

module.exports = {
  listSimulations,
  getSimulation,
  createSimulation,
  updateSimulation,
  archiveSimulation,
  restoreSimulation,
  recalculateStatistics,
};
