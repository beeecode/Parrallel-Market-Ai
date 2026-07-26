const request = require('supertest');

const app = require('../../app');
const dbHandler = require('../helpers/dbHandler');
const { createOwnerWithCompletedSimulation, generateTestReport } = require('../helpers/reportHelpers');

beforeAll(() => dbHandler.connect());
afterEach(() => dbHandler.clearDatabase());
afterAll(() => dbHandler.closeDatabase());

async function setupOwnerWithReport() {
  const owner = await createOwnerWithCompletedSimulation(app);
  const { body } = await generateTestReport(app, owner.token, { simulation: owner.simulationId });
  return { ...owner, reportId: body.data.report.id };
}

describe('GET /api/reports/:id', () => {
  it('returns the report for its owner', async () => {
    const { token, reportId } = await setupOwnerWithReport();

    const response = await request(app).get(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.report.id).toBe(reportId);
  });

  it('returns 404 for a well-formed id that does not exist', async () => {
    const { token } = await createOwnerWithCompletedSimulation(app);

    const response = await request(app).get('/api/reports/665f1f77bcf86cd799439011').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/reports/:id', () => {
  it('updates the narrative fields', async () => {
    const { token, reportId } = await setupOwnerWithReport();

    const response = await request(app)
      .patch(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Custom Title', description: 'Custom description', summary: 'Custom summary' });

    expect(response.status).toBe(200);
    expect(response.body.data.report).toEqual(
      expect.objectContaining({ title: 'Custom Title', description: 'Custom description', summary: 'Custom summary' }),
    );
  });

  it('silently ignores attempts to change metrics, recommendations, generatedBy, owner, or status through this endpoint', async () => {
    const { token, userId, reportId } = await setupOwnerWithReport();

    const response = await request(app)
      .patch(`/api/reports/${reportId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        metrics: { conversionScore: 1 },
        recommendations: [],
        generatedBy: '665f1f77bcf86cd799439011',
        owner: '665f1f77bcf86cd799439011',
        status: 'Archived',
      });

    expect(response.status).toBe(200);
    expect(response.body.data.report.owner.id).toBe(userId);
    expect(response.body.data.report.generatedBy.id).toBe(userId);
    expect(response.body.data.report.status).toBe('Generated');
    expect(response.body.data.report.metrics.conversionScore).not.toBe(1);
  });
});

describe('DELETE /api/reports/:id and archive/restore', () => {
  it('soft-deletes the report and cascades to its insights', async () => {
    const { token, reportId } = await setupOwnerWithReport();

    const deleteResponse = await request(app).delete(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);
    expect(deleteResponse.status).toBe(200);

    const getReportResponse = await request(app).get(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);
    expect(getReportResponse.status).toBe(404);

    const insightsResponse = await request(app).get('/api/insights').set('Authorization', `Bearer ${token}`);
    expect(insightsResponse.body.data.items).toHaveLength(0);
  });

  it('restores an archived report but does not resurrect its insights', async () => {
    const { token, reportId } = await setupOwnerWithReport();
    await request(app).patch(`/api/reports/${reportId}/archive`).set('Authorization', `Bearer ${token}`);

    const restoreResponse = await request(app).patch(`/api/reports/${reportId}/restore`).set('Authorization', `Bearer ${token}`);

    expect(restoreResponse.status).toBe(200);
    expect(restoreResponse.body.data.report.isActive).toBe(true);
    expect(restoreResponse.body.data.report.status).toBe('Generated');

    const insightsResponse = await request(app).get('/api/insights').set('Authorization', `Bearer ${token}`);
    expect(insightsResponse.body.data.items).toHaveLength(0);
  });

  it('rejects restoring a report that is not archived', async () => {
    const { token, reportId } = await setupOwnerWithReport();

    const response = await request(app).patch(`/api/reports/${reportId}/restore`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(409);
  });

  it('returns 404 when deleting an already-archived report', async () => {
    const { token, reportId } = await setupOwnerWithReport();
    await request(app).delete(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);

    const response = await request(app).delete(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  it('generating again after archiving creates a new report (the old one is no longer active)', async () => {
    const { token, simulationId, reportId } = await setupOwnerWithReport();
    await request(app).delete(`/api/reports/${reportId}`).set('Authorization', `Bearer ${token}`);

    const response = await generateTestReport(app, token, { simulation: simulationId });

    expect(response.status).toBe(201);
    expect(response.body.data.report.id).not.toBe(reportId);
  });
});
