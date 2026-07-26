const userService = require('../services/user.service');
const { asyncHandler } = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const getMe = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.sub);
  sendSuccess(res, { message: 'Current user retrieved successfully.', data: { user } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.sub, req.body);
  sendSuccess(res, { message: 'Profile updated successfully.', data: { user } });
});

const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user.sub, req.body);
  sendSuccess(res, { message: 'Password changed successfully.' });
});

module.exports = { getMe, updateProfile, changePassword };
