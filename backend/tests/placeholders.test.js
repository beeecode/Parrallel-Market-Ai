const request = require('supertest');

const app = require('../app');

// /api/auth is implemented as of Phase 3; /api/products and /api/customers as
// of Phase 4; /api/simulations and /api/customer-agents as of Phase 5;
// /api/reports and /api/insights as of Phase 6; /api/conversations and
// /api/messages as of Phase 7 (see tests/auth/*, tests/products/*,
// tests/customers/*, tests/simulations/*, tests/customerAgents/*,
// tests/reports/*, tests/insights/*, tests/conversations/*,
// tests/messages/*) — all are intentionally excluded from this list.
const PLACEHOLDER_PATHS = ['/api/users', '/api/request-simulation'];

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
    const response = await request(app).post('/api/users');

    expect(response.status).toBe(501);
  });
});
