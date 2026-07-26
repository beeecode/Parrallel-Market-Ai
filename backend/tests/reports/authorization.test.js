const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { tokenForRole } = require('../helpers/authHelpers');
const { createOwnerWithCompletedSimulation, generateTestReport } = require('../helpers/reportHelpers');
const { createOwnerWithProduct } = require('../helpers/simulationHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function setupOwnerWithReport() {
  const owner = await createOwnerWithCompletedSimulation(app);
  const { body } = await generateTestReport(app, owner.token, { simulation: owner.simulationId });
  return { ...owner, reportId: body.data.report.id };
}

describe('Reports authorization', () => {
  it('rejects unauthenticated requests to every endpoint', async () => {
    const listResponse = await request(app).get('/api/reports');
    const generateResponse = await request(app).post('/api/reports/generate').send({ simulation: '665f1f77bcf86cd799439011' });

    expect(listResponse.status).toBe(401);
    expect(generateResponse.status).toBe(401);
  });

  it('lets ANALYST and VIEWER read but not generate/write', async () => {
    const { simulationId, reportId } = await setupOwnerWithReport();

    for (const role of ['ANALYST', 'VIEWER']) {
      const { token } = await tokenForRole(role);

      const listResponse = await request(app).get('/api/reports').set('Authorization', `Bearer ${token}`);
      const getResponse = await request(app).get(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);
      const generateResponse = await request(app)
        .post('/api/reports/generate')
        .set('Authorization', `Bearer ${token}`)
        .send({ simulation: simulationId });
      const updateResponse = await request(app)
        .patch(`/api/reports/${reportId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'blocked' });
      const deleteResponse = await request(app).delete(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);

      expect(listResponse.status).toBe(200);
      expect(getResponse.status).toBe(200);
      expect(generateResponse.status).toBe(403);
      expect(updateResponse.status).toBe(403);
      expect(deleteResponse.status).toBe(403);
    }
  });

  it("confines a BUSINESS_OWNER to their own reports: another owner's report 404s instead of 403", async () => {
    const ownerA = await setupOwnerWithReport();
    const ownerB = await createOwnerWithProduct(app);

    const getResponse = await request(app).get(`/api/reports/${ownerA.reportId}`).set('Authorization', `Bearer ${ownerB.token}`);
    const updateResponse = await request(app)
      .patch(`/api/reports/${ownerA.reportId}`)
      .set('Authorization', `Bearer ${ownerB.token}`)
      .send({ title: 'hijacked' });
    const deleteResponse = await request(app).delete(`/api/reports/${ownerA.reportId}`).set('Authorization', `Bearer ${ownerB.token}`);

    expect(getResponse.status).toBe(404);
    expect(updateResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it("excludes other owners' reports from a BUSINESS_OWNER's list", async () => {
    const ownerA = await setupOwnerWithReport();
    const ownerB = await setupOwnerWithReport();

    const response = await request(app).get('/api/reports').set('Authorization', `Bearer ${ownerB.token}`);

    expect(response.body.data.items).toHaveLength(1);
    expect(response.body.data.items[0].id).toBe(ownerB.reportId);
    expect(response.body.data.items.map((item) => item.id)).not.toContain(ownerA.reportId);
  });

  it('gives ADMIN unrestricted access to any report', async () => {
    const { reportId } = await setupOwnerWithReport();
    const admin = await tokenForRole('ADMIN');

    const getResponse = await request(app).get(`/api/reports/${reportId}`).set('Authorization', `Bearer ${admin.token}`);
    const updateResponse = await request(app)
      .patch(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ title: 'admin edit' });
    const deleteResponse = await request(app).delete(`/api/reports/${reportId}`).set('Authorization', `Bearer ${admin.token}`);

    expect(getResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(deleteResponse.status).toBe(200);
  });
});
