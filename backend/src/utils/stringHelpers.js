/** Converts "hello world" to "Hello World". */
function titleCase(value) {
  return value
    .split(' ')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(' ');
}

/** Converts "Business Owner" / "business_owner" to a URL-safe "business-owner". */
function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Strips characters commonly used in HTML/script injection from plain text input. */
function sanitizePlainText(value) {
  return value.trim().replace(/[<>]/g, '');
}

/** Escapes RegExp special characters so user input can be used as a literal substring pattern. */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { titleCase, slugify, sanitizePlainText, escapeRegExp };
