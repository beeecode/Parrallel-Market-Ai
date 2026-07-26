const { Insight } = require('../models/Insight');

const OWNER_POPULATE_FIELDS = 'fullName email companyName';
const REPORT_POPULATE_FIELDS = 'title status';

function populate(query) {
  return query.populate('owner', OWNER_POPULATE_FIELDS).populate('report', REPORT_POPULATE_FIELDS);
}

function findById(id) {
  return populate(Insight.findOne({ _id: id, isActive: true })).exec();
}

function findByOwner(ownerId, filters, { skip, limit, sort }) {
  return populate(
    Insight.find({ ...filters, owner: ownerId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function findAll(filters, { skip, limit, sort }) {
  return populate(
    Insight.find({ ...filters, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

/** Used by the nested `/reports/:id/insights` listing endpoint. */
function findByReport(reportId, filters, { skip, limit, sort }) {
  return populate(
    Insight.find({ ...filters, report: reportId, isActive: true })
      .sort(sort)
      .skip(skip)
      .limit(limit),
  ).exec();
}

function count(filters) {
  return Insight.countDocuments(filters).exec();
}

/** Only ever called internally by insight.service.js during report generation — never from client input directly. */
function create(data) {
  return Insight.create(data);
}

/** Cascades a soft-delete to every active insight of a report that is itself being archived/deleted. */
function softDeleteByReport(reportId) {
  return Insight.updateMany({ report: reportId, isActive: true }, { isActive: false }).exec();
}

module.exports = { findById, findByOwner, findAll, findByReport, count, create, softDeleteByReport };
