const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { DEFAULT_USER, registerTestUser } = require('../helpers/authHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/auth/login', () => {
  beforeEach(() => registerTestUser(app));

  it('signs in with correct credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: DEFAULT_USER.email, password: DEFAULT_USER.password });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(DEFAULT_USER.email);
    expect(typeof response.body.data.accessToken).toBe('string');
    expect(typeof response.body.data.refreshToken).toBe('string');
  });

  it('rejects an incorrect password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: DEFAULT_USER.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.errors[0].code).toBe('AUTHENTICATION_ERROR');
  });

  it('rejects an email that does not exist', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: DEFAULT_USER.password });

    expect(response.status).toBe(401);
  });

  it('rejects a request missing the password field', async () => {
    const response = await request(app).post('/api/auth/login').send({ email: DEFAULT_USER.email });

    expect(response.status).toBe(422);
  });
});
