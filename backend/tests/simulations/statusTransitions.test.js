const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createTestCustomerAgent } = require('../helpers/customerAgentHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function patchStatus(token, simulationId, status) {
  return request(app)
    .patch(`/api/simulations/${simulationId}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ status });
}

describe('Simulation status transitions', () => {
  it('sets startedAt the first time a simulation transitions to running', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });

    const response = await patchStatus(owner.token, body.data.simulation.id, 'running');

    expect(response.status).toBe(200);
    expect(response.body.data.simulation.status).toBe('running');
    expect(response.body.data.simulation.startedAt).not.toBeNull();
  });

  it('forces progress to 100 and sets completedAt when transitioning to completed', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
    const simulationId = body.data.simulation.id;
    await patchStatus(owner.token, simulationId, 'running');

    const response = await patchStatus(owner.token, simulationId, 'completed');

    expect(response.status).toBe(200);
    expect(response.body.data.simulation.progress).toBe(100);
    expect(response.body.data.simulation.completedAt).not.toBeNull();
    expect(response.body.data.simulation.statistics.completionRate).toBe(100);
  });

  it('rejects an invalid transition (draft -> completed)', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });

    const response = await patchStatus(owner.token, body.data.simulation.id, 'completed');

    expect(response.status).toBe(409);
  });

  it('rejects any transition out of a terminal status (completed -> running)', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
    const simulationId = body.data.simulation.id;
    await patchStatus(owner.token, simulationId, 'running');
    await patchStatus(owner.token, simulationId, 'completed');

    const response = await patchStatus(owner.token, simulationId, 'running');

    expect(response.status).toBe(409);
  });

  it('allows pausing and resuming a running simulation', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
    const simulationId = body.data.simulation.id;
    await patchStatus(owner.token, simulationId, 'running');

    const pauseResponse = await patchStatus(owner.token, simulationId, 'paused');
    const resumeResponse = await patchStatus(owner.token, simulationId, 'running');

    expect(pauseResponse.status).toBe(200);
    expect(resumeResponse.status).toBe(200);
  });
});

describe('Simulation statistics recalculation', () => {
  it('recomputes conversationCount and responseRate as agents are added and removed', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId, customerCount: 2 });
    const simulationId = body.data.simulation.id;

    const { body: agent1 } = await createTestCustomerAgent(app, owner.token, { simulation: simulationId, name: 'Agent One' });
    await createTestCustomerAgent(app, owner.token, { simulation: simulationId, name: 'Agent Two' });

    const afterTwoAgents = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(afterTwoAgents.body.data.simulation.statistics.conversationCount).toBe(2);
    expect(afterTwoAgents.body.data.simulation.statistics.responseRate).toBe(100);

    await request(app).delete(`/api/customer-agents/${agent1.data.customerAgent.id}`).set('Authorization', `Bearer ${owner.token}`);

    const afterDelete = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`);
    expect(afterDelete.body.data.simulation.statistics.conversationCount).toBe(1);
    expect(afterDelete.body.data.simulation.statistics.responseRate).toBe(50);
  });

  it('maps configuration.sentiment to a deterministic averageSentiment score', async () => {
    const owner = await createOwnerWithProduct(app);

    const positive = await createTestSimulation(app, owner.token, {
      product: owner.productId,
      title: 'Positive Sim',
      configuration: { sentiment: 'positive' },
    });
    const negative = await createTestSimulation(app, owner.token, {
      product: owner.productId,
      title: 'Negative Sim',
      configuration: { sentiment: 'negative' },
    });

    expect(positive.body.data.simulation.statistics.averageSentiment).toBe(100);
    expect(negative.body.data.simulation.statistics.averageSentiment).toBe(0);
  });
});
