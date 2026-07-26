const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createOwnerWithCompletedSimulation, generateTestReport } = require('../helpers/reportHelpers');
const { createOwnerWithProduct } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function setupOwnerWithInsight() {
  const owner = await createOwnerWithCompletedSimulation(app, { configuration: { sentiment: 'negative' } });
  const { body } = await generateTestReport(app, owner.token, { simulation: owner.simulationId });
  const insightsResponse = await request(app)
    .get(`/api/reports/${body.data.report.id}/insights`)
    .set('Authorization', `Bearer ${owner.token}`);
  return { ...owner, reportId: body.data.report.id, insightId: insightsResponse.body.data.items[0].id };
}

describe('Insights authorization', () => {
  it('rejects unauthenticated requests', async () => {
    const listResponse = await request(app).get('/api/insights');

    expect(listResponse.status).toBe(401);
  });

  it('has no write endpoints at all — insights are only ever auto-generated', async () => {
    const { token } = await setupOwnerWithInsight();

    const postResponse = await request(app).post('/api/insights').set('Authorization', `Bearer ${token}`).send({ title: 'manual' });

    expect(postResponse.status).toBe(404);
  });

  it('lets every authenticated role read insights', async () => {
    const { insightId } = await setupOwnerWithInsight();

    for (const role of ['ANALYST', 'VIEWER', 'ADMIN']) {
      const { token } = await tokenForRole(role);

      const listResponse = await request(app).get('/api/insights').set('Authorization', `Bearer ${token}`);
      const getResponse = await request(app).get(`/api/insights/${insightId}`).set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);
    }
  });

  it("confines a BUSINESS_OWNER to their own insights: another owner's insight 404s", async () => {
    const ownerA = await setupOwnerWithInsight();
    const ownerB = await createOwnerWithProduct(app);

    const response = await request(app).get(`/api/insights/${ownerA.insightId}`).set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.status).toBe(404);
  });

  it("excludes other owners' insights from a BUSINESS_OWNER's list", async () => {
    const ownerA = await setupOwnerWithInsight();
    const ownerB = await setupOwnerWithInsight();

    const response = await request(app).get('/api/insights').set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.body.data.items.map((item) => item.id)).not.toContain(ownerA.insightId);
  });
});
