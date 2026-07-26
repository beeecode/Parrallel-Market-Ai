const request = require('supertest');

const app = require('../app');

// /api/auth is implemented as of Phase 3 (see tests/auth/*) and /api/products,
// /api/customers are implemented as of Phase 4 (see tests/products/*,
// tests/customers/*) — both are intentionally excluded from this list.
const PLACEHOLDER_PATHS = [
  '/api/users',
  '/api/simulations',
  '/api/messages',
  '/api/reports',
  '/api/request-simulation',
];

describe('placeholder resource routes', () => {
  it.each(PLACEHOLDER_PATHS)('%s returns 501 Not Implemented', async (path) => {
    const response = await request(app).get(path);

    expect(response.status).toBe(501);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        data: null,
        errors: expect.arrayContaining([expect.objectContaining({ code: 'NOT_IMPLEMENTED' })]),
      }),
    );
  });

  it('responds 501 for every HTTP method, not just GET', async () => {
    const response = await request(app).post('/api/reports');

    expect(response.status).toBe(501);
  });
});
