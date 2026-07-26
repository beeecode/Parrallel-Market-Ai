const messageRepository = require('../repositories/message.repository');
const conversationService = require('./conversation.service');
const { MESSAGE_SENDER_TYPE } = require('../constants/messageSenderType');
const { NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource, resolveRefId } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['createdAt', 'updatedAt'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Message not found.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters({ search }) {
  const filters = {};
  if (search) {
    filters.content = new RegExp(escapeRegExp(search), 'i');
  }
  return filters;
}

/** Backs `GET /conversations/:id/messages` — access to the conversation is the only gate. */
async function listMessagesForConversation(user, conversationId, query) {
  await conversationService.getConversation(user, conversationId);

  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(query);
  const sort = buildSort(query.sort, query.order);

  const [items, totalItems] = await Promise.all([
    messageRepository.findByConversation(conversationId, filters, { skip, limit, sort }),
    messageRepository.count({ ...filters, conversation: conversationId, deleted: false }),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getMessage(user, id) {
  const message = await messageRepository.findById(id);
  if (!message || !canAccessResource(message, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return message.toJSON();
}

/**
 * `sender` is always derived server-side from `senderType` — never accepted
 * from the client — so a caller can never spoof being a different user or a
 * customer agent that isn't the one already tied to this conversation:
 *  - "User"          → the authenticated caller
 *  - "CustomerAgent" → the conversation's own customer agent
 *  - "System"        → no sender document
 */
function resolveSender(senderType, user, conversation) {
  if (senderType === MESSAGE_SENDER_TYPE.USER) return user.sub;
  if (senderType === MESSAGE_SENDER_TYPE.CUSTOMER_AGENT) return conversation.customerAgent.id;
  return null;
}

async function sendMessage(user, payload) {
  const conversation = await conversationService.getConversation(user, payload.conversation);
  const sender = resolveSender(payload.senderType, user, conversation);

  // Built explicitly (not spread from `payload`) — status, isRead, readAt,
  // edited, editedAt, deleted, deletedAt, owner, and sender are all
  // server-generated and can never be set from client input.
  const created = await messageRepository.create({
    content: payload.content,
    type: payload.type,
    attachments: payload.attachments,
    metadata: payload.metadata,
    senderType: payload.senderType,
    sender,
    owner: conversation.owner.id,
    conversation: payload.conversation,
  });

  await conversationService.recordNewMessage(payload.conversation, payload.content);

  const populated = await messageRepository.findById(created.id);
  return populated.toJSON();
}

async function updateMessage(user, id, updates) {
  const existing = await messageRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  const patch = { ...updates };
  if (updates.metadata) {
    patch.metadata = { ...existing.metadata.toObject(), ...updates.metadata };
  }
  // Editing is tracked automatically — never accepted from client input.
  if (updates.content && updates.content !== existing.content) {
    patch.edited = true;
    patch.editedAt = new Date();
  }

  const updated = await messageRepository.update(id, patch);
  return updated.toJSON();
}

async function deleteMessage(user, id) {
  const existing = await messageRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await messageRepository.softDelete(id);
  await conversationService.recalculateAfterMessageDeletion(resolveRefId(existing, 'conversation'));
}

async function markRead(user, id) {
  const existing = await messageRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  const updated = await messageRepository.markRead(id);
  return updated.toJSON();
}

module.exports = { listMessagesForConversation, getMessage, sendMessage, updateMessage, deleteMessage, markRead };
