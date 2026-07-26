const userRepository = require('../repositories/user.repository');
const { AuthenticationError, NotFoundError } = require('../utils/ApiError');
const { hashPassword, verifyPassword } = require('./password.service');

async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  return user.toJSON();
}

async function updateProfile(userId, updates) {
  const user = await userRepository.updateProfile(userId, updates);
  if (!user) {
    throw new NotFoundError('User not found.');
  }
  return user.toJSON();
}

async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await userRepository.findById(userId, { includeSecrets: true });
  if (!user) {
    throw new NotFoundError('User not found.');
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    throw new AuthenticationError('Current password is incorrect.');
  }

  const newPasswordHash = await hashPassword(newPassword);
  await userRepository.updatePassword(userId, newPasswordHash);
}

module.exports = { getProfile, updateProfile, changePassword };
