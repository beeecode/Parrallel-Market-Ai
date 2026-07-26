const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { DEFAULT_USER, registerTestUser } = require('../helpers/authHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/auth/register', () => {
  it('creates an account and returns a token pair without exposing the password', async () => {
    const response = await registerTestUser(app);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user).toEqual(
      expect.objectContaining({ email: DEFAULT_USER.email, fullName: DEFAULT_USER.fullName, role: 'BUSINESS_OWNER' }),
    );
    expect(response.body.data.user.password).toBeUndefined();
    expect(response.body.data.user.refreshToken).toBeUndefined();
    expect(typeof response.body.data.accessToken).toBe('string');
    expect(typeof response.body.data.refreshToken).toBe('string');
  });

  it('rejects a second registration with the same email', async () => {
    await registerTestUser(app);
    const response = await registerTestUser(app);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.errors[0].code).toBe('CONFLICT');
  });

  it('rejects a weak password', async () => {
    const response = await registerTestUser(app, { email: 'weak@example.com', password: 'short' });

    expect(response.status).toBe(422);
    expect(response.body.errors[0].code).toBe('VALIDATION_ERROR');
  });

  it('rejects an invalid email', async () => {
    const response = await registerTestUser(app, { email: 'not-an-email' });

    expect(response.status).toBe(422);
  });

  it('rejects a missing full name', async () => {
    const response = await registerTestUser(app, { fullName: '', email: 'noname@example.com' });

    expect(response.status).toBe(422);
  });
});
