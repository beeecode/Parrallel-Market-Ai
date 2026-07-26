const reportService = require('../services/report.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await reportService.listReports(req.user, req.query);
  sendSuccess(res, { message: 'Reports retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const report = await reportService.getReport(req.user, req.params.id);
  sendSuccess(res, { message: 'Report retrieved successfully.', data: { report } });
});

const generate = asyncHandler(async (req, res) => {
  const { report, created } = await reportService.generateReport(req.user, req.body);
  sendSuccess(res, {
    statusCode: created ? HTTP_STATUS.CREATED : HTTP_STATUS.OK,
    message: created ? 'Report generated successfully.' : 'An active report already exists for this simulation.',
    data: { report },
  });
});

const update = asyncHandler(async (req, res) => {
  const report = await reportService.updateReport(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Report updated successfully.', data: { report } });
});

const remove = asyncHandler(async (req, res) => {
  await reportService.archiveReport(req.user, req.params.id);
  sendSuccess(res, { message: 'Report deleted successfully.' });
});

const archive = asyncHandler(async (req, res) => {
  await reportService.archiveReport(req.user, req.params.id);
  sendSuccess(res, { message: 'Report archived successfully.' });
});

const restore = asyncHandler(async (req, res) => {
  const report = await reportService.restoreReport(req.user, req.params.id);
  sendSuccess(res, { message: 'Report restored successfully.', data: { report } });
});

module.exports = { list, getById, generate, update, remove, archive, restore };
