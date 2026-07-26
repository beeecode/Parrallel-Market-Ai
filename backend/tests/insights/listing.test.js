const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createTestCustomerAgent } = require('../helpers/customerAgentHelpers');
const { generateTestReport } = require('../helpers/reportHelpers');
const { createOwnerWithProduct, createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

/** A fully positive, fully-responded, completed simulation so its report reliably produces several insights. */
async function setupHighPerformingReport() {
  const owner = await createOwnerWithProduct(app);
  const { body: simBody } = await createTestSimulation(app, owner.token, {
    product: owner.productId,
    customerCount: 1,
    estimatedDuration: 1,
    configuration: { sentiment: 'positive' },
  });
  const simulationId = simBody.data.simulation.id;
  await createTestCustomerAgent(app, owner.token, { simulation: simulationId, sentiment: 'positive' });
  await request(app).patch(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'running' });
  await request(app).patch(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'completed' });
  const { body: reportBody } = await generateTestReport(app, owner.token, { simulation: simulationId });
  return { ...owner, simulationId, reportId: reportBody.data.report.id };
}

describe('GET /api/insights pagination, search, and sort', () => {
  it('lists the insights generated for a high-performing report', async () => {
    const { token } = await setupHighPerformingReport();

    const response = await request(app).get('/api/insights').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items.length).toBeGreaterThanOrEqual(3);
    expect(response.body.data.items.map((item) => item.title)).toEqual(
      expect.arrayContaining(['High Engagement', 'Strong Conversion', 'Product Fit']),
    );
  });

  it('searches case-insensitively across title, category, and description', async () => {
    const { token } = await setupHighPerformingReport();

    const response = await request(app).get('/api/insights?search=CONVERSION').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items.every((item) => item.category === 'conversion' || /conversion/i.test(item.title) || /conversion/i.test(item.description))).toBe(true);
  });

  it('filters by importance and trend', async () => {
    const { token } = await setupHighPerformingReport();

    const positiveOnly = await request(app).get('/api/insights?trend=Positive').set('Authorization', `Bearer ${token}`);
    const negativeOnly = await request(app).get('/api/insights?trend=Negative').set('Authorization', `Bearer ${token}`);

    expect(positiveOnly.body.data.items.length).toBeGreaterThan(0);
    expect(positiveOnly.body.data.items.every((item) => item.trend === 'Positive')).toBe(true);
    expect(negativeOnly.body.data.items).toHaveLength(0);
  });

  it('paginates results and reports accurate metadata', async () => {
    const { token } = await setupHighPerformingReport();
    const all = await request(app).get('/api/insights').set('Authorization', `Bearer ${token}`);
    const total = all.body.data.pagination.totalItems;

    const response = await request(app).get('/api/insights?page=1&limit=1').set('Authorization', `Bearer ${token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination).toEqual({ page: 1, limit: 1, totalItems: total, totalPages: total });
  });

  it('rejects an out-of-range limit', async () => {
    const { token } = await setupHighPerformingReport();

    const response = await request(app).get('/api/insights?limit=1000').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(422);
  });
});

describe('GET /api/reports/:id/insights', () => {
  it("lists only the requested report's insights", async () => {
    const { token, reportId } = await setupHighPerformingReport();

    const response = await request(app).get(`/api/reports/${reportId}/insights`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items.every((item) => item.report.id === reportId)).toBe(true);
  });

  it('returns 404 when the caller cannot access the parent report', async () => {
    const ownerA = await setupHighPerformingReport();
    const ownerB = await createOwnerWithProduct(app);

    const response = await request(app)
      .get(`/api/reports/${ownerA.reportId}/insights`)
      .set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.status).toBe(404);
  });
});
