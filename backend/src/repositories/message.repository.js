const { Message } = require('../models/Message');
const { MESSAGE_STATUS } = require('../constants/messageStatus');

const CONVERSATION_POPULATE_FIELDS = 'title status';
const ALLOWED_UPDATE_FIELDS = ['content', 'attachments', 'metadata', 'edited', 'editedAt'];

// Deliberately never populates `sender` — it's a polymorphic reference
// (`refPath: 'senderType'`) that resolves to `User`, `CustomerAgent`, or a
// non-existent "System" model, and populating the latter would error.
function populate(query) {
  return query.populate('owner', 'fullName email companyName').populate('conversation', CONVERSATION_POPULATE_FIELDS);
}

function findById(id) {
  return populate(Message.findOne({ _id: id, deleted: false })).exec();
}

function findByOwner(ownerId, filters, { skip, limit, sort }) {
  return populate(
    Message.find({ ...filters, owner: ownerId, deleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findAll(filters, { skip, limit, sort }) {
  return populate(
    Message.find({ ...filters, deleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

/** Used by the nested `/conversations/:id/messages` listing endpoint. */
function findByConversation(conversationId, filters, { skip, limit, sort }) {
  return populate(
    Message.find({ ...filters, conversation: conversationId, deleted: false })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

/** The most recent non-deleted message in a conversation — used to recompute `lastMessage`/`lastActivity` after a deletion. */
function findLatestForConversation(conversationId) {
  return Message.findOne({ conversation: conversationId, deleted: false }).sort({ createdAt: -1 }).exec();
}

function count(filters) {
  return Message.countDocuments(filters).exec();
}

function create(data) {
  return Message.create(data);
}

/** Only ever writes the whitelisted fields — never `sender`, `senderType`, `conversation`, `owner`, `status`, `isRead`, `readAt`, `deleted`, or `deletedAt` from client input. */
function update(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return populate(Message.findOneAndUpdate({ _id: id, deleted: false }, safeUpdates, { new: true, runValidators: true })).exec();
}

function softDelete(id) {
  return Message.findOneAndUpdate({ _id: id, deleted: false }, { deleted: true, deletedAt: new Date() }, { new: true }).exec();
}

/** Cascades a soft-delete to every message of a conversation that is itself being archived/deleted. Restoring a conversation never reverses this. */
function softDeleteByConversation(conversationId) {
  return Message.updateMany({ conversation: conversationId, deleted: false }, { deleted: true, deletedAt: new Date() }).exec();
}

function markRead(id) {
  return populate(
    Message.findOneAndUpdate(
      { _id: id, deleted: false },
      { status: MESSAGE_STATUS.READ, isRead: true, readAt: new Date() },
      { new: true },
    ),
  ).exec();
}

module.exports = {
  findById,
  findByOwner,
  findAll,
  findByConversation,
  findLatestForConversation,
  count,
  create,
  update,
  softDelete,
  softDeleteByConversation,
  markRead,
};
