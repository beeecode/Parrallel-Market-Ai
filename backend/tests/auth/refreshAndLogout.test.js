const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { registerTestUser } = require('../helpers/authHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/auth/refresh-token', () => {
  it('issues a new token pair and invalidates the token that was just used (rotation)', async () => {
    const { body } = await registerTestUser(app);
    const originalRefreshToken = body.data.refreshToken;

    const refreshResponse = await request(app).post('/api/auth/refresh-token').send({ refreshToken: originalRefreshToken });

    expect(refreshResponse.status).toBe(200);
    expect(typeof refreshResponse.body.data.accessToken).toBe('string');
    expect(refreshResponse.body.data.refreshToken).not.toBe(originalRefreshToken);

    const reuseResponse = await request(app).post('/api/auth/refresh-token').send({ refreshToken: originalRefreshToken });

    expect(reuseResponse.status).toBe(401);
  });

  it('rejects a malformed refresh token', async () => {
    const response = await request(app).post('/api/auth/refresh-token').send({ refreshToken: 'not-a-real-token' });

    expect(response.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('invalidates the refresh token so it can no longer be used', async () => {
    const { body } = await registerTestUser(app);
    const { accessToken, refreshToken } = body.data;

    const logoutResponse = await request(app).post('/api/auth/logout').set('Authorization', `Bearer ${accessToken}`);

    expect(logoutResponse.status).toBe(200);

    const refreshAfterLogout = await request(app).post('/api/auth/refresh-token').send({ refreshToken });

    expect(refreshAfterLogout.status).toBe(401);
  });

  it('rejects unauthenticated logout attempts', async () => {
    const response = await request(app).post('/api/auth/logout');

    expect(response.status).toBe(401);
  });
});
