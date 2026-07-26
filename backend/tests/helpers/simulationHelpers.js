const request = require('supertest');

const { tokenForRole } = require('./authHelpers');
const { createTestProduct } = require('./productHelpers');

const SAMPLE_SIMULATION = {
  title: 'Q1 Growth Cohort Beta',
  description: 'Simulating price-sensitive SMB buyers evaluating the Starter Pack.',
  industry: 'Retail',
  targetAudience: 'SMB operations leads',
  objective: 'Validate pricing sensitivity before GA launch',
  customerCount: 5,
  estimatedDuration: 30,
  configuration: {
    language: 'en',
    difficulty: 'medium',
    sentiment: 'neutral',
    temperature: 0.7,
    conversationLength: 10,
    allowInterruptions: true,
  },
};

/** `overrides.product` is required — create a product via productHelpers first. */
function createTestSimulation(app, token, overrides = {}) {
  return request(app)
    .post('/api/simulations')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...SAMPLE_SIMULATION, ...overrides });
}

/** Registers a BUSINESS_OWNER (or given role) and gives them a product to build simulations on. */
async function createOwnerWithProduct(app, role = 'BUSINESS_OWNER') {
  const owner = await tokenForRole(role);
  const { body } = await createTestProduct(app, owner.token);
  return { ...owner, productId: body.data.product.id };
}

module.exports = { SAMPLE_SIMULATION, createTestSimulation, createOwnerWithProduct };
