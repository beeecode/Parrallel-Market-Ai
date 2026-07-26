const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { DEFAULT_USER, registerTestUser } = require('../helpers/authHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('GET /api/auth/me', () => {
  it('rejects a request with no Authorization header', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.errors[0].code).toBe('AUTHENTICATION_ERROR');
  });

  it('rejects a malformed or invalid token', async () => {
    const response = await request(app).get('/api/auth/me').set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
  });

  it('returns the current user for a valid access token', async () => {
    const { body } = await registerTestUser(app);

    const response = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${body.data.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(DEFAULT_USER.email);
    expect(response.body.data.user.password).toBeUndefined();
  });
});
