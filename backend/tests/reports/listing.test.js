const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createOwnerWithCompletedSimulation, generateTestReport } = require('../helpers/reportHelpers');
const { createTestProduct } = require('../helpers/productHelpers');
const { createTestSimulation } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

/** Creates and completes another simulation for the same already-registered owner, then generates its report. */
async function addCompletedReportForOwner(owner, title) {
  const { body: productBody } = await createTestProduct(app, owner.token, { name: `${title} Product` });
  const { body: simBody } = await createTestSimulation(app, owner.token, { product: productBody.data.product.id, title });
  const simulationId = simBody.data.simulation.id;
  await request(app).patch(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'running' });
  await request(app).patch(`/api/simulations/${simulationId}`).set('Authorization', `Bearer ${owner.token}`).send({ status: 'completed' });
  return generateTestReport(app, owner.token, { simulation: simulationId });
}

describe('GET /api/reports pagination, search, and sort', () => {
  it('paginates results and reports accurate metadata', async () => {
    const owner = await createOwnerWithCompletedSimulation(app, { title: 'Sim 1' });
    await generateTestReport(app, owner.token, { simulation: owner.simulationId });
    await addCompletedReportForOwner(owner, 'Sim 2');
    await addCompletedReportForOwner(owner, 'Sim 3');

    const response = await request(app).get('/api/reports?page=2&limit=2').set('Authorization', `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.pagination).toEqual({ page: 2, limit: 2, totalItems: 3, totalPages: 2 });
  });

  it('searches case-insensitively across title, description, and summary', async () => {
    const owner = await createOwnerWithCompletedSimulation(app, { title: 'Growth Cohort' });
    await generateTestReport(app, owner.token, { simulation: owner.simulationId, title: 'Alpha Report' });

    const matching = await request(app).get('/api/reports?search=ALPHA').set('Authorization', `Bearer ${owner.token}`);
    const nonMatching = await request(app).get('/api/reports?search=zzz-no-match').set('Authorization', `Bearer ${owner.token}`);

    expect(matching.body.data.items).toHaveLength(1);
    expect(nonMatching.body.data.items).toHaveLength(0);
  });

  it('filters by status', async () => {
    const owner = await createOwnerWithCompletedSimulation(app);
    const { body } = await generateTestReport(app, owner.token, { simulation: owner.simulationId });

    const generated = await request(app).get('/api/reports?status=Generated').set('Authorization', `Bearer ${owner.token}`);
    const archived = await request(app).get('/api/reports?status=Archived').set('Authorization', `Bearer ${owner.token}`);

    expect(generated.body.data.items).toHaveLength(1);
    expect(archived.body.data.items).toHaveLength(0);

    await request(app).patch(`/api/reports/${body.data.report.id}/archive`).set('Authorization', `Bearer ${owner.token}`);
    const afterArchive = await request(app).get('/api/reports?status=Generated').set('Authorization', `Bearer ${owner.token}`);
    expect(afterArchive.body.data.items).toHaveLength(0);
  });

  it('rejects an out-of-range limit', async () => {
    const owner = await createOwnerWithCompletedSimulation(app);

    const response = await request(app).get('/api/reports?limit=1000').set('Authorization', `Bearer ${owner.token}`);

    expect(response.status).toBe(422);
  });

  it('rejects an invalid sort field', async () => {
    const owner = await createOwnerWithCompletedSimulation(app);

    const response = await request(app).get('/api/reports?sort=notAField').set('Authorization', `Bearer ${owner.token}`);

    expect(response.status).toBe(422);
  });
});
