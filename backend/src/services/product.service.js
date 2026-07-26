const productRepository = require('../repositories/product.repository');
const { PRODUCT_STATUS } = require('../constants/productStatus');
const { ConflictError, NotFoundError } = require('../utils/ApiError');
const { buildPaginatedResult, parsePagination } = require('../utils/pagination');
const { canAccessResource, resolveOwnerId, scopeToOwnerIfNeeded } = require('../utils/resourceAccess');
const { escapeRegExp } = require('../utils/stringHelpers');

const SORTABLE_FIELDS = ['name', 'price', 'createdAt', 'updatedAt'];
const DEFAULT_SORT_FIELD = 'createdAt';
const NOT_FOUND_MESSAGE = 'Product not found.';
const DUPLICATE_MESSAGE = 'You already have a product with this name.';

function buildSort(sortField, order) {
  const field = SORTABLE_FIELDS.includes(sortField) ? sortField : DEFAULT_SORT_FIELD;
  return { [field]: order === 'asc' ? 1 : -1 };
}

function buildFilters(user, { search, status }) {
  const filters = scopeToOwnerIfNeeded({ isActive: true }, user);
  if (status) filters.status = status;

  if (search) {
    const pattern = new RegExp(escapeRegExp(search), 'i');
    filters.$or = [{ name: pattern }, { category: pattern }];
  }

  return filters;
}

async function listProducts(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const filters = buildFilters(user, query);
  const sort = buildSort(query.sort, query.order);

  const [items, totalItems] = await Promise.all([
    productRepository.findMany(filters, { skip, limit, sort }),
    productRepository.count(filters),
  ]);

  return buildPaginatedResult(
    items.map((item) => item.toJSON()),
    totalItems,
    { page, limit },
  );
}

async function getProduct(user, id) {
  const product = await productRepository.findById(id);
  if (!product || !canAccessResource(product, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }
  return product.toJSON();
}

async function createProduct(user, payload) {
  const existing = await productRepository.findByOwnerAndName(user.sub, payload.name);
  if (existing) {
    throw new ConflictError(DUPLICATE_MESSAGE);
  }

  const created = await productRepository.create({ ...payload, owner: user.sub, status: payload.status ?? PRODUCT_STATUS.DRAFT });
  const populated = await productRepository.findById(created.id);
  return populated.toJSON();
}

async function updateProduct(user, id, updates) {
  const existing = await productRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  if (updates.name && updates.name !== existing.name) {
    const duplicate = await productRepository.findByOwnerAndName(resolveOwnerId(existing), updates.name, { excludeId: id });
    if (duplicate) {
      throw new ConflictError(DUPLICATE_MESSAGE);
    }
  }

  const updated = await productRepository.updateById(id, updates);
  return updated.toJSON();
}

async function deleteProduct(user, id) {
  const existing = await productRepository.findById(id);
  if (!existing || !canAccessResource(existing, user)) {
    throw new NotFoundError(NOT_FOUND_MESSAGE);
  }

  await productRepository.softDeleteById(id);
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
