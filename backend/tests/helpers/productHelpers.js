const request = require('supertest');

const SAMPLE_PRODUCT = {
  name: 'Starter Market Simulation Pack',
  description: 'A bundle of pre-configured simulations for early-stage founders.',
  category: 'Simulations',
  price: 49.99,
  currency: 'USD',
  status: 'active',
  targetAudience: 'Early-stage B2B SaaS founders',
  features: ['Custom personas', 'Weekly reports'],
  imageUrl: 'https://cdn.example.com/products/starter-pack.png',
};

/** Creates a product via the real HTTP endpoint as the given bearer token. */
function createTestProduct(app, token, overrides = {}) {
  return request(app)
    .post('/api/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...SAMPLE_PRODUCT, ...overrides });
}

module.exports = { SAMPLE_PRODUCT, createTestProduct };
