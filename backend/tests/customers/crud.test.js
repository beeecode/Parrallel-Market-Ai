const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { SAMPLE_CUSTOMER, createTestCustomer } = require('../helpers/customerHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/customers', () => {
  it('creates a customer owned by the caller', async () => {
    const { token, userId } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestCustomer(app, token);

    expect(response.status).toBe(201);
    expect(response.body.data.customer).toEqual(
      expect.objectContaining({ fullName: SAMPLE_CUSTOMER.fullName, email: SAMPLE_CUSTOMER.email, isActive: true }),
    );
    expect(response.body.data.customer.owner.id).toBe(userId);
  });

  it('rejects a second customer with the same email for the same owner', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, token);

    const response = await createTestCustomer(app, token);

    expect(response.status).toBe(409);
    expect(response.body.errors[0].code).toBe('CONFLICT');
  });

  it('is case-insensitive when detecting a duplicate email', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, token, { email: 'someone@example.com' });

    const response = await createTestCustomer(app, token, { email: 'Someone@Example.com' });

    expect(response.status).toBe(409);
  });

  it('allows two different owners to have a customer with the same email', async () => {
    const ownerA = await tokenForRole('BUSINESS_OWNER');
    const ownerB = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, ownerA.token);

    const response = await createTestCustomer(app, ownerB.token);

    expect(response.status).toBe(201);
  });

  it('rejects an invalid email', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestCustomer(app, token, { email: 'not-an-email' });

    expect(response.status).toBe(422);
    expect(response.body.errors[0].code).toBe('VALIDATION_ERROR');
  });

  it('rejects a missing full name', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestCustomer(app, token, { fullName: '' });

    expect(response.status).toBe(422);
  });
});

describe('GET /api/customers/:id', () => {
  it('returns the customer for its owner', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, token);

    const response = await request(app)
      .get(`/api/customers/${body.data.customer.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.customer.id).toBe(body.data.customer.id);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await request(app)
      .get('/api/customers/665f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('returns 422 for a malformed id', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await request(app).get('/api/customers/not-an-id').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(422);
  });
});

describe('PATCH /api/customers/:id', () => {
  it('updates allowed fields', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, token);

    const response = await request(app)
      .patch(`/api/customers/${body.data.customer.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'New Co', status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.data.customer).toEqual(expect.objectContaining({ company: 'New Co', status: 'inactive' }));
  });

  it('rejects changing the email to one already used by another of the same owner\'s customers', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, token, { email: 'first@example.com' });
    const { body } = await createTestCustomer(app, token, { email: 'second@example.com' });

    const response = await request(app)
      .patch(`/api/customers/${body.data.customer.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'first@example.com' });

    expect(response.status).toBe(409);
  });

  it('silently ignores attempts to change owner or isActive through this endpoint', async () => {
    const { token, userId } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, token);

    const response = await request(app)
      .patch(`/api/customers/${body.data.customer.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ owner: '665f1f77bcf86cd799439011', isActive: false });

    expect(response.status).toBe(200);
    expect(response.body.data.customer.owner.id).toBe(userId);
    expect(response.body.data.customer.isActive).toBe(true);
  });
});

describe('DELETE /api/customers/:id', () => {
  it('soft-deletes the customer: it disappears from get/list but is not physically removed', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, token);
    const id = body.data.customer.id;

    const deleteResponse = await request(app).delete(`/api/customers/${id}`).set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app).get(`/api/customers/${id}`).set('Authorization', `Bearer ${token}`);
    expect(getResponse.status).toBe(404);

    const listResponse = await request(app).get('/api/customers').set('Authorization', `Bearer ${token}`);
    expect(listResponse.body.data.items).toHaveLength(0);
  });

  it('returns 404 when deleting an already-deleted customer', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestCustomer(app, token);
    const id = body.data.customer.id;
    await request(app).delete(`/api/customers/${id}`).set('Authorization', `Bearer ${token}`);

    const response = await request(app).delete(`/api/customers/${id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
