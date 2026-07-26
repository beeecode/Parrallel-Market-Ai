/**
 * Shared JSDoc typedefs. This project is plain JavaScript — these exist so
 * editors can still offer hover-hints and autocomplete for common shapes.
 * Nothing here has runtime behavior.
 *
 * @typedef {Object} ApiErrorItem
 * @property {string} code
 * @property {string} message
 * @property {string} [field]
 *
 * @typedef {Object} ApiMeta
 * @property {string} timestamp
 *
 * @typedef {Object} ApiResponseBody
 * @property {boolean} success
 * @property {string} message
 * @property {*} data
 * @property {ApiErrorItem[]} errors
 * @property {ApiMeta} meta
 *
 * @typedef {Object} PaginationParams
 * @property {number} page
 * @property {number} limit
 *
 * @typedef {Object} PaginationMeta
 * @property {number} page
 * @property {number} limit
 * @property {number} totalItems
 * @property {number} totalPages
 */

module.exports = {};
