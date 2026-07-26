const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('GET /api/simulations pagination, search, and sort', () => {
  it('paginates results and reports accurate metadata', async () => {
    const owner = await createOwnerWithProduct(app);
    for (let i = 1; i <= 5; i += 1) {
      await createTestSimulation(app, owner.token, { product: owner.productId, title: `Simulation ${i}` });
    }

    const response = await request(app).get('/api/simulations?page=2&limit=2').set('Authorization', `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.pagination).toEqual({ page: 2, limit: 2, totalItems: 5, totalPages: 3 });
  });

  it('searches case-insensitively across title, industry, and description', async () => {
    const owner = await createOwnerWithProduct(app);
    await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Growth Cohort', industry: 'Retail' });
    await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Retention Study', industry: 'Finance' });

    const response = await request(app).get('/api/simulations?search=RETAIL').set('Authorization', `Bearer ${owner.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].title).toBe('Growth Cohort');
  });

  it('sorts by title ascending or descending', async () => {
    const owner = await createOwnerWithProduct(app);
    await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Aaron Sim' });
    await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Zoe Sim' });

    const ascending = await request(app).get('/api/simulations?sort=title&order=asc').set('Authorization', `Bearer ${owner.token}`);
    const descending = await request(app).get('/api/simulations?sort=title&order=desc').set('Authorization', `Bearer ${owner.token}`);

    expect(ascending.body.data.items.map((item) => item.title)).toEqual(['Aaron Sim', 'Zoe Sim']);
    expect(descending.body.data.items.map((item) => item.title)).toEqual(['Zoe Sim', 'Aaron Sim']);
  });

  it('filters by status', async () => {
    const owner = await createOwnerWithProduct(app);
    await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Draft Sim' });

    const response = await request(app).get('/api/simulations?status=draft').set('Authorization', `Bearer ${owner.token}`);
    const emptyResponse = await request(app).get('/api/simulations?status=completed').set('Authorization', `Bearer ${owner.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(emptyResponse.body.data.items).toHaveLength(0);
  });

  it('rejects an out-of-range limit', async () => {
    const owner = await createOwnerWithProduct(app);

    const response = await request(app).get('/api/simulations?limit=1000').set('Authorization', `Bearer ${owner.token}`);

    expect(response.status).toBe(422);
  });
});
