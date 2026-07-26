const request = require('supertest');

const { createOwnerWithProduct, createTestSimulation } = require('./simulationHelpers');

/** Registers an owner, creates a product, creates a simulation, and drives it to "completed". */
async function createOwnerWithCompletedSimulation(app, overrides = {}) {
  const owner = await createOwnerWithProduct(app);
  const { body } = await createTestSimulation(app, owner.token, { product: owner.productId, ...overrides });
  const simulationId = body.data.simulation.id;

  await request(app)
    .patch(`/api/simulations/${simulationId}`)
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ status: 'running' });
  await request(app)
    .patch(`/api/simulations/${simulationId}`)
    .set('Authorization', `Bearer ${owner.token}`)
    .send({ status: 'completed' });

  return { ...owner, simulationId };
}

/** `overrides.simulation` is required. */
function generateTestReport(app, token, overrides = {}) {
  return request(app).post('/api/reports/generate').set('Authorization', `Bearer ${token}`).send({ ...overrides });
}

module.exports = { createOwnerWithCompletedSimulation, generateTestReport };
