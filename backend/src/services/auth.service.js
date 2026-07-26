const userRepository = require('../repositories/user.repository');
const { AuthenticationError, ConflictError } = require('../utils/ApiError');
const { hashPassword, verifyPassword } = require('./password.service');
const {
  compareRefreshToken,
  hashRefreshToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('./token.service');

const INVALID_CREDENTIALS_MESSAGE = 'The email or password is incorrect.';
const INVALID_REFRESH_TOKEN_MESSAGE = 'Invalid or expired refresh token.';

/**
 * Signs a fresh access/refresh pair and stores a *hash* of the refresh token
 * on the user (never the raw token) — this is what makes rotation and
 * logout-everywhere possible: the stored hash is the only refresh token
 * that will ever verify successfully.
 */
async function issueTokenPair(user) {
  const accessToken = signAccessToken({ sub: user.id.toString(), email: user.email, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id.toString() });
  const refreshTokenHash = hashRefreshToken(refreshToken);
  await userRepository.setRefreshToken(user.id, refreshTokenHash);
  return { accessToken, refreshToken };
}

async function register({ fullName, email, password, companyName, phone }) {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError('An account with this email already exists.');
  }

  const passwordHash = await hashPassword(password);
  const user = await userRepository.createUser({ fullName, email, passwordHash, companyName, phone });
  const tokens = await issueTokenPair(user);

  return { user: user.toJSON(), ...tokens };
}

async function login({ email, password }) {
  const user = await userRepository.findByEmail(email, { includeSecrets: true });
  if (!user) {
    throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
  }

  if (!user.isActive) {
    throw new AuthenticationError('This account has been deactivated.');
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
  }

  const tokens = await issueTokenPair(user);
  await userRepository.updateLastLogin(user.id);

  return { user: user.toJSON(), ...tokens };
}

async function refreshTokens(incomingRefreshToken) {
  let decoded;
  try {
    decoded = verifyRefreshToken(incomingRefreshToken);
  } catch {
    throw new AuthenticationError(INVALID_REFRESH_TOKEN_MESSAGE);
  }

  const user = await userRepository.findById(decoded.sub, { includeSecrets: true });
  if (!user || !user.refreshToken) {
    throw new AuthenticationError(INVALID_REFRESH_TOKEN_MESSAGE);
  }

  const matchesStoredToken = compareRefreshToken(incomingRefreshToken, user.refreshToken);
  if (!matchesStoredToken) {
    // Either an old (already-rotated) token or a forged one — either way, reject it.
    throw new AuthenticationError(INVALID_REFRESH_TOKEN_MESSAGE);
  }

  const tokens = await issueTokenPair(user);
  return { user: user.toJSON(), ...tokens };
}

async function logout(userId) {
  await userRepository.setRefreshToken(userId, null);
}

module.exports = { register, login, refreshTokens, logout };
