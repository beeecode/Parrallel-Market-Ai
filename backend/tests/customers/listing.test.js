const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createTestCustomer } = require('../helpers/customerHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('GET /api/customers pagination, search, and sort', () => {
  it('paginates results and reports accurate metadata', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    for (let i = 1; i <= 5; i += 1) {
      await createTestCustomer(app, token, { fullName: `Customer ${i}`, email: `customer${i}@example.com` });
    }

    const response = await request(app).get('/api/customers?page=2&limit=2').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.pagination).toEqual({ page: 2, limit: 2, totalItems: 5, totalPages: 3 });
  });

  it('searches case-insensitively across fullName, email, and company', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, token, { fullName: 'Bright Retail Contact', email: 'contact@brightretail.com', company: 'Bright Retail Co.' });
    await createTestCustomer(app, token, { fullName: 'Other Contact', email: 'other@example.com', company: 'Other Co.' });

    const response = await request(app).get('/api/customers?search=BRIGHT').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].fullName).toBe('Bright Retail Contact');
  });

  it('sorts by fullName ascending or descending', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, token, { fullName: 'Aaron', email: 'aaron@example.com' });
    await createTestCustomer(app, token, { fullName: 'Zoe', email: 'zoe@example.com' });

    const ascending = await request(app).get('/api/customers?sort=fullName&order=asc').set('Authorization', `Bearer ${token}`);
    const descending = await request(app).get('/api/customers?sort=fullName&order=desc').set('Authorization', `Bearer ${token}`);

    expect(ascending.body.data.items.map((item) => item.fullName)).toEqual(['Aaron', 'Zoe']);
    expect(descending.body.data.items.map((item) => item.fullName)).toEqual(['Zoe', 'Aaron']);
  });

  it('filters by status', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');
    await createTestCustomer(app, token, { fullName: 'Active One', email: 'active@example.com', status: 'active' });
    await createTestCustomer(app, token, { fullName: 'Inactive One', email: 'inactive@example.com', status: 'inactive' });

    const response = await request(app).get('/api/customers?status=inactive').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].fullName).toBe('Inactive One');
  });

  it('rejects an out-of-range limit', async () => {
    const { token } = await tokenForRole('BUSINESS_OWNER');

    const response = await request(app).get('/api/customers?limit=1000').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(422);
  });
});
