const express = require('express');
const request = require('supertest');

const { errorHandler } = require('../src/middlewares/errorHandler');
const { NotFoundError, ValidationError } = require('../src/utils/ApiError');

function buildTestApp() {
  const app = express();

  app.get('/known-error', (_req, _res, next) => {
    next(new NotFoundError('Widget not found.'));
  });

  app.get('/validation-error', (_req, _res, next) => {
    next(new ValidationError([{ code: 'VALIDATION_ERROR', message: 'name is required.', field: 'name' }]));
  });

  app.get('/unexpected-error', () => {
    throw new Error('boom');
  });

  app.use(errorHandler);

  return app;
}

describe('errorHandler middleware', () => {
  const app = buildTestApp();

  it('maps a known ApiError to its status code and envelope', async () => {
    const response = await request(app).get('/known-error');

    expect(response.status).toBe(404);
    expect(response.body).toEqual(
      expect.objectContaining({ success: false, message: 'Widget not found.', data: null }),
    );
  });

  it('carries field-level errors through for validation failures', async () => {
    const response = await request(app).get('/validation-error');

    expect(response.status).toBe(422);
    expect(response.body.errors).toEqual([{ code: 'VALIDATION_ERROR', message: 'name is required.', field: 'name' }]);
  });

  it('normalizes an unexpected thrown error to a 500 without leaking internals in production', async () => {
    const response = await request(app).get('/unexpected-error');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });
});
