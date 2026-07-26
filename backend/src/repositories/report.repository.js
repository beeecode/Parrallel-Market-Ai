const { Report } = require('../models/Report');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const SIMULATION_POPULATE_FIELDS = 'title status';
const PRODUCT_POPULATE_FIELDS = 'name category price currency';
const ALLOWED_UPDATE_FIELDS = ['title', 'description', 'summary'];

function populate(query) {
  return query
    .populate('owner', OWNER_POPULATE_FIELDS)
    .populate('simulation', SIMULATION_POPULATE_FIELDS)
    .populate('product', PRODUCT_POPULATE_FIELDS)
    .populate('generatedBy', OWNER_POPULATE_FIELDS);
}

function findById(id) {
  return populate(Report.findOne({ _id: id, isActive: true })).exec();
}

/** Used only by restore, which must find a document regardless of its current `isActive` value. */
function findByIdAny(id) {
  return populate(Report.findById(id)).exec();
}

/** The one-active-report-per-simulation lookup used for idempotent generation. */
function findActiveBySimulation(simulationId) {
  return populate(Report.findOne({ simulation: simulationId, isActive: true })).exec();
}

function findByOwner(ownerId, filters, { skip, limit, sort }) {
  return populate(
    Report.find({ ...filters, owner: ownerId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findAll(filters, { skip, limit, sort }) {
  return populate(
    Report.find({ ...filters, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function count(filters) {
  return Report.countDocuments(filters).exec();
}

function create(data) {
  return Report.create(data);
}

/** Only ever writes the whitelisted fields — never `metrics`, `recommendations`, `generatedAt`, `generatedBy`, `owner`, `simulation`, `product`, or `isActive` from client input. */
function update(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return populate(Report.findOneAndUpdate({ _id: id, isActive: true }, safeUpdates, { new: true, runValidators: true })).exec();
}

function softDelete(id, status) {
  return Report.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false, status }, { new: true }).exec();
}

function restore(id, status) {
  return Report.findOneAndUpdate({ _id: id, isActive: false }, { isActive: true, status }, { new: true }).exec();
}

module.exports = {
  findById,
  findByIdAny,
  findActiveBySimulation,
  findByOwner,
  findAll,
  count,
  create,
  update,
  softDelete,
  restore,
};
