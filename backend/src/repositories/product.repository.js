const { Product } = require('../models/Product');
const { CASE_INSENSITIVE_COLLATION } = require('../utils/mongoCollation');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const ALLOWED_UPDATE_FIELDS = [
  'name',
  'description',
  'category',
  'price',
  'currency',
  'status',
  'targetAudience',
  'features',
  'imageUrl',
];

function findById(id) {
  return Product.findOne({ _id: id, isActive: true }).populate('owner', OWNER_POPULATE_FIELDS).exec();
}

/** Case-insensitive per-owner name lookup, used for duplicate detection. */
function findByOwnerAndName(owner, name, { excludeId } = {}) {
  const filter = { owner, name, isActive: true };
  if (excludeId) filter._id = { $ne: excludeId };
  return Product.findOne(filter).collation(CASE_INSENSITIVE_COLLATION).exec();
}

function findMany(filters, { skip, limit, sort }) {
  return Product.find(filters).sort(sort).skip(skip).limit(limit).populate('owner', OWNER_POPULATE_FIELDS).exec();
}

function count(filters) {
  return Product.countDocuments(filters).exec();
}

function create(data) {
  return Product.create(data);
}

/** Only ever writes the whitelisted fields — never `owner` or `isActive` from client input. */
function updateById(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_UPDATE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return Product.findOneAndUpdate({ _id: id, isActive: true }, safeUpdates, { new: true, runValidators: true })
    .populate('owner', OWNER_POPULATE_FIELDS)
    .exec();
}

function softDeleteById(id) {
  return Product.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true }).exec();
}

module.exports = { findById, findByOwnerAndName, findMany, count, create, updateById, softDeleteById };
