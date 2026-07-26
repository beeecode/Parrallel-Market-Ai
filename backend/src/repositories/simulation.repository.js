const { Simulation } = require('../models/Simulation');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const PRODUCT_POPULATE_FIELDS = 'name category price currency';
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'industry',
  'targetAudience',
  'objective',
  'customerCount',
  'status',
  'progress',
  'startedAt',
  'completedAt',
  'estimatedDuration',
  'configuration',
  'statistics',
];

function populate(query) {
  return query.populate('owner', OWNER_POPULATE_FIELDS).populate('product', PRODUCT_POPULATE_FIELDS);
}

function findById(id) {
  return populate(Simulation.findOne({ _id: id, isActive: true })).exec();
}

/** Used only by restore, which must find a document regardless of its current `isActive` value. */
function findByIdAny(id) {
  return populate(Simulation.findById(id)).exec();
}

/** Case-insensitive per-owner-and-product title lookup, used for duplicate detection. */
function findDuplicateTitle(owner, product, title, { excludeId } = {}) {
  const filter = { owner, product, title, isActive: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return Simulation.findOne(filter).collation(CASE_INSENSITIVE_COLLATION).exec();
}

function findByOwner(ownerId, filters, { skip, limit, sort }) {
  return populate(
    Simulation.find({ ...filters, owner: ownerId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findAll(filters, { skip, limit, sort }) {
  return populate(
    Simulation.find({ ...filters, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function count(filters) {
  return Simulation.countDocuments(filters).exec();
}

function create(data) {
  return Simulation.create(data);
}

/** Only ever writes the whitelisted fields — never `owner`, `product`, or `isActive` from client input. */
function update(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return populate(Simulation.findOneAndUpdate({ _id: id, isActive: true }, safeUpdates, { new: true, runValidators: true })).exec();
}

function softDelete(id) {
  return Simulation.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }).exec();
}

function restore(id) {
  return Simulation.findOneAndUpdate({ _id: id, isActive: false }, { isActive: true }, { new: true }).exec();
}

module.exports = {
  findById,
  findByIdAny,
  findDuplicateTitle,
  findByOwner,
  findAll,
  count,
  create,
  update,
  softDelete,
  restore,
};
