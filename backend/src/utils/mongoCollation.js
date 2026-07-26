/**
 * Applied to compound unique indexes (owner + name/email) so uniqueness is
 * case-insensitive at the database level — "Widget" and "widget" collide for
 * the same owner instead of being treated as distinct values.
 */
const CASE_INSENSITIVE_COLLATION = { locale: 'en', strength: 2 };

module.exports = { CASE_INSENSITIVE_COLLATION };
