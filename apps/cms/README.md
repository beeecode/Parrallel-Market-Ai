# Parallel Market AI CMS

Payload CMS backend, admin panel, authentication foundation, REST API, migrations, and development seed data for Parallel Market AI.

## Local Development

Create an ignored `apps/cms/.env` with local PostgreSQL credentials and private secrets:

```env
CMS_SERVER_URL=http://localhost:3001
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
PAYLOAD_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Then run from the repository root:

```bash
corepack yarn dev:cms
```

Default local URL: `http://localhost:3001/admin`.

## Production Target

The CMS is a Next.js/Payload application with `output: "standalone"` enabled for Node-compatible hosts such as Railway.

Recommended deployment commands from the monorepo root:

```txt
Install command: corepack yarn install --immutable
Build command: corepack yarn build:cms
Start command: corepack yarn start:cms
Health check path: /api/health
```

Production environment values:

```env
CMS_SERVER_URL=https://your-cms-host.example
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST/DATABASE_NAME?sslmode=require&channel_binding=require
PAYLOAD_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=https://your-frontend-host.example,https://your-cms-host.example
```

Do not commit real credentials. Do not run demo seed data in production unless explicitly approved.

## Migrations And Types

```bash
corepack yarn migrate:status:cms
corepack yarn migrate:cms
corepack yarn generate:types:cms
corepack yarn generate:importmap:cms
```

Review generated migrations before applying them to shared databases. Do not reset, drop, truncate, or recreate production data.

## Media Storage

Local uploads are written to `apps/cms/media`, which is ignored by Git. Production media needs persistent storage or a future object-storage adapter.

## Checks

```bash
corepack yarn lint:cms
corepack yarn typecheck:cms
corepack yarn build:cms
corepack yarn test:cms
```
