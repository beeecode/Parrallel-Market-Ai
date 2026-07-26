const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { SAMPLE_CUSTOMER_AGENT, createTestCustomerAgent } = require('../helpers/customerAgentHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function setupOwnerWithSimulation() {
  const owner = await createOwnerWithProduct(app);
  const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
  return { ...owner, simulationId: body.data.simulation.id };
}

describe('POST /api/customer-agents', () => {
  it("creates an agent whose owner is inherited from the simulation's owner", async () => {
    const { token, userId, simulationId } = await setupOwnerWithSimulation();

    const response = await createTestCustomerAgent(app, token, { simulation: simulationId });

    expect(response.status).toBe(201);
    expect(response.body.data.customerAgent).toEqual(
      expect.objectContaining({ name: SAMPLE_CUSTOMER_AGENT.name, status: 'active', isActive: true }),
    );
    expect(response.body.data.customerAgent.owner.id).toBe(userId);
    expect(response.body.data.customerAgent.simulation.id).toBe(simulationId);
  });

  it('ignores owner/isActive fields injected into the create body', async () => {
    const { token, userId, simulationId } = await setupOwnerWithSimulation();

    const response = await createTestCustomerAgent(app, token, {
      simulation: simulationId,
      owner: '665f1f77bcf86cd799439011',
      isActive: false,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.customerAgent.owner.id).toBe(userId);
    expect(response.body.data.customerAgent.isActive).toBe(true);
  });

  it('rejects a second agent with the same name in the same simulation', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    await createTestCustomerAgent(app, token, { simulation: simulationId });

    const response = await createTestCustomerAgent(app, token, { simulation: simulationId });

    expect(response.status).toBe(409);
    expect(response.body.errors[0].code).toBe('CONFLICT');
  });

  it('allows the same agent name in two different simulations', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body: simA } = await createTestSimulation(app, token, { product: productId, title: 'Sim A' });
    const { body: simB } = await createTestSimulation(app, token, { product: productId, title: 'Sim B' });
    await createTestCustomerAgent(app, token, { simulation: simA.data.simulation.id });

    const response = await createTestCustomerAgent(app, token, { simulation: simB.data.simulation.id });

    expect(response.status).toBe(201);
  });

  it('returns 404 when the referenced simulation does not exist', async () => {
    const { token } = await createOwnerWithProduct(app);

    const response = await createTestCustomerAgent(app, token, { simulation: '665f1f77bcf86cd799439011' });

    expect(response.status).toBe(404);
  });

  it('returns 404 when the referenced simulation belongs to another owner', async () => {
    const ownerA = await setupOwnerWithSimulation();
    const ownerB = await createOwnerWithProduct(app);

    const response = await createTestCustomerAgent(app, ownerB.token, { simulation: ownerA.simulationId });

    expect(response.status).toBe(404);
  });

  it('rejects a missing name', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();

    const response = await createTestCustomerAgent(app, token, { simulation: simulationId, name: '' });

    expect(response.status).toBe(422);
  });

  it('rejects an out-of-range age', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();

    const response = await createTestCustomerAgent(app, token, { simulation: simulationId, age: 200 });

    expect(response.status).toBe(422);
  });
});

describe('GET /api/customer-agents/:id', () => {
  it('returns the agent for its owner', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    const { body } = await createTestCustomerAgent(app, token, { simulation: simulationId });

    const response = await request(app)
      .get(`/api/customer-agents/${body.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.customerAgent.id).toBe(body.data.customerAgent.id);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const { token } = await createOwnerWithProduct(app);

    const response = await request(app)
      .get('/api/customer-agents/665f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/customer-agents/:id', () => {
  it('updates allowed fields', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    const { body } = await createTestCustomerAgent(app, token, { simulation: simulationId });

    const response = await request(app)
      .patch(`/api/customer-agents/${body.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ occupation: 'Director of Ops', status: 'inactive' });

    expect(response.status).toBe(200);
    expect(response.body.data.customerAgent).toEqual(expect.objectContaining({ occupation: 'Director of Ops', status: 'inactive' }));
  });

  it('merges a partial metadata update instead of replacing it', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    const { body } = await createTestCustomerAgent(app, token, {
      simulation: simulationId,
      metadata: { tags: ['vip'], score: 80, notes: 'Original note' },
    });

    const response = await request(app)
      .patch(`/api/customer-agents/${body.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ metadata: { score: 90 } });

    expect(response.status).toBe(200);
    expect(response.body.data.customerAgent.metadata).toEqual({ tags: ['vip'], score: 90, notes: 'Original note' });
  });

  it('rejects renaming to a name already used by another agent in the same simulation', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Agent A' });
    const { body } = await createTestCustomerAgent(app, token, { simulation: simulationId, name: 'Agent B' });

    const response = await request(app)
      .patch(`/api/customer-agents/${body.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Agent A' });

    expect(response.status).toBe(409);
  });

  it('silently ignores attempts to change simulation, owner, or isActive through this endpoint', async () => {
    const { token, userId, simulationId } = await setupOwnerWithSimulation();
    const { body } = await createTestCustomerAgent(app, token, { simulation: simulationId });

    const response = await request(app)
      .patch(`/api/customer-agents/${body.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ simulation: '665f1f77bcf86cd799439011', owner: '665f1f77bcf86cd799439011', isActive: false });

    expect(response.status).toBe(200);
    expect(response.body.data.customerAgent.simulation.id).toBe(simulationId);
    expect(response.body.data.customerAgent.owner.id).toBe(userId);
    expect(response.body.data.customerAgent.isActive).toBe(true);
  });
});

describe('DELETE /api/customer-agents/:id', () => {
  it('soft-deletes the agent: it disappears from get/list but is not physically removed', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    const { body } = await createTestCustomerAgent(app, token, { simulation: simulationId });
    const id = body.data.customerAgent.id;

    const deleteResponse = await request(app).delete(`/api/customer-agents/${id}`).set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);

    const getResponse = await request(app).get(`/api/customer-agents/${id}`).set('Authorization', `Bearer ${token}`);
    expect(getResponse.status).toBe(404);

    const listResponse = await request(app).get('/api/customer-agents').set('Authorization', `Bearer ${token}`);
    expect(listResponse.body.data.items).toHaveLength(0);
  });

  it('returns 404 when deleting an already-deleted agent', async () => {
    const { token, simulationId } = await setupOwnerWithSimulation();
    const { body } = await createTestCustomerAgent(app, token, { simulation: simulationId });
    const id = body.data.customerAgent.id;
    await request(app).delete(`/api/customer-agents/${id}`).set('Authorization', `Bearer ${token}`);

    const response = await request(app).delete(`/api/customer-agents/${id}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
