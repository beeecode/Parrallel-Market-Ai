const authService = require('../services/auth.service');
const { HTTP_STATUS } = require('../constants/httpStatus');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  sendSuccess(res, { statusCode: HTTP_STATUS.CREATED, message: 'Account created successfully.', data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, { message: 'Signed in successfully.', data: result });
});

const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.sub);
  sendSuccess(res, { message: 'Signed out successfully.' });
});

const refreshToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshTokens(req.body.refreshToken);
  sendSuccess(res, { message: 'Token refreshed successfully.', data: result });
});

module.exports = { register, login, logout, refreshToken };
