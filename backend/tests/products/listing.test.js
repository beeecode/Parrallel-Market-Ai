const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createTestProduct } = require('../helpers/productHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('GET /api/products pagination, search, and sort', () => {
  it('paginates results and reports accurate metadata', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    for (let i = 1; i <= 5; i += 1) {
      await createTestProduct(app, token, { name: `Product ${i}` });
    }

    const response = await request(app).get('/api/products?page=2&limit=2').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.pagination).toEqual({ page: 2, limit: 2, totalItems: 5, totalPages: 3 });
  });

  it('searches case-insensitively across name and category', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, token, { name: 'Growth Simulation Bundle', category: 'Simulations' });
    await createTestProduct(app, token, { name: 'Retention Playbook', category: 'Playbooks' });

    const response = await request(app).get('/api/products?search=SIMULATION').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].name).toBe('Growth Simulation Bundle');
  });

  it('sorts by price ascending or descending', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, token, { name: 'Cheap', price: 10 });
    await createTestProduct(app, token, { name: 'Expensive', price: 100 });

    const ascending = await request(app).get('/api/products?sort=price&order=asc').set('Authorization', `Bearer ${token}`);
    const descending = await request(app).get('/api/products?sort=price&order=desc').set('Authorization', `Bearer ${token}`);

    expect(ascending.body.data.items.map((item) => item.name)).toEqual(['Cheap', 'Expensive']);
    expect(descending.body.data.items.map((item) => item.name)).toEqual(['Expensive', 'Cheap']);
  });

  it('filters by status', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestProduct(app, token, { name: 'Draft Item', status: 'draft' });
    await createTestProduct(app, token, { name: 'Active Item', status: 'active' });

    const response = await request(app).get('/api/products?status=draft').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].name).toBe('Draft Item');
  });

  it('rejects an out-of-range limit', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await request(app).get('/api/products?limit=1000').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(422);
  });
});
