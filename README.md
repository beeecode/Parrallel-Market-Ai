# Parallel Market AI

Parallel Market AI is a market-simulation SaaS product. The current accepted interface is preserved as a Next.js prototype, while the production direction is a SvelteKit frontend backed by Payload CMS and PostgreSQL.

The Next.js prototype is retained as the visual source of truth.
The new product frontend will be implemented in SvelteKit.
Payload CMS provides the backend, admin panel, authentication foundation, and API.

## Current Architecture

```txt
parallel-market-ai/
|-- apps/
|   |-- web/                  # SvelteKit frontend scaffold
|   |-- cms/                  # Payload CMS backend, admin, migrations, and seed
|   `-- next-prototype/       # Existing Next.js visual prototype
|-- packages/
|   |-- shared-types/
|   |-- shared-config/
|   `-- validation/
|-- inspo/
|-- .env.example
|-- package.json
`-- yarn.lock
```

## Prerequisites

- Node.js compatible with the workspace packages
- Corepack
- Yarn `4.9.2` through Corepack
- PostgreSQL for running Payload CMS locally

The repository uses Yarn workspaces with the `node-modules` linker for compatibility across Next.js, SvelteKit, Payload, and Windows development.

## Setup

```bash
corepack yarn install
```

If `yarn` is unavailable on PATH, run commands as `corepack yarn <command>`.

On Windows, `corepack enable` may fail if it cannot write global shims without administrator permissions. Administrator access is not required for this project; use `corepack yarn ...` directly instead.

## Environment

Root reference template:

- `.env.example`

App-specific templates:

- `apps/web/.env.example`
- `apps/cms/.env.example`
- `apps/next-prototype/.env.example`

Only `PUBLIC_` variables may be exposed to browser code. `DATABASE_URL`, `PAYLOAD_SECRET`, and future AI provider keys must remain private.

### SvelteKit

```env
PUBLIC_CMS_URL=http://localhost:3001
```

### Payload CMS

```env
CMS_SERVER_URL=http://localhost:3001
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
PAYLOAD_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=
```

Create local `.env` files as needed and never commit them.

## PostgreSQL Requirement

Payload CMS is configured with `@payloadcms/db-postgres`. Running the CMS requires a valid PostgreSQL database and a private `DATABASE_URL`.

Expected format:

```env
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

For local development, create a database such as `parallel_market_ai`, then set `DATABASE_URL` inside `apps/cms/.env`. Do not use production credentials locally.

If Docker is installed in a later phase, a development-only PostgreSQL service can be added. Docker is not required for the current SvelteKit or Next.js prototype checks.

## Local Ports

- Next prototype: `http://localhost:3000`
- Payload CMS: `http://localhost:3001`
- SvelteKit web: `http://localhost:5173`

## Scripts

```bash
corepack yarn dev:prototype
corepack yarn dev:web
corepack yarn dev:cms

corepack yarn lint:prototype
corepack yarn lint:web
corepack yarn lint:cms
corepack yarn lint:all

corepack yarn typecheck:web
corepack yarn typecheck:cms
corepack yarn typecheck:packages
corepack yarn typecheck:all

corepack yarn build:prototype
corepack yarn build:web
corepack yarn build:cms
corepack yarn build:all

corepack yarn test:cms
corepack yarn test:web
corepack yarn test:e2e:web

corepack yarn generate:types:cms
corepack yarn generate:importmap:cms
corepack yarn migrate:status:cms
corepack yarn migrate:cms
corepack yarn seed:cms
corepack yarn workspaces:list
```

Installation is intentionally the package-manager command `corepack yarn install`, not a `package.json` lifecycle script.

## Applications

### `apps/next-prototype`

The existing Next.js, TypeScript, and Tailwind CSS prototype. It contains the current Dashboard, Live Simulation, and Simulation Report screens and remains the visual fallback/reference.

### `apps/web`

SvelteKit frontend with TypeScript, Tailwind CSS, ESLint, Prettier, Vitest, Playwright, adapter-auto, and `lucide-svelte`. The Dashboard, Live Simulation, and Simulation Report interfaces now match the accepted prototype direction with responsive navigation and local-only interactions.

### `apps/cms`

Payload CMS backend and admin application using Next.js, PostgreSQL, Lexical, and Sharp. Phase 3 adds authentication, application collections, relationship validation, access control, tracked migrations, generated types, tests, and deterministic development seed data.

Local media uploads are written to `apps/cms/media` and are development-only. Production object storage is intentionally deferred.

## Payload Data Model

Phase 3 registers these collections:

- `users`: authenticated administrators, analysts, business owners, and viewers
- `media`: development uploads for avatars, products, pages, and reports
- `pages`: published or private CMS pages using reusable content blocks
- `products`: owner-managed products and services
- `simulations`: product-linked market simulations and summary metrics
- `customer-agents`: simulated customers belonging to a simulation
- `conversations`: simulation and customer-agent conversation records
- `messages`: ordered customer, business, and system messages
- `reports`: private, versioned simulation analysis
- `custom-simulation-requests`: public-create, staff-managed intake records

Relationships use Payload relationship fields as the source of truth:

```txt
User -> Products -> Simulations -> Customer Agents
                          |       -> Conversations -> Messages
                          `       -> Reports

Custom Simulation Request -> optional converted Product / Simulation
```

## Access Control

- Anonymous users may read published Pages and public Media.
- Anonymous users may create a Custom Simulation Request but cannot list, read, update, or delete requests.
- Business owners can manage Products and Simulations they own and related simulation records.
- Analysts can read market-research and simulation records and manage protected analysis and Reports.
- Administrators can manage all application records and are the only role allowed to delete most private records or change privileged user fields.
- Inactive users are denied authenticated permissions and login.
- Calculated metrics, AI-analysis metadata, ownership, and role fields use field-level access protection.

The SvelteKit frontend is not connected to these APIs yet. Phase 4 will add the typed API service layer while preserving the current local dummy-data fallback.

## Payload Migrations

Check migration status:

```bash
corepack yarn migrate:status:cms
```

Apply tracked migrations:

```bash
corepack yarn migrate:cms
```

Create a future migration after changing collection schemas:

```bash
corepack yarn workspace @parallel-market-ai/cms migrate:create --name descriptive_name
```

Review every generated `up` migration before applying it. Never use a destructive schema reset against a shared database.

On this Windows environment, Payload migration generation required Node.js 22 because the Node.js 24 TypeScript loader failed on a `node:crypto` URL. Node.js 22 LTS is the recommended runtime for migration commands until that upstream compatibility issue is resolved.

## Payload Types And Admin Map

Generate Payload document types and refresh admin imports:

```bash
corepack yarn generate:types:cms
corepack yarn generate:importmap:cms
```

Generated Payload document types remain the source of truth for CMS records. Framework-neutral unions live in `packages/shared-types`.

## Development Seed

Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, and `SEED_ADMIN_NAME` in the ignored `apps/cms/.env`, then run:

```bash
corepack yarn seed:cms
```

The seed is disabled when `NODE_ENV=production`. It upserts deterministic demo users, products, simulations, six customer agents, representative conversations and messages, one report, and published/draft pages. Re-running it updates matching records rather than creating uncontrolled duplicates. Demo user passwords are derived privately from `PAYLOAD_SECRET` and are never logged.

## Adapter Notes

The SvelteKit app uses `adapter-auto` during Phase 1 so the foundation remains platform-neutral. It may warn during local builds when no deployment platform is detected. Phase 6 should select a concrete adapter, likely Vercel or Netlify, once deployment is approved.

Payload CMS runs as a Node/Next.js application and requires a persistent PostgreSQL service. Railway is a suitable future target, with `DATABASE_URL`, `PAYLOAD_SECRET`, `CMS_SERVER_URL`, and `CORS_ORIGINS` configured as private deployment variables.

## Phase 1 Status

Completed in Phase 1:

- Yarn workspace monorepo foundation
- Existing Next.js prototype preserved under `apps/next-prototype`
- SvelteKit frontend scaffold under `apps/web`
- Payload CMS scaffold under `apps/cms`
- Shared package foundations
- Root and app-specific environment templates
- Phase 1 documentation

Not completed in Phase 1:

- Payload business collections
- API service integration
- Request-simulation agent
- Authentication flows in SvelteKit
- Seed data
- Deployment configuration

## Phase 2 Status

Completed in Phase 2:

- Shared SvelteKit application shell with desktop sidebar and native mobile drawer
- Dashboard route with metrics, forecast chart, activity table, and responsive mobile cards
- Live Simulation route with customer agents, chat tabs, local message sending, activity, and stats
- Simulation Report route with report tabs, sentiment, feedback, objections, pricing intelligence, and text export
- Reusable UI, layout, dashboard, simulation, and report components
- Local typed data, validation, chart helpers, and loading/empty/error state components
- Desktop and mobile Playwright workflow coverage

Still planned for later phases:

- Typed API integration between SvelteKit and Payload
- Request-simulation agent
- SvelteKit authentication flows
- Production deployment adapters and infrastructure

## Phase 3 Status

Completed in Phase 3:

- Ten Payload collections and relationship model
- Role, ownership, related-simulation, public-page, and public-request access control
- Server-side field and cross-document validation
- PostgreSQL migrations and generated Payload types
- Idempotent development seed data matching the accepted demo screens
- Access, validation, collection-schema, and seed-helper tests
- Runtime verification of admin authentication and public/private API boundaries

Phase 3 limitations:

- The SvelteKit UI still uses typed local dummy data.
- No frontend API client or authentication flow exists yet.
- No AI provider, streaming, queues, WebSockets, or request-agent interface is implemented.
- Local media storage is not suitable for production.
- Email uses Payload's development console adapter.
