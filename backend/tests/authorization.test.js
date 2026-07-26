const express = require('express');
const request = require('supertest');

const { signAccessToken } = require('../src/services/token.service');
const { authenticate } = require('../src/middlewares/authentication');
const { requireMinimumRole, requireRoles } = require('../src/middlewares/authorization');
const { errorHandler } = require('../src/middlewares/errorHandler');

/**
 * The 7 required auth/profile endpoints are all self-service (no route needs
 * an elevated role), so `requireRoles`/`requireMinimumRole` aren't wired into
 * any real route yet. This proves the already-integrated middleware itself
 * behaves correctly, ready for the first admin-only route in a later phase.
 */
function buildTestApp() {
  const app = express();

  app.get('/admin-only', authenticate, requireRoles('ADMIN'), (_req, res) => res.json({ ok: true }));
  app.get('/analyst-and-up', authenticate, requireMinimumRole('ANALYST'), (_req, res) => res.json({ ok: true }));

  app.use(errorHandler);
  return app;
}

function tokenFor(role) {
  return signAccessToken({ sub: 'user-id', email: 'user@example.com', role });
}

describe('authorization middleware', () => {
  const app = buildTestApp();

  it('rejects requests with no token before role is even considered', async () => {
    const response = await request(app).get('/admin-only');
    expect(response.status).toBe(401);
  });

  it('rejects a role that is not in the allow-list', async () => {
    const response = await request(app).get('/admin-only').set('Authorization', `Bearer ${tokenFor('VIEWER')}`);
    expect(response.status).toBe(403);
    expect(response.body.errors[0].code).toBe('AUTHORIZATION_ERROR');
  });

  it('allows a role that is in the allow-list', async () => {
    const response = await request(app).get('/admin-only').set('Authorization', `Bearer ${tokenFor('ADMIN')}`);
    expect(response.status).toBe(200);
  });

  it('requireMinimumRole rejects a role below the threshold', async () => {
    const response = await request(app).get('/analyst-and-up').set('Authorization', `Bearer ${tokenFor('VIEWER')}`);
    expect(response.status).toBe(403);
  });

  it('requireMinimumRole allows a role at or above the threshold', async () => {
    const atThreshold = await request(app).get('/analyst-and-up').set('Authorization', `Bearer ${tokenFor('ANALYST')}`);
    const aboveThreshold = await request(app).get('/analyst-and-up').set('Authorization', `Bearer ${tokenFor('ADMIN')}`);

    expect(atThreshold.status).toBe(200);
    expect(aboveThreshold.status).toBe(200);
  });
});
