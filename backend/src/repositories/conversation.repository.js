const { Conversation } = require('../models/Conversation');
const { CONVERSATION_STATUS } = require('../constants/conversationStatus');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const SIMULATION_POPULATE_FIELDS = 'title status';
const CUSTOMER_AGENT_POPULATE_FIELDS = 'name status';
const ALLOWED_UPDATE_FIELDS = ['title', 'status', 'metadata'];
const MAX_LAST_MESSAGE_PREVIEW_LENGTH = 200;

function populate(query) {
  return query
    .populate('owner', OWNER_POPULATE_FIELDS)
    .populate('simulation', SIMULATION_POPULATE_FIELDS)
    .populate('customerAgent', CUSTOMER_AGENT_POPULATE_FIELDS);
}

function findById(id) {
  return populate(Conversation.findOne({ _id: id, isActive: true })).exec();
}

/** Used only by restore, which must find a document regardless of its current `isActive` value. */
function findByIdAny(id) {
  return populate(Conversation.findById(id)).exec();
}

function findByOwner(ownerId, filters, { skip, limit, sort }) {
  return populate(
    Conversation.find({ ...filters, owner: ownerId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findAll(filters, { skip, limit, sort }) {
  return populate(
    Conversation.find({ ...filters, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findBySimulation(simulationId, filters, { skip, limit, sort }) {
  return populate(
    Conversation.find({ ...filters, simulation: simulationId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findByCustomerAgent(customerAgentId, filters, { skip, limit, sort }) {
  return populate(
    Conversation.find({ ...filters, customerAgent: customerAgentId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function count(filters) {
  return Conversation.countDocuments(filters).exec();
}

function create(data) {
  return Conversation.create(data);
}

/** Only ever writes the whitelisted fields — never `lastMessage`, `lastActivity`, `messageCount`, `owner`, `simulation`, `customerAgent`, or `isActive` from client input. */
function update(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return populate(Conversation.findOneAndUpdate({ _id: id, isActive: true }, safeUpdates, { new: true, runValidators: true })).exec();
}

/** Called by message.service.js after a message is sent — atomically increments messageCount and refreshes the preview/activity timestamp. */
function recordNewMessage(id, content) {
  const preview = content.length > MAX_LAST_MESSAGE_PREVIEW_LENGTH ? `${content.slice(0, MAX_LAST_MESSAGE_PREVIEW_LENGTH)}…` : content;
  return Conversation.findByIdAndUpdate(
    id,
    { $inc: { messageCount: 1 }, lastMessage: preview, lastActivity: new Date() },
    { new: true },
  ).exec();
}

/** Called by message.service.js after a message is soft-deleted — recomputes messageCount/lastMessage/lastActivity from the remaining messages. */
function applyMessageDeletion(id, { messageCount, lastMessage, lastActivity }) {
  return Conversation.findByIdAndUpdate(id, { messageCount, lastMessage, lastActivity }, { new: true }).exec();
}

function softDelete(id) {
  return Conversation.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false, status: CONVERSATION_STATUS.ARCHIVED },
    { new: true },
  ).exec();
}

/** Always restores to "Open" — the prior Open/Closed distinction isn't preserved across an archive/restore cycle. */
function restore(id) {
  return Conversation.findOneAndUpdate(
    { _id: id, isActive: false },
    { isActive: true, status: CONVERSATION_STATUS.OPEN },
    { new: true },
  ).exec();
}

module.exports = {
  findById,
  findByIdAny,
  findByOwner,
  findAll,
  findBySimulation,
  findByCustomerAgent,
  count,
  create,
  update,
  recordNewMessage,
  applyMessageDeletion,
  softDelete,
  restore,
};
