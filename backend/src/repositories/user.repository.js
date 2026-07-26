const { User } = require('../models/User');

const ALLOWED_PROFILE_FIELDS = ['fullName', 'avatar', 'companyName', 'phone'];

function findByEmail(email, { includeSecrets = false } = {}) {
  const query = User.findOne({ email: email.toLowerCase() });
  if (includeSecrets) query.select('+password +refreshToken');
  return query.exec();
}

function findById(id, { includeSecrets = false } = {}) {
  const query = User.findById(id);
  if (includeSecrets) query.select('+password +refreshToken');
  return query.exec();
}

function createUser({ fullName, email, passwordHash, companyName, phone }) {
  return User.create({
    fullName,
    email: email.toLowerCase(),
    password: passwordHash,
    companyName: companyName ?? null,
    phone: phone ?? null,
  });
}

/** Only ever writes the whitelisted profile fields — never email, role, or password. */
function updateProfile(id, updates) {
  const safeUpdates = {};
  for (const field of ALLOWED_PROFILE_FIELDS) {
    if (updates[field] !== undefined) safeUpdates[field] = updates[field];
  }
  return User.findByIdAndUpdate(id, safeUpdates, { new: true, runValidators: true }).exec();
}

function updatePassword(id, passwordHash) {
  return User.findByIdAndUpdate(id, { password: passwordHash }).exec();
}

function setRefreshToken(id, hashedRefreshTokenOrNull) {
  return User.findByIdAndUpdate(id, { refreshToken: hashedRefreshTokenOrNull }).exec();
}

function updateLastLogin(id) {
  return User.findByIdAndUpdate(id, { lastLogin: new Date() }).exec();
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateProfile,
  updatePassword,
  setRefreshToken,
  updateLastLogin,
};
