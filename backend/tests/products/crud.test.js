const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { SAMPLE_PRODUCT, createTestProduct } = require('../helpers/productHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/products', () => {
  it('creates a product owned by the caller', async () => {
    const { token, userId } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestProduct(app, token);

    expect(response.status).toBe(201);
    expect(response.body.data.product).toEqual(
      expect.objectContaining({ name: SAMPLE_PRODUCT.name, price: SAMPLE_PRODUCT.price, isActive: true }),
    );
    expect(response.body.data.product.owner.id).toBe(userId);
  });

  it('ignores an isActive field injected into the create body (cannot create a pre-soft-deleted product)', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestProduct(app, token, { isActive: false });

    expect(response.status).toBe(201);
    expect(response.body.data.product.isActive).toBe(true);
  });

  it('rejects a second product with the same name for the same owner', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, token);

    const response = await createTestProduct(app, token);

    expect(response.status).toBe(409);
    expect(response.body.errors[0].code).toBe('CONFLICT');
  });

  it('is case-insensitive when detecting a duplicate name', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, token, { name: 'Widget Pack' });

    const response = await createTestProduct(app, token, { name: 'widget pack' });

    expect(response.status).toBe(409);
  });

  it('allows two different owners to use the same product name', async () => {
    const ownerA = await tokenForRole('BUSINESS_OWNER');
    const ownerB = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, ownerA.token);

    const response = await createTestProduct(app, ownerB.token);

    expect(response.status).toBe(201);
  });

  it('rejects a negative price', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestProduct(app, token, { price: -5 });

    expect(response.status).toBe(422);
    expect(response.body.errors[0].code).toBe('VALIDATION_ERROR');
  });

  it('rejects a missing name', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await createTestProduct(app, token, { name: '' });

    expect(response.status).toBe(422);
  });
});

describe('GET /api/products/:id', () => {
  it('returns the product for its owner', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, token);

    const response = await request(app)
      .get(`/api/products/${body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.product.id).toBe(body.data.product.id);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await request(app)
      .get('/api/products/665f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('returns 422 for a malformed id', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await request(app).get('/api/products/not-an-id').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(422);
  });
});

describe('PATCH /api/products/:id', () => {
  it('updates allowed fields', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, token);

    const response = await request(app)
      .patch(`/api/products/${body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 79.99, status: 'archived' });

    expect(response.status).toBe(200);
    expect(response.body.data.product).toEqual(expect.objectContaining({ price: 79.99, status: 'archived' }));
  });

  it('allows a pure case-change rename of your own product (not treated as a duplicate)', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, token, { name: 'Widget Pack' });

    const response = await request(app)
      .patch(`/api/products/${body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'WIDGET PACK' });

    expect(response.status).toBe(200);
    expect(response.body.data.product.name).toBe('WIDGET PACK');
  });

  it('rejects renaming to a name already used by another of the same owner\'s products', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, token, { name: 'Product A' });
    const { body } = await createTestProduct(app, token, { name: 'Product B' });

    const response = await request(app)
      .patch(`/api/products/${body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Product A' });

    expect(response.status).toBe(409);
  });

  it('silently ignores attempts to change owner or isActive through this endpoint', async () => {
    const { token, userId } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, token);

    const response = await request(app)
      .patch(`/api/products/${body.data.product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ owner: '665f1f77bcf86cd799439011', isActive: false });

    expect(response.status).toBe(200);
    expect(response.body.data.product.owner.id).toBe(userId);
    expect(response.body.data.product.isActive).toBe(true);
  });
});

describe('DELETE /api/products/:id', () => {
  it('soft-deletes the product: it disappears from get/list but is not physically removed', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, token);
    const id = body.data.product.id;

    const deleteResponse = await request(app).delete(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app).get(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);
    expect(getResponse.status).toBe(404);

    const listResponse = await request(app).get('/api/products').set('Authorization', `Bearer ${token}`);
    expect(listResponse.body.data.items).toHaveLength(0);
  });

  it('returns 404 when deleting an already-deleted product', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    const { body } = await createTestProduct(app, token);
    const id = body.data.product.id;
    await request(app).delete(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);

    const response = await request(app).delete(`/api/products/${id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
