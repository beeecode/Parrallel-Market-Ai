const { CustomerAgent } = require('../models/CustomerAgent');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const SIMULATION_POPULATE_FIELDS = 'title status';
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'avatar',
  'age',
  'occupation',
  'location',
  'income',
  'personality',
  'goals',
  'painPoints',
  'buyingBehavior',
  'communicationStyle',
  'sentiment',
  'status',
  'metadata',
];

function populate(query) {
  return query.populate('owner', OWNER_POPULATE_FIELDS).populate('simulation', SIMULATION_POPULATE_FIELDS);
}

function findById(id) {
  return populate(CustomerAgent.findOne({ _id: id, isActive: true })).exec();
}

/** Case-insensitive per-simulation name lookup, used for duplicate detection. */
function findDuplicateName(simulation, name, { excludeId } = {}) {
  const filter = { simulation, name, isActive: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return CustomerAgent.findOne(filter).collation(CASE_INSENSITIVE_COLLATION).exec();
}

function findByOwner(ownerId, filters, { skip, limit, sort }) {
  return populate(
    CustomerAgent.find({ ...filters, owner: ownerId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findAll(filters, { skip, limit, sort }) {
  return populate(
    CustomerAgent.find({ ...filters, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

/** Used by the nested `/simulations/:id/customer-agents` listing endpoint. */
function findBySimulation(simulationId, filters, { skip, limit, sort }) {
  return populate(
    CustomerAgent.find({ ...filters, simulation: simulationId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function count(filters) {
  return CustomerAgent.countDocuments(filters).exec();
}

/** Raw sentiment labels for every active agent of a simulation — used by report.service.js to derive positive/neutral/negative response counts from real per-agent data instead of reverse-engineering them from an aggregate score. */
function findSentiments(simulationId) {
  return CustomerAgent.find({ simulation: simulationId, isActive: true }).select('sentiment').lean().exec();
}

function create(data) {
  return CustomerAgent.create(data);
}

/** Only ever writes the whitelisted fields — never `simulation`, `owner`, or `isActive` from client input. */
function update(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return populate(CustomerAgent.findOneAndUpdate({ _id: id, isActive: true }, safeUpdates, { new: true, runValidators: true })).exec();
}

function softDelete(id) {
  return CustomerAgent.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }).exec();
}

/** Cascades a soft-delete to every active agent of a simulation that is itself being archived/deleted. */
function softDeleteBySimulation(simulationId) {
  return CustomerAgent.updateMany({ simulation: simulationId, isActive: true }, { isActive: false }).exec();
}

module.exports = {
  findById,
  findDuplicateName,
  findByOwner,
  findAll,
  findBySimulation,
  count,
  findSentiments,
  create,
  update,
  softDelete,
  softDeleteBySimulation,
};
