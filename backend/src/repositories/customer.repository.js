const { Customer } = require('../models/Customer');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const ALLOWED_UPDATE_FIELDS = [
  'fullName',
  'email',
  'phone',
  'company',
  'industry',
  'jobTitle',
  'country',
  'tags',
  'notes',
  'status',
];

function findById(id) {
  return Customer.findOne({ _id: id, isActive: true }).populate('owner', OWNER_POPULATE_FIELDS).exec();
}

/** Case-insensitive per-owner email lookup, used for duplicate detection. */
function findByOwnerAndEmail(owner, email, { excludeId } = {}) {
  const filter = { owner, email, isActive: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return Customer.findOne(filter).collation(CASE_INSENSITIVE_COLLATION).exec();
}

function findMany(filters, { skip, limit, sort }) {
  return Customer.find(filters).sort(sort).skip(skip).limit(limit).populate('owner', OWNER_POPULATE_FIELDS).exec();
}

function count(filters) {
  return Customer.countDocuments(filters).exec();
}

function create(data) {
  return Customer.create(data);
}

/** Only ever writes the whitelisted fields — never `owner` or `isActive` from client input. */
function updateById(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return Customer.findOneAndUpdate({ _id: id, isActive: true }, safeUpdates, { new: true, runValidators: true })
    .populate('owner', OWNER_POPULATE_FIELDS)
    .exec();
}

function softDeleteById(id) {
  return Customer.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }).exec();
}

module.exports = { findById, findByOwnerAndEmail, findMany, count, create, updateById, softDeleteById };
