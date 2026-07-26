const request = require('supertest');

const app = require('../app');

describe('GET /api/health', () => {
  it('returns the flat health envelope with the expected fields', async () => {
    const response = await request(app).get('/api/health');

    expect([200, 503]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: expect.any(Boolean),
        version: expect.any(String),
        uptime: expect.any(Number),
        database: expect.stringMatching(/^(connected|disconnected)$/),
        timestamp: expect.any(String),
      }),
    );
  });
});
