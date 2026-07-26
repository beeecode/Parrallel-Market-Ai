const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createTestProduct } = require('../helpers/productHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('Products authorization', () => {
  it('rejects unauthenticated requests to every endpoint', async () => {
    const listResponse = await request(app).get('/api/products');
    const createResponse = await request(app).post('/api/products').send({ name: 'X', price: 1 });

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
  });

  it('lets ANALYST and VIEWER read but not write', async () => {
    const owner = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, owner.token);

    for (const role of ['ANALYST', 'VIEWER']) {
      const { token } = await tokenForRole(role);

      const listResponse = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
      const getResponse = await request(app)
        .get(`/api/products/${body.data.product.id}`)
        .set('Authorization', `Bearer ${token}`);
      const createResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Not allowed', price: 1 });
      const updateResponse = await request(app)
        .patch(`/api/products/${body.data.product.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 1 });
      const deleteResponse = await request(app)
        .delete(`/api/products/${body.data.product.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);
      expect(createResponse.status).toBe(403);
      expect(updateResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
    }
  });

  it('confines a BUSINESS_OWNER to their own products: another owner\'s product 404s instead of 403', async () => {
    const ownerA = await tokenForRole('BUSINESS_OWNER');
    const ownerB = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, ownerA.token);
    const productId = body.data.product.id;

    const getResponse = await request(app).get(`/api/products/${productId}`).set('Authorization', `Bearer ${ownerB.token}`);
    const updateResponse = await request(app)
      .patch(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${ownerB.token}`)
      .send({ price: 1 });
    const deleteResponse = await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${ownerB.token}`);

    expect(getResponse.status).toBe(404);
    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it('excludes other owners\' products from a BUSINESS_OWNER\'s list', async () => {
    const ownerA = await tokenForRole('BUSINESS_OWNER');
    const ownerB = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, ownerA.token, { name: 'Owner A Product' });
    await createTestProduct(app, ownerB.token, { name: 'Owner B Product' });

    const response = await request(app).get('/api/products').set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].name).toBe('Owner B Product');
  });

  it('gives ADMIN unrestricted access to any product', async () => {
    const owner = await tokenForRole('BUSINESS_OWNER');
    const admin = await tokenForRole('ADMIN');
    const { body } = await createTestProduct(app, owner.token);
    const productId = body.data.product.id;

    const getResponse = await request(app).get(`/api/products/${productId}`).set('Authorization', `Bearer ${admin.token}`);
    const updateResponse = await request(app)
      .patch(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ price: 5 });
    const deleteResponse = await request(app).delete(`/api/products/${productId}`).set('Authorization', `Bearer ${admin.token}`);

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });
});
