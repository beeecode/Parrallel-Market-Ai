const customerAgentService = require('../services/customerAgent.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await customerAgentService.listCustomerAgents(req.user, req.query);
  sendSuccess(res, { message: 'Customer agents retrieved successfully.', data: result });
});

/** Backs the nested `GET /simulations/:id/customer-agents` route. */
const listForSimulation = asyncHandler(async (req, res) => {
  const result = await customerAgentService.listAgentsForSimulation(req.user, req.params.id, req.query);
  sendSuccess(res, { message: 'Customer agents retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const customerAgent = await customerAgentService.getCustomerAgent(req.user, req.params.id);
  sendSuccess(res, { message: 'Customer agent retrieved successfully.', data: { customerAgent } });
});

const create = asyncHandler(async (req, res) => {
  const customerAgent = await customerAgentService.createCustomerAgent(req.user, req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Customer agent created successfully.', data: { customerAgent } });
});

const update = asyncHandler(async (req, res) => {
  const customerAgent = await customerAgentService.updateCustomerAgent(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Customer agent updated successfully.', data: { customerAgent } });
});

const remove = asyncHandler(async (req, res) => {
  await customerAgentService.deleteCustomerAgent(req.user, req.params.id);
  sendSuccess(res, { message: 'Customer agent deleted successfully.' });
});

module.exports = { list, listForSimulation, getById, create, update, remove };
