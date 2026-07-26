const request = require('supertest');

const app = require('../app');

describe('404 handler', () => {
  it('returns the standard error envelope for an unknown route', async () => {
    const response = await request(app).get('/api/this-route-does-not-exist');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({
        success: false,
        data: null,
        errors: expect.arrayContaining([expect.objectContaining({ code: 'NOT_FOUND' })]),
      }),
    );
  });
});
