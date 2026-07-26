const customerRepository = require('../repositories/customer.repository');
const { ConflictError, NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource, resolveOwnerId, scopeToOwnerIfNeeded } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['fullName', 'company', 'createdAt', 'updatedAt'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Customer not found.';
const DUPLICATE_MESSAGE = 'You already have a customer with this email.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters(user, { search, status }) {
  const filters = scopeToOwnerIfNeeded({ isActive: true }, user);
  if (status) filters.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ fullName: pattern }, { email: pattern }, { company: pattern }];
  }

  return filters;
}

async function listCustomers(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(user, query);
  const sort = buildSort(query.sort, query.order);

  const [items, totalItems] = await Promise.all([
    customerRepository.findMany(filters, { skip, limit, sort }),
    customerRepository.count(filters),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getCustomer(user, id) {
  const customer = await customerRepository.findById(id);
  if (!customer || !canAccessResource(customer, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return customer.toJSON();
}

async function createCustomer(user, payload) {
  const existing = await customerRepository.findByOwnerAndEmail(user.sub, payload.email);
  if (existing) {
    throw new ConflictError(DUPLICATE_MESSAGE);
  }

  // Built explicitly (not spread from `payload`) so a client can never sneak an
  // unlisted field — e.g. `isActive: false` — into a newly created document;
  // express-validator validates known fields but never strips unknown ones.
  const created = await customerRepository.create({
    fullName: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    industry: payload.industry,
    jobTitle: payload.jobTitle,
    country: payload.country,
    tags: payload.tags,
    notes: payload.notes,
    status: payload.status,
    owner: user.sub,
  });
  const populated = await customerRepository.findById(created.id);
  return populated.toJSON();
}

async function updateCustomer(user, id, updates) {
  const existing = await customerRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  if (updates.email && updates.email !== existing.email) {
    const duplicate = await customerRepository.findByOwnerAndEmail(resolveOwnerId(existing), updates.email, { excludeId: id });
    if (duplicate) {
      throw new ConflictError(DUPLICATE_MESSAGE);
    }
  }

  const updated = await customerRepository.updateById(id, updates);
  return updated.toJSON();
}

async function deleteCustomer(user, id) {
  const existing = await customerRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await customerRepository.softDeleteById(id);
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
