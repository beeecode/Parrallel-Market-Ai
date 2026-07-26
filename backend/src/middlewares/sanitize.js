const HTML_TAG_PATTERN = /<[^>]*>/g;
const DANGEROUS_KEY_PATTERN = /^\$|\./;

/**
 * Strips MongoDB operator injection (`$where`, dotted paths) and HTML-like
 * content (defense-in-depth against stored XSS) from request input.
 */
function sanitizeValue(value) {
  if (typeof value === 'string') {
    return value.replace(HTML_TAG_PATTERN, '').trim();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !DANGEROUS_KEY_PATTERN.test(key))
        .map(([key, entry]) => [key, sanitizeValue(entry)]),
    );
  }

  return value;
}

function sanitizeInPlace(target) {
  for (const key of Object.keys(target)) {
    if (DANGEROUS_KEY_PATTERN.test(key)) {
      delete target[key];
      continue;
    }
    target[key] = sanitizeValue(target[key]);
  }
}

/**
 * Mutates `query`/`params` in place rather than reassigning them — Express 5
 * exposes those as read-only getters.
 */
function sanitize(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query) {
    sanitizeInPlace(req.query);
  }
  if (req.params) {
    sanitizeInPlace(req.params);
  }
  next();
}

module.exports = { sanitize };
