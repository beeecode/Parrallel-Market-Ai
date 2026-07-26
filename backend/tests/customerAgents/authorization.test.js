const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createTestCustomerAgent } = require('../helpers/customerAgentHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function setupOwnerWithAgent() {
  const owner = await createOwnerWithProduct(app);
  const { body: simBody } = await createTestSimulation(app, owner.token, { product: owner.productId });
  const simulationId = simBody.data.simulation.id;
  const { body: agentBody } = await createTestCustomerAgent(app, owner.token, { simulation: simulationId });
  return { ...owner, simulationId, agentId: agentBody.data.customerAgent.id };
}

describe('Customer agents authorization', () => {
  it('rejects unauthenticated requests to every endpoint', async () => {
    const listResponse = await request(app).get('/api/customer-agents');
    const createResponse = await request(app)
      .post('/api/customer-agents')
      .send({ simulation: '665f1f77bcf86cd799439011', name: 'X' });

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
  });

  it('lets ANALYST and VIEWER read but not write', async () => {
    const { simulationId, agentId } = await setupOwnerWithAgent();

    for (const role of ['ANALYST', 'VIEWER']) {
      const { token } = await tokenForRole(role);

      const listResponse = await request(app).get('/api/customer-agents').set('Authorization', `Bearer ${token}`);
      const getResponse = await request(app).get(`/api/customer-agents/${agentId}`).set('Authorization', `Bearer ${token}`);
      const createResponse = await request(app)
        .post('/api/customer-agents')
        .set('Authorization', `Bearer ${token}`)
        .send({ simulation: simulationId, name: 'Blocked' });
      const updateResponse = await request(app)
        .patch(`/api/customer-agents/${agentId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ occupation: 'blocked' });
      const deleteResponse = await request(app).delete(`/api/customer-agents/${agentId}`).set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);
      expect(createResponse.status).toBe(403);
      expect(updateResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
    }
  });

  it("confines a BUSINESS_OWNER to their own agents: another owner's agent 404s instead of 403", async () => {
    const ownerA = await setupOwnerWithAgent();
    const ownerB = await createOwnerWithProduct(app);

    const getResponse = await request(app)
      .get(`/api/customer-agents/${ownerA.agentId}`)
      .set('Authorization', `Bearer ${ownerB.token}`);
    const updateResponse = await request(app)
      .patch(`/api/customer-agents/${ownerA.agentId}`)
      .set('Authorization', `Bearer ${ownerB.token}`)
      .send({ occupation: 'hijacked' });
    const deleteResponse = await request(app)
      .delete(`/api/customer-agents/${ownerA.agentId}`)
      .set('Authorization', `Bearer ${ownerB.token}`);

    expect(getResponse.status).toBe(404);
    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it("excludes other owners' agents from a BUSINESS_OWNER's list", async () => {
    const ownerA = await setupOwnerWithAgent();
    const ownerB = await setupOwnerWithAgent();

    const response = await request(app).get('/api/customer-agents').set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].id).toBe(ownerB.agentId);
    expect(response.body.data.items.map((item) => item.id)).not.toContain(ownerA.agentId);
  });

  it('gives ADMIN unrestricted access to any agent', async () => {
    const { agentId } = await setupOwnerWithAgent();
    const admin = await tokenForRole('ADMIN');

    const getResponse = await request(app).get(`/api/customer-agents/${agentId}`).set('Authorization', `Bearer ${admin.token}`);
    const updateResponse = await request(app)
      .patch(`/api/customer-agents/${agentId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ occupation: 'admin edit' });
    const deleteResponse = await request(app).delete(`/api/customer-agents/${agentId}`).set('Authorization', `Bearer ${admin.token}`);

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });

  it("returns 404 (not 403) when a BUSINESS_OWNER tries to create an agent on another owner's simulation", async () => {
    const ownerA = await createOwnerWithProduct(app);
    const { body: simBody } = await createTestSimulation(app, ownerA.token, { product: ownerA.productId });
    const ownerB = await createOwnerWithProduct(app);

    const response = await createTestCustomerAgent(app, ownerB.token, { simulation: simBody.data.simulation.id });

    expect(response.status).toBe(404);
  });
});
