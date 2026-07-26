const request = require('supertest');

const { User } = require('../../src/models/User');
const { signAccessToken } = require('../../src/services/token.service');

const DEFAULT_USER = {
  fullName: 'Daniel Adeyemi',
  email: 'demo-owner@parallel-market-ai.local',
  password: 'correct-horse-battery-staple',
  companyName: 'Parallel Market Demo Ventures',
};

/** Registers a user via the real HTTP endpoint and returns the response body's `data`. */
async function registerTestUser(app, overrides = {}) {
  const response = await request(app)
    .post('/api/auth/register')
    .send({ ...DEFAULT_USER, ...overrides });

  return response;
}

/**
 * Creates a real `User` document (bypassing register/login) and signs a
 * matching access token for it. A real document is required, not just a
 * fabricated id, because Product/Customer reads `.populate('owner', ...)` —
 * exactly like a real deleted/nonexistent user, populate silently resolves
 * a dangling reference to `null`, which is what a fake-only id would trigger.
 */
async function tokenForRole(role, overrides = {}) {
  const user = await User.create({
    fullName: overrides.fullName ?? `${role} Test User`,
    email: overrides.email ?? `${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
    password: 'not-used-in-these-tests-000000',
    role,
  });

  const token = signAccessToken({ sub: user.id, email: user.email, role });
  return { token, userId: user.id };
}

module.exports = { registerTestUser, DEFAULT_USER, tokenForRole };
