const productService = require('../services/product.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const list = asyncHandler(async (req, res) => {
  const result = await productService.listProducts(req.user, req.query);
  sendSuccess(res, { message: 'Products retrieved successfully.', data: result });
});

const getById = asyncHandler(async (req, res) => {
  const product = await productService.getProduct(req.user, req.params.id);
  sendSuccess(res, { message: 'Product retrieved successfully.', data: { product } });
});

const create = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.user, req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Product created successfully.', data: { product } });
});

const update = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.user, req.params.id, req.body);
  sendSuccess(res, { message: 'Product updated successfully.', data: { product } });
});

const remove = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.user, req.params.id);
  sendSuccess(res, { message: 'Product deleted successfully.' });
});

module.exports = { list, getById, create, update, remove };
