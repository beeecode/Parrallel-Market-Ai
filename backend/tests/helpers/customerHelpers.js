const request = require('supertest');

const SAMPLE_CUSTOMER = {
  fullName: 'Amara Okafor',
  email: 'amara@brightretail.com',
  phone: '+2348012345678',
  company: 'Bright Retail Co.',
  industry: 'Retail',
  jobTitle: 'Head of Operations',
  country: 'Nigeria',
  tags: ['vip', 'early-adopter'],
  notes: 'Interested in the enterprise tier.',
};

/** Creates a customer via the real HTTP endpoint as the given bearer token. */
function createTestCustomer(app, token, overrides = {}) {
  return request(app)
    .post('/api/customers')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...SAMPLE_CUSTOMER, ...overrides });
}

module.exports = { SAMPLE_CUSTOMER, createTestCustomer };
