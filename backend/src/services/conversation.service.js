const conversationRepository = require('../repositories/conversation.repository');
const messageRepository = require('../repositories/message.repository');
const customerAgentService = require('./customerAgent.service');
const { ROLES } = require('../constants/roles');
const { ConflictError, NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['createdAt', 'updatedAt', 'lastActivity', 'messageCount'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Conversation not found.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters({ search, status, simulation, customerAgent }) {
  const filters = {};
  if (status) filters.status = status;
  if (simulation) filters.simulation = simulation;
  if (customerAgent) filters.customerAgent = customerAgent;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ title: pattern }, { 'metadata.tags': pattern }];
  }

  return filters;
}

async function listConversations(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);
  const isOwnerScoped = user.role === ROLES.BUSINESS_OWNER;
  if (isOwnerScoped) filters.owner = user.sub;

  const [items, totalItems] = await Promise.all([
    query.simulation
      ? conversationRepository.findBySimulation(query.simulation, filters, { skip, limit, sort })
      : query.customerAgent
        ? conversationRepository.findByCustomerAgent(query.customerAgent, filters, { skip, limit, sort })
        : isOwnerScoped
          ? conversationRepository.findByOwner(user.sub, filters, { skip, limit, sort })
          : conversationRepository.findAll(filters, { skip, limit, sort }),
    conversationRepository.count({ ...filters, isActive: true }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getConversation(user, id) {
  const conversation = await conversationRepository.findById(id);
  if (!conversation || !canAccessResource(conversation, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return conversation.toJSON();
}

async function createConversation(user, payload) {
  // Confirms the customer agent exists and is accessible to this caller
  // (404 otherwise) — reuses customerAgent.service.js unmodified. `owner`
  // and `simulation` are both derived from the agent, never accepted from
  // the client, so a conversation can never be created against a mismatched
  // simulation/agent pair.
  const customerAgent = await customerAgentService.getCustomerAgent(user, payload.customerAgent);

  // Built explicitly (not spread from `payload`) — messageCount,
  // lastMessage, lastActivity, status, owner, simulation, and isActive are
  // all server-generated and can never be set from client input.
  const created = await conversationRepository.create({
    title: payload.title,
    metadata: payload.metadata,
    owner: customerAgent.owner.id,
    simulation: customerAgent.simulation.id,
    customerAgent: payload.customerAgent,
  });

  const populated = await conversationRepository.findById(created.id);
  return populated.toJSON();
}

async function updateConversation(user, id, updates) {
  const existing = await conversationRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  const patch = { ...updates };
  // Merged, never replaced — a partial `metadata` update must not wipe out
  // fields (like existing tags) the client didn't mention.
  if (updates.metadata) {
    patch.metadata = { ...existing.metadata.toObject(), ...updates.metadata };
  }

  const updated = await conversationRepository.update(id, patch);
  return updated.toJSON();
}

/**
 * Backs both `DELETE /:id` and `PATCH /:id/archive`. Cascades to every
 * non-deleted message of this conversation, per the requirement that
 * deleting a conversation must soft-delete its messages.
 */
async function archiveConversation(user, id) {
  const existing = await conversationRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await conversationRepository.softDelete(id);
  await messageRepository.softDeleteByConversation(id);
}

/**
 * Restores the conversation itself only — it does not cascade-restore
 * messages, per the explicit requirement that restoring a conversation must
 * not restore messages. Always reopens to "Open" rather than trying to
 * recall whether it was "Open" or "Closed" before archiving.
 */
async function restoreConversation(user, id) {
  const existing = await conversationRepository.findByIdAny(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  if (existing.isActive) {
    throw new ConflictError('Conversation is not archived.');
  }

  await conversationRepository.restore(id);
  const restored = await conversationRepository.findById(id);
  return restored.toJSON();
}

/** Called by message.service.js after a message is sent. */
async function recordNewMessage(conversationId, content) {
  await conversationRepository.recordNewMessage(conversationId, content);
}

/** Called by message.service.js after a message is soft-deleted — recomputes messageCount/lastMessage/lastActivity from what remains. */
async function recalculateAfterMessageDeletion(conversationId) {
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) return;

  const latest = await messageRepository.findLatestForConversation(conversationId);
  const messageCount = Math.max(0, conversation.messageCount - 1);

  await conversationRepository.applyMessageDeletion(conversationId, {
    messageCount,
    lastMessage: latest ? latest.content : null,
    lastActivity: latest ? latest.createdAt : null,
  });
}

module.exports = {
  listConversations,
  getConversation,
  createConversation,
  updateConversation,
  archiveConversation,
  restoreConversation,
  recordNewMessage,
  recalculateAfterMessageDeletion,
};
