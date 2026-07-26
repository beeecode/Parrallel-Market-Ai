const request = require('supertest');

const app = require('../app');
const { openApiDocument } = require('../src/config/swagger');

describe('Swagger', () => {
  it('serves the Swagger UI', async () => {
    const response = await request(app).get('/api/docs/');

    expect(response.status).toBe(200);
  });

  it('documents the Products and Customers endpoints alongside the existing Auth endpoints', () => {
    const paths = Object.keys(openApiDocument.paths ?? {});

    expect(paths).toEqual(expect.arrayContaining(['/products', '/products/{id}', '/customers', '/customers/{id}']));
    expect(paths).toEqual(expect.arrayContaining(['/auth/register', '/auth/login']));
  });

  it('registers the Product and Customer schemas', () => {
    const schemas = Object.keys(openApiDocument.components?.schemas ?? {});

    expect(schemas).toEqual(expect.arrayContaining(['Product', 'Customer', 'PaginationMeta']));
  });
});
