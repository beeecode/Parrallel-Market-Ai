const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { DEFAULT_USER, registerTestUser } = require('../helpers/authHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function register() {
  const { body } = await registerTestUser(app);
  return body.data;
}

describe('PATCH /api/auth/profile', () => {
  it('updates the allowed profile fields', async () => {
    const { accessToken } = await register();

    const response = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ fullName: 'Daniela Adeyemi', companyName: 'New Co', phone: '+2348000000000' });

    expect(response.status).toBe(200);
    expect(response.body.data.user).toEqual(
      expect.objectContaining({ fullName: 'Daniela Adeyemi', companyName: 'New Co', phone: '+2348000000000' }),
    );
  });

  it('silently ignores attempts to change email or role through this endpoint', async () => {
    const { accessToken, user } = await register();

    const response = await request(app)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'new-email@example.com', role: 'ADMIN' });

    expect(response.status).toBe(200);
    expect(response.body.data.user.email).toBe(user.email);
    expect(response.body.data.user.role).toBe(user.role);
  });

  it('rejects unauthenticated requests', async () => {
    const response = await request(app).patch('/api/auth/profile').send({ fullName: 'No Auth' });

    expect(response.status).toBe(401);
  });
});

describe('PATCH /api/auth/change-password', () => {
  it('changes the password and allows login with the new one', async () => {
    const { accessToken } = await register();

    const changeResponse = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: DEFAULT_USER.password, newPassword: 'a-new-strong-password' });

    expect(changeResponse.status).toBe(200);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: DEFAULT_USER.email, password: 'a-new-strong-password' });

    expect(loginResponse.status).toBe(200);
  });

  it('rejects an incorrect current password', async () => {
    const { accessToken } = await register();

    const response = await request(app)
      .patch('/api/auth/change-password')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ currentPassword: 'wrong-current-password', newPassword: 'a-new-strong-password' });

    expect(response.status).toBe(401);
  });
});
