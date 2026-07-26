const path = require('node:path');

const swaggerJsdoc = require('swagger-jsdoc');

// Resolved relative to *this file's own location* so the glob below finds
// route annotations regardless of the process's current working directory.
const routesDirectory = path.join(__dirname, '../routes');

const openApiDocument = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Parallel Market AI API',
      version: '0.1.0',
      description: 'Express + MongoDB backend. Authentication, user profile management, Products, and Customers are implemented; every other resource is a placeholder.',
    },
    servers: [{ url: '/api', description: 'API root' }],
    tags: [
      { name: 'Health' },
      { name: 'Auth' },
      { name: 'Users' },
      { name: 'Products' },
      { name: 'Customers' },
      { name: 'Simulations' },
      { name: 'Messages' },
      { name: 'Reports' },
      { name: 'Request Simulation' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6512f9f1a1b2c3d4e5f60789' },
            fullName: { type: 'string', example: 'Daniel Adeyemi' },
            email: { type: 'string', format: 'email', example: 'demo-owner@parallel-market-ai.local' },
            role: { type: 'string', enum: ['ADMIN', 'BUSINESS_OWNER', 'ANALYST', 'VIEWER'], example: 'BUSINESS_OWNER' },
            avatar: { type: 'string', nullable: true, example: null },
            companyName: { type: 'string', nullable: true, example: 'Parallel Market Demo Ventures' },
            phone: { type: 'string', nullable: true, example: null },
            isActive: { type: 'boolean', example: true },
            emailVerified: { type: 'boolean', example: false },
            lastLogin: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthTokens: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        OwnerSummary: {
          type: 'object',
          description: 'A trimmed, non-sensitive view of the User who owns this resource.',
          properties: {
            id: { type: 'string', example: '6512f9f1a1b2c3d4e5f60789' },
            fullName: { type: 'string', example: 'Daniel Adeyemi' },
            email: { type: 'string', format: 'email', example: 'demo-owner@parallel-market-ai.local' },
            companyName: { type: 'string', nullable: true, example: 'Parallel Market Demo Ventures' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6602a1f1a1b2c3d4e5f60abc' },
            name: { type: 'string', example: 'Starter Market Simulation Pack' },
            description: { type: 'string', example: 'A bundle of pre-configured simulations for early-stage founders.' },
            category: { type: 'string', nullable: true, example: 'Simulations' },
            price: { type: 'number', example: 49.99 },
            currency: { type: 'string', example: 'USD' },
            status: { type: 'string', enum: ['draft', 'active', 'archived'], example: 'active' },
            targetAudience: { type: 'string', nullable: true, example: 'Early-stage B2B SaaS founders' },
            features: { type: 'array', items: { type: 'string' }, example: ['Custom personas', 'Weekly reports'] },
            imageUrl: { type: 'string', nullable: true, example: 'https://cdn.example.com/products/starter-pack.png' },
            owner: { $ref: '#/components/schemas/OwnerSummary' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '6602a1f1a1b2c3d4e5f60def' },
            fullName: { type: 'string', example: 'Amara Okafor' },
            email: { type: 'string', format: 'email', example: 'amara@brightretail.com' },
            phone: { type: 'string', nullable: true, example: '+2348012345678' },
            company: { type: 'string', nullable: true, example: 'Bright Retail Co.' },
            industry: { type: 'string', nullable: true, example: 'Retail' },
            jobTitle: { type: 'string', nullable: true, example: 'Head of Operations' },
            country: { type: 'string', nullable: true, example: 'Nigeria' },
            tags: { type: 'array', items: { type: 'string' }, example: ['vip', 'early-adopter'] },
            notes: { type: 'string', nullable: true, example: 'Interested in the enterprise tier.' },
            owner: { $ref: '#/components/schemas/OwnerSummary' },
            status: { type: 'string', enum: ['active', 'inactive'], example: 'active' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginationMeta: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            totalItems: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
        ApiErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            data: { type: 'object', nullable: true, example: null },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  code: { type: 'string' },
                  message: { type: 'string' },
                  field: { type: 'string' },
                },
              },
            },
            meta: {
              type: 'object',
              properties: { timestamp: { type: 'string', format: 'date-time' } },
            },
          },
        },
      },
    },
  },
  apis: [`${routesDirectory}/*.js`],
});

module.exports = { openApiDocument };
