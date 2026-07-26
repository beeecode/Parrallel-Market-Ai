const insightService = require('../services/insight.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await insightService.listInsights(req.user, req.query);
  sendSuccess(res, { message: 'Insights retrieved successfully.', data: result });
});

/** Backs the nested `GET /reports/:id/insights` route. */
const listForReport = asyncHandler(async (req, res) => {
  const result = await insightService.listInsightsForReport(req.user, req.params.id, req.query);
  sendSuccess(res, { message: 'Insights retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const insight = await insightService.getInsight(req.user, req.params.id);
  sendSuccess(res, { message: 'Insight retrieved successfully.', data: { insight } });
});

module.exports = { list, listForReport, getById };
