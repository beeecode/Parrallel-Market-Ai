const simulationService = require('../services/simulation.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await simulationService.listSimulations(req.user, req.query);
  sendSuccess(res, { message: 'Simulations retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const simulation = await simulationService.getSimulation(req.user, req.params.id);
  sendSuccess(res, { message: 'Simulation retrieved successfully.', data: { simulation } });
});

const create = asyncHandler(async (req, res) => {
  const simulation = await simulationService.createSimulation(req.user, req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Simulation created successfully.', data: { simulation } });
});

const update = asyncHandler(async (req, res) => {
  const simulation = await simulationService.updateSimulation(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Simulation updated successfully.', data: { simulation } });
});

const remove = asyncHandler(async (req, res) => {
  await simulationService.archiveSimulation(req.user, req.params.id);
  sendSuccess(res, { message: 'Simulation deleted successfully.' });
});

const archive = asyncHandler(async (req, res) => {
  await simulationService.archiveSimulation(req.user, req.params.id);
  sendSuccess(res, { message: 'Simulation archived successfully.' });
});

const restore = asyncHandler(async (req, res) => {
  const simulation = await simulationService.restoreSimulation(req.user, req.params.id);
  sendSuccess(res, { message: 'Simulation restored successfully.', data: { simulation } });
});

module.exports = { list, getById, create, update, remove, archive, restore };
