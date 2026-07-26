const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('Simulations authorization', () => {
  it('rejects unauthenticated requests to every endpoint', async () => {
    const listResponse = await request(app).get('/api/simulations');
    const createResponse = await request(app).post('/api/simulations').send({ title: 'X', product: '665f1f77bcf86cd799439011' });

    expect(listResponse.status).toBe(401);
    expect(createResponse.status).toBe(401);
  });

  it('lets ANALYST and VIEWER read but not write', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
    const simulationId = body.data.simulation.id;

    for (const role of ['ANALYST', 'VIEWER']) {
      const { token } = await tokenForRole(role);

      const listResponse = await request(app).get('/api/simulations').set('Authorization', `Bearer ${token}`);
      const getResponse = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);
      const createResponse = await request(app)
        .post('/api/simulations')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Blocked', product: owner.productId });
      const updateResponse = await request(app)
        .patch(`/api/simulations/${simulationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ objective: 'blocked' });
      const deleteResponse = await request(app).delete(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${token}`);
      const archiveResponse = await request(app)
        .patch(`/api/simulations/${simulationId}/archive`)
        .set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);
      expect(createResponse.status).toBe(403);
      expect(updateResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
      expect(archiveResponse.status).toBe(403);
    }
  });

  it("confines a BUSINESS_OWNER to their own simulations: another owner's simulation 404s instead of 403", async () => {
    const ownerA = await createOwnerWithProduct(app);
    const ownerB = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, ownerA.token, { product: ownerA.productId });
    const simulationId = body.data.simulation.id;

    const getResponse = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${ownerB.token}`);
    const updateResponse = await request(app)
      .patch(`/api/simulations/${simulationId}`)
      .set('Authorization', `Bearer ${ownerB.token}`)
      .send({ objective: 'hijacked' });
    const deleteResponse = await request(app).delete(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${ownerB.token}`);

    expect(getResponse.status).toBe(404);
    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it("excludes other owners' simulations from a BUSINESS_OWNER's list", async () => {
    const ownerA = await createOwnerWithProduct(app);
    const ownerB = await createOwnerWithProduct(app);
    await createTestSimulation(app, ownerA.token, { product: ownerA.productId, title: 'Owner A Sim' });
    await createTestSimulation(app, ownerB.token, { product: ownerB.productId, title: 'Owner B Sim' });

    const response = await request(app).get('/api/simulations').set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].title).toBe('Owner B Sim');
  });

  it('gives ADMIN unrestricted access to any simulation', async () => {
    const owner = await createOwnerWithProduct(app);
    const admin = await tokenForRole('ADMIN');
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
    const simulationId = body.data.simulation.id;

    const getResponse = await request(app).get(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${admin.token}`);
    const updateResponse = await request(app)
      .patch(`/api/simulations/${simulationId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ objective: 'admin edit' });
    const deleteResponse = await request(app).delete(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${admin.token}`);

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });
});
