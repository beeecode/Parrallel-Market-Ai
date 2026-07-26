const customerAgentRepository = require('../repositories/customerAgent.repository');
const simulationService = require('./simulation.service');
const { ROLES } = require('../constants/roles');
const { ConflictError, NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource, resolveRefId } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['name', 'status', 'createdAt', 'updatedAt'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Customer agent not found.';
const DUPLICATE_MESSAGE = 'This simulation already has a customer agent with this name.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters({ search, status }) {
  const filters = {};
  if (status) filters.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ name: pattern }, { occupation: pattern }, { location: pattern }, { personality: pattern }];
  }

  return filters;
}

async function listCustomerAgents(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);
  const isOwnerScoped = user.role === ROLES.BUSINESS_OWNER;

  const [items, totalItems] = await Promise.all([
    isOwnerScoped
      ? customerAgentRepository.findByOwner(user.sub, filters, { skip, limit, sort })
      : customerAgentRepository.findAll(filters, { skip, limit, sort }),
    customerAgentRepository.count({ ...filters, isActive: true, ...(isOwnerScoped ? { owner: user.sub } : {}) }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

/** Backs `GET /simulations/:id/customer-agents` — access to the simulation is the only gate. */
async function listAgentsForSimulation(user, simulationId, query) {
  await simulationService.getSimulation(user, simulationId);

  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);

  const [items, totalItems] = await Promise.all([
    customerAgentRepository.findBySimulation(simulationId, filters, { skip, limit, sort }),
    customerAgentRepository.count({ ...filters, simulation: simulationId, isActive: true }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getCustomerAgent(user, id) {
  const agent = await customerAgentRepository.findById(id);
  if (!agent || !canAccessResource(agent, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return agent.toJSON();
}

async function createCustomerAgent(user, payload) {
  // Confirms the simulation exists and is accessible to this caller (404
  // otherwise). The agent's owner is always inherited from the simulation's
  // owner — not the caller — so an ADMIN adding an agent to someone else's
  // simulation doesn't orphan the agent from its owner's own resource list.
  const simulation = await simulationService.getSimulation(user, payload.simulation);
  const ownerId = simulation.owner.id;

  const existing = await customerAgentRepository.findDuplicateName(payload.simulation, payload.name);
  if (existing) {
    throw new ConflictError(DUPLICATE_MESSAGE);
  }

  // Built explicitly (not spread from `payload`) so a client can never sneak
  // an unlisted field — e.g. `owner`, `isActive`, or `metadata.score` beyond
  // what's validated — into a newly created agent.
  const created = await customerAgentRepository.create({
    name: payload.name,
    avatar: payload.avatar,
    age: payload.age,
    occupation: payload.occupation,
    location: payload.location,
    income: payload.income,
    personality: payload.personality,
    goals: payload.goals,
    painPoints: payload.painPoints,
    buyingBehavior: payload.buyingBehavior,
    communicationStyle: payload.communicationStyle,
    sentiment: payload.sentiment,
    status: payload.status,
    metadata: payload.metadata,
    simulation: payload.simulation,
    owner: ownerId,
  });

  await simulationService.recalculateStatistics(payload.simulation);

  const populated = await customerAgentRepository.findById(created.id);
  return populated.toJSON();
}

async function updateCustomerAgent(user, id, updates) {
  const existing = await customerAgentRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  if (updates.name && updates.name !== existing.name) {
    const simulationId = resolveRefId(existing, 'simulation');
    const duplicate = await customerAgentRepository.findDuplicateName(simulationId, updates.name, { excludeId: id });
    if (duplicate) {
      throw new ConflictError(DUPLICATE_MESSAGE);
    }
  }

  const patch = { ...updates };
  // Merged, never replaced — a partial `metadata` update must not wipe out
  // fields (like existing tags/notes) the client didn't mention.
  if (updates.metadata) {
    patch.metadata = { ...existing.metadata.toObject(), ...updates.metadata };
  }

  const updated = await customerAgentRepository.update(id, patch);
  return updated.toJSON();
}

async function deleteCustomerAgent(user, id) {
  const existing = await customerAgentRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await customerAgentRepository.softDelete(id);
  await simulationService.recalculateStatistics(resolveRefId(existing, 'simulation'));
}

module.exports = {
  listCustomerAgents,
  listAgentsForSimulation,
  getCustomerAgent,
  createCustomerAgent,
  updateCustomerAgent,
  deleteCustomerAgent,
};
