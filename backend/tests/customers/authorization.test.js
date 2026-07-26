const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createTestCustomer } = require('../helpers/customerHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('Customers authorization', () => {
  it('rejects unauthenticated requests to every endpoint', async () => {
    const listResponse = await request(app).get('/api/customers');
    const createResponse = await request(app).post('/api/customers').send({ fullName: 'X', email: 'x@example.com' });

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
  });

  it('lets ANALYST and VIEWER read but not write', async () => {
    const owner = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, owner.token);

    for (const role of ['ANALYST', 'VIEWER']) {
      const { token } = await tokenForRole(role);

      const listResponse = await request(app).get('/api/customers').set('Authorization', `Bearer ${token}`);
      const getResponse = await request(app)
        .get(`/api/customers/${body.data.customer.id}`)
        .set('Authorization', `Bearer ${token}`);
      const createResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ fullName: 'Not allowed', email: 'blocked@example.com' });
      const updateResponse = await request(app)
        .patch(`/api/customers/${body.data.customer.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ company: 'Blocked Co' });
      const deleteResponse = await request(app)
        .delete(`/api/customers/${body.data.customer.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);
      expect(createResponse.status).toBe(403);
      expect(updateResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
    }
  });

  it('confines a BUSINESS_OWNER to their own customers: another owner\'s customer 404s instead of 403', async () => {
    const ownerA = await tokenForRole('BUSINESS_OWNER');
    const ownerB = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, ownerA.token);
    const customerId = body.data.customer.id;

    const getResponse = await request(app).get(`/api/customers/${customerId}`).set('Authorization', `Bearer ${ownerB.token}`);
    const updateResponse = await request(app)
      .patch(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${ownerB.token}`)
      .send({ company: 'Hijacked' });
    const deleteResponse = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${ownerB.token}`);

    expect(getResponse.status).toBe(404);
    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it('excludes other owners\' customers from a BUSINESS_OWNER\'s list', async () => {
    const ownerA = await tokenForRole('BUSINESS_OWNER');
    const ownerB = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, ownerA.token, { fullName: 'Owner A Customer', email: 'a@example.com' });
    await createTestCustomer(app, ownerB.token, { fullName: 'Owner B Customer', email: 'b@example.com' });

    const response = await request(app).get('/api/customers').set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].fullName).toBe('Owner B Customer');
  });

  it('gives ADMIN unrestricted access to any customer', async () => {
    const owner = await tokenForRole('BUSINESS_OWNER');
    const admin = await tokenForRole('ADMIN');
    const { body } = await createTestCustomer(app, owner.token);
    const customerId = body.data.customer.id;

    const getResponse = await request(app).get(`/api/customers/${customerId}`).set('Authorization', `Bearer ${admin.token}`);
    const updateResponse = await request(app)
      .patch(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ company: 'Admin Edit' });
    const deleteResponse = await request(app)
      .delete(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${admin.token}`);

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });
});
