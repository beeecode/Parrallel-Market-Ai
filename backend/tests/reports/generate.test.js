const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createOwnerWithCompletedSimulation, generateTestReport } = require('../helpers/reportHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

describe('POST /api/reports/generate', () => {
  it('generates a report from a completed simulation with server-computed metrics/recommendations', async () => {
    const { token, userId, simulationId } = await createOwnerWithCompletedSimulation(app);

    const response = await generateTestReport(app, token, { simulation: simulationId });

    expect(response.status).toBe(201);
    expect(response.body.data.report).toEqual(
      expect.objectContaining({ status: 'Generated', simulation: expect.objectContaining({ id: simulationId }) }),
    );
    expect(response.body.data.report.owner.id).toBe(userId);
    expect(response.body.data.report.generatedBy.id).toBe(userId);
    expect(response.body.data.report.generatedAt).not.toBeNull();
    expect(response.body.data.report.metrics).toEqual(
      expect.objectContaining({ completionRate: 100, conversationCount: 0 }),
    );
    expect(Array.isArray(response.body.data.report.recommendations)).toBe(true);
    expect(response.body.data.report.recommendations.length).toBeGreaterThan(0);
  });

  it('returns the existing report (200) instead of creating a duplicate on a second call', async () => {
    const { token, simulationId } = await createOwnerWithCompletedSimulation(app);
    const first = await generateTestReport(app, token, { simulation: simulationId });

    const second = await generateTestReport(app, token, { simulation: simulationId });

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.data.report.id).toBe(first.body.data.report.id);

    const listResponse = await request(app).get('/api/reports').set('Authorization', `Bearer ${token}`);
    expect(listResponse.body.data.pagination.totalItems).toBe(1);
  });

  it('ignores metrics/recommendations/generatedAt/generatedBy fields injected into the generate body', async () => {
    const otherUser = await tokenForRole('BUSINESS_OWNER');
    const { token, userId, simulationId } = await createOwnerWithCompletedSimulation(app);

    const response = await generateTestReport(app, token, {
      simulation: simulationId,
      metrics: { conversionScore: 999 },
      recommendations: [{ title: 'Injected', description: 'Injected', priority: 'High' }],
      generatedAt: '2000-01-01T00:00:00.000Z',
      generatedBy: otherUser.userId,
    });

    expect(response.status).toBe(201);
    expect(response.body.data.report.generatedBy.id).toBe(userId);
    expect(response.body.data.report.recommendations.find((r) => r.title === 'Injected')).toBeUndefined();
    expect(response.body.data.report.metrics.conversionScore).not.toBe(999);
  });

  it('rejects generating a report for a simulation that is not completed', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });

    const response = await generateTestReport(app, owner.token, { simulation: body.data.simulation.id });

    expect(response.status).toBe(409);
  });

  it('rejects generating a report for a draft/running/paused/cancelled simulation with 409, not just draft', async () => {
    const owner = await createOwnerWithProduct(app);
    const { body } = await createTestSimulation(app, owner.token, { product: owner.productId });
    const simulationId = body.data.simulation.id;
    await request(app).patch(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'running' });
    await request(app).patch(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'cancelled' });

    const response = await generateTestReport(app, owner.token, { simulation: simulationId });

    expect(response.status).toBe(409);
  });

  it('returns 404 when the referenced simulation does not exist', async () => {
    const { token } = await createOwnerWithProduct(app);

    const response = await generateTestReport(app, token, { simulation: '665f1f77bcf86cd799439011' });

    expect(response.status).toBe(404);
  });

  it("returns 404 when the referenced simulation belongs to another owner", async () => {
    const ownerA = await createOwnerWithCompletedSimulation(app);
    const ownerB = await createOwnerWithProduct(app);

    const response = await generateTestReport(app, ownerB.token, { simulation: ownerA.simulationId });

    expect(response.status).toBe(404);
  });

  it('rejects a missing simulation field', async () => {
    const { token } = await createOwnerWithProduct(app);

    const response = await generateTestReport(app, token, {});

    expect(response.status).toBe(422);
  });

  it('automatically generates insights alongside the report', async () => {
    const { token, simulationId } = await createOwnerWithCompletedSimulation(app);
    const { body } = await generateTestReport(app, token, { simulation: simulationId });

    const insightsResponse = await request(app)
      .get(`/api/reports/${body.data.report.id}/insights`)
      .set('Authorization', `Bearer ${token}`);

    expect(insightsResponse.status).toBe(200);
    expect(insightsResponse.body.data.items.length).toBeGreaterThan(0);
    expect(insightsResponse.body.data.items[0].report.id).toBe(body.data.report.id);
  });
});
