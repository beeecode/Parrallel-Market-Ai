const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createTestCustomerAgent } = require('../helpers/customerAgentHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function setupOwnerWithSimulation() {
  const owner = await createOwnerWithProduct(app);
  const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
  return { ...owner, simulationId: body.data.simulation.id };
}

describe('GET /api/customer-agents pagination, search, and sort', () => {
  it('paginates results and reports accurate metadata', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    for (let i = 1; i <= 5; i += 1) {
      await createTestCustomerAgent(app, token, { simulation: simulationId, name: `Agent ${i}` });
    }

    const response = await request(app).get('/api/customer-agents?page=2&limit=2').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(2);
    expect(response.body.data.pagination).toEqual({ page: 2, limit: 2, totalItems: 5, totalPages: 3 });
  });

  it('searches case-insensitively across name, occupation, location, and personality', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Sarah Chen', occupation: 'Engineer' });
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Tom Reyes', occupation: 'Analyst' });

    const response = await request(app).get('/api/customer-agents?search=ENGINEER').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].name).toBe('Sarah Chen');
  });

  it('sorts by name ascending or descending', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Aaron' });
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Zoe' });

    const ascending = await request(app).get('/api/customer-agents?sort=name&order=asc').set('Authorization', `Bearer ${token}`);
    const descending = await request(app).get('/api/customer-agents?sort=name&order=desc').set('Authorization', `Bearer ${token}`);

    expect(ascending.body.data.items.map((item) => item.name)).toEqual(['Aaron', 'Zoe']);
    expect(descending.body.data.items.map((item) => item.name)).toEqual(['Zoe', 'Aaron']);
  });

  it('filters by status', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Active Agent', status: 'active' });
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Inactive Agent', status: 'inactive' });

    const response = await request(app).get('/api/customer-agents?status=inactive').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].name).toBe('Inactive Agent');
  });

  it('rejects an out-of-range limit', async () => {
    const { token } = await setupOwnerWithSimulation();

    const response = await request(app).get('/api/customer-agents?limit=1000').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(422);
  });
});

describe('GET /api/simulations/:id/customer-agents', () => {
  it("lists only the requested simulation's agents", async () => {
    const owner = await createOwnerWithProduct(app);
    const { body: simA } = await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Sim A' });
    const { body: simB } = await createTestSimulation(app, owner.token, { product: owner.productId, title: 'Sim B' });
    await createTestCustomerAgent(app, owner.token, { simulation: simA.data.simulation.id, name: 'Agent In A' });
    await createTestCustomerAgent(app, owner.token, { simulation: simB.data.simulation.id, name: 'Agent In B' });

    const response = await request(app)
      .get(`/api/simulations/${simA.data.simulation.id}/customer-agents`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].name).toBe('Agent In A');
  });

  it("returns 404 when the caller cannot access the parent simulation", async () => {
    const ownerA = await createOwnerWithProduct(app);
    const { body: simA } = await createTestSimulation(app, ownerA.token, { product: ownerA.productId });
    const ownerB = await createOwnerWithProduct(app);

    const response = await request(app)
      .get(`/api/simulations/${simA.data.simulation.id}/customer-agents`)
      .set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.status).toBe(404);
  });
});
