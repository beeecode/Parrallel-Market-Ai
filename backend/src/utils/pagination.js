const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/** Reads `page`/`limit` off a query object, clamped to sane bounds. */
function parsePagination(query = {}) {
  const page = Math.max(DEFAULT_PAGE, Number.parseInt(query.page, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/** Builds the `{ items, pagination }` response shape from a page of items and the total count. */
function buildPaginatedResult(items, totalItems, { page, limit }) {
  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    },
  };
}

module.exports = { parsePagination, buildPaginatedResult };
