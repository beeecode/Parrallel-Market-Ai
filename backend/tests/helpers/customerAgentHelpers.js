const request = require('supertest');

const SAMPLE_CUSTOMER_AGENT = {
  name: 'Sarah Chen',
  avatar: 'https://cdn.example.com/agents/sarah-chen.png',
  age: 34,
  occupation: 'Operations Manager',
  location: 'Austin, TX',
  income: '$60,000-$80,000',
  personality: 'Analytical, cautious, detail-oriented',
  goals: ['Reduce operational costs'],
  painPoints: ['Limited budget'],
  buyingBehavior: 'Compares at least three vendors before deciding',
  communicationStyle: 'Direct, prefers data over narrative',
  sentiment: 'neutral',
};

/** `overrides.simulation` is required — create a simulation via simulationHelpers first. */
function createTestCustomerAgent(app, token, overrides = {}) {
  return request(app)
    .post('/api/customer-agents')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...SAMPLE_CUSTOMER_AGENT, ...overrides });
}

module.exports = { SAMPLE_CUSTOMER_AGENT, createTestCustomerAgent };
