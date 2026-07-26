const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createTestCustomerAgent } = require('../helpers/customerAgentHelpers');
const { createOwnerWithProduct, SAMPLE_SIMULATION, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/simulations', () => {
  it('creates a simulation owned by the caller, in draft status, with computed statistics', async () => {
    const { token, userId, productId } = await createOwnerWithProduct(app);

    const response = await createTestSimulation(app, token, { product: productId });

    expect(response.status).toBe(201);
    expect(response.body.data.simulation).toEqual(
      expect.objectContaining({ title: SAMPLE_SIMULATION.title, status: 'draft', progress: 0, isActive: true }),
    );
    expect(response.body.data.simulation.owner.id).toBe(userId);
    expect(response.body.data.simulation.product.id).toBe(productId);
    expect(response.body.data.simulation.statistics).toEqual({
      conversationCount: 0,
      completionRate: 0,
      responseRate: 0,
      averageSentiment: 50,
    });
  });

  it('ignores status/progress/statistics/isActive fields injected into the create body', async () => {
    const { token, productId } = await createOwnerWithProduct(app);

    const response = await createTestSimulation(app, token, {
      product: productId,
      status: 'completed',
      progress: 100,
      isActive: false,
      statistics: { conversationCount: 999, completionRate: 100, responseRate: 100, averageSentiment: 100 },
    });

    expect(response.status).toBe(201);
    expect(response.body.data.simulation.status).toBe('draft');
    expect(response.body.data.simulation.progress).toBe(0);
    expect(response.body.data.simulation.isActive).toBe(true);
    expect(response.body.data.simulation.statistics.conversationCount).toBe(0);
  });

  it('rejects a second simulation with the same title for the same owner+product', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    await createTestSimulation(app, token, { product: productId });

    const response = await createTestSimulation(app, token, { product: productId });

    expect(response.status).toBe(409);
    expect(response.body.errors[0].code).toBe('CONFLICT');
  });

  it('allows the same title for the same owner on a different product', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body: secondProduct } = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Second Product', price: 10 });
    await createTestSimulation(app, owner.token, { product: owner.productId });

    const response = await createTestSimulation(app, owner.token, { product: secondProduct.data.product.id });

    expect(response.status).toBe(201);
  });

  it('returns 404 when the referenced product does not exist', async () => {
    const { token } = await createOwnerWithProduct(app);

    const response = await createTestSimulation(app, token, { product: '665f1f77bcf86cd799439011' });

    expect(response.status).toBe(404);
  });

  it('returns 404 when the referenced product belongs to another owner', async () => {
    const ownerA = await createOwnerWithProduct(app);
    const ownerB = await createOwnerWithProduct(app);

    const response = await createTestSimulation(app, ownerB.token, { product: ownerA.productId });

    expect(response.status).toBe(404);
  });

  it('rejects a missing title', async () => {
    const { token, productId } = await createOwnerWithProduct(app);

    const response = await createTestSimulation(app, token, { product: productId, title: '' });

    expect(response.status).toBe(422);
  });
});

describe('GET /api/simulations/:id', () => {
  it('returns the simulation for its owner', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });

    const response = await request(app)
      .get(`/api/simulations/${body.data.simulation.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.simulation.id).toBe(body.data.simulation.id);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const { token } = await createOwnerWithProduct(app);

    const response = await request(app)
      .get('/api/simulations/665f1f77bcf86cd799439011')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/simulations/:id', () => {
  it('updates allowed fields', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });

    const response = await request(app)
      .patch(`/api/simulations/${body.data.simulation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ objective: 'Updated objective', customerCount: 20 });

    expect(response.status).toBe(200);
    expect(response.body.data.simulation).toEqual(expect.objectContaining({ objective: 'Updated objective', customerCount: 20 }));
  });

  it('merges a partial configuration update instead of replacing it', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });

    const response = await request(app)
      .patch(`/api/simulations/${body.data.simulation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ configuration: { difficulty: 'hard' } });

    expect(response.status).toBe(200);
    expect(response.body.data.simulation.configuration).toEqual(
      expect.objectContaining({ difficulty: 'hard', language: 'en', temperature: 0.7, conversationLength: 10 }),
    );
  });

  it('silently ignores attempts to change owner, product, or statistics through this endpoint', async () => {
    const { token, userId, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });

    const response = await request(app)
      .patch(`/api/simulations/${body.data.simulation.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ owner: '665f1f77bcf86cd799439011', product: '665f1f77bcf86cd799439011', statistics: { conversationCount: 999 } });

    expect(response.status).toBe(200);
    expect(response.body.data.simulation.owner.id).toBe(userId);
    expect(response.body.data.simulation.product.id).toBe(productId);
    expect(response.body.data.simulation.statistics.conversationCount).toBe(0);
  });
});

describe('DELETE /api/simulations/:id and archive/restore', () => {
  it('soft-deletes the simulation and cascades to its customer agents', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });
    const simulationId = body.data.simulation.id;

    const { body: agentBody } = await createTestCustomerAgent(app, token, { simulation: simulationId });

    const deleteResponse = await request(app).delete(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);

    const getSimResponse = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);
    expect(getSimResponse.status).toBe(404);

    const getAgentResponse = await request(app)
      .get(`/api/customer-agents/${agentBody.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getAgentResponse.status).toBe(404);
  });

  it('restores an archived simulation but does not resurrect its agents', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });
    const simulationId = body.data.simulation.id;

    const { body: agentBody } = await createTestCustomerAgent(app, token, { simulation: simulationId });

    await request(app).patch(`/api/simulations/${simulationId}/archive`).set('Authorization', `Bearer ${token}`);

    const restoreResponse = await request(app)
      .patch(`/api/simulations/${simulationId}/restore`)
      .set('Authorization', `Bearer ${token}`);
    expect(restoreResponse.status).toBe(200);
    expect(restoreResponse.body.data.simulation.isActive).toBe(true);

    const getSimResponse = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);
    expect(getSimResponse.status).toBe(200);

    const getAgentResponse = await request(app)
      .get(`/api/customer-agents/${agentBody.data.customerAgent.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getAgentResponse.status).toBe(404);
  });

  it('rejects restoring a simulation that is not archived', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });

    const response = await request(app)
      .patch(`/api/simulations/${body.data.simulation.id}/restore`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(409);
  });

  it('returns 404 when deleting an already-archived simulation', async () => {
    const { token, productId } = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, token, { product: productId });
    const simulationId = body.data.simulation.id;
    await request(app).delete(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);

    const response = await request(app).delete(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});
