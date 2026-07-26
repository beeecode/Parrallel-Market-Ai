const customerService = require('../services/customer.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await customerService.listCustomers(req.user, req.query);
  sendSuccess(res, { message: 'Customers retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const customer = await customerService.getCustomer(req.user, req.params.id);
  sendSuccess(res, { message: 'Customer retrieved successfully.', data: { customer } });
});

const create = asyncHandler(async (req, res) => {
  const customer = await customerService.createCustomer(req.user, req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Customer created successfully.', data: { customer } });
});

const update = asyncHandler(async (req, res) => {
  const customer = await customerService.updateCustomer(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Customer updated successfully.', data: { customer } });
});

const remove = asyncHandler(async (req, res) => {
  await customerService.deleteCustomer(req.user, req.params.id);
  sendSuccess(res, { message: 'Customer deleted successfully.' });
});

module.exports = { list, getById, create, update, remove };
