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

Only variables intentionally prefixed with `PUBLIC_` may be exposed to browser code. Phase 4 does not require a public CMS URL. `CMS_API_URL`, `DATABASE_URL`, `PAYLOAD_SECRET`, session settings, and future AI provider keys remain private.

### SvelteKit

```env
CMS_API_URL=http://localhost:3001
SESSION_COOKIE_NAME=parallel_market_session
```

`CMS_API_URL` is read only by SvelteKit server modules. Authentication tokens are stored in an HTTP-only, same-site cookie and are never written to browser storage.

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

SvelteKit frontend with TypeScript, Tailwind CSS, ESLint, Prettier, Vitest, Playwright, the Vercel adapter, and `lucide-svelte`. Dashboard, Live Simulation, Simulation Report, Products, Customers, Insights, Settings, product creation, simulation creation, request simulation, and detail routes now come from Payload through authenticated SvelteKit server services while preserving the accepted responsive interface.

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

The SvelteKit frontend reaches these APIs only through its server-side client. Payload access control remains authoritative; the frontend does not use a hidden administrator account or make private collections public.

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

## Production Deployment Readiness

Phase 6 prepares, but does not deploy, this architecture:

```txt
SvelteKit frontend on Vercel
        |
        v
Payload CMS REST API on Railway or another Node-compatible host
        |
        v
Neon PostgreSQL
```

Reference docs used for the deployment plan:

- SvelteKit Vercel adapter: https://svelte.dev/docs/kit/adapter-vercel
- Payload production deployment: https://payloadcms.com/docs/production/deployment
- Neon application connection strings: https://neon.com/docs/connect/connect-from-any-app

### Frontend Deployment

The web app selects `@sveltejs/adapter-vercel` when Vercel's deployment environment sets `VERCEL=1`. Local non-Vercel builds use `@sveltejs/adapter-node` so Windows development machines do not need administrator symlink privileges for Vercel output packaging. Configure the Vercel project from the repository root so workspace packages resolve correctly:

```txt
Framework preset: SvelteKit
Install command: corepack yarn install --immutable
Build command: corepack yarn build:web
Development command: corepack yarn dev:web
```

Set these Vercel environment variables:

```env
CMS_API_URL=https://your-cms-host.example
PUBLIC_CMS_URL=https://your-cms-host.example
SESSION_COOKIE_NAME=parallel_market_session
SESSION_COOKIE_SECURE=true
FRONTEND_MOCK_MODE=false
```

`CMS_API_URL` and `SESSION_COOKIE_*` are server-only. `PUBLIC_CMS_URL` is safe for browser-visible links and asset origins only.

To test the exact Vercel adapter locally, run in a symlink-capable environment such as Vercel CI, Linux, WSL, or Windows with Developer Mode/admin symlink permissions:

```bash
VERCEL=1 corepack yarn build:web
```

### CMS Deployment

Payload CMS runs as a Next.js application with `output: "standalone"` enabled for Node-compatible hosting. Railway can use the repository root with:

```txt
Install command: corepack yarn install --immutable
Build command: corepack yarn build:cms
Start command: corepack yarn start:cms
Health check path: /api/health
```

Set these CMS environment variables privately on the host:

```env
CMS_SERVER_URL=https://your-cms-host.example
DATABASE_URL=postgresql://USERNAME:PASSWORD@HOST/DATABASE_NAME?sslmode=require&channel_binding=require
PAYLOAD_SECRET=replace-with-a-long-random-secret
CORS_ORIGINS=https://your-frontend-host.example,https://your-cms-host.example
```

Optional controlled setup variables:

```env
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
SEED_ADMIN_NAME=
CRON_SECRET=
AI_PROVIDER_API_KEY=
AI_PROVIDER_MODEL=
```

Do not run demo seed data in production unless explicitly approved. `AI_PROVIDER_*` values are reserved for a later real AI phase and are not required now.

### CORS, CSRF, And Cookies

- Payload `cors` and `csrf` use the comma-separated `CORS_ORIGINS` allow-list. Do not use `*` for private application endpoints.
- Payload uses the `parallel-market-ai` cookie prefix.
- SvelteKit stores the Payload session token only in an HTTP-only, `sameSite: "lax"` cookie.
- Production cookies use `secure: true` automatically on HTTPS, and `SESSION_COOKIE_SECURE=true` can force the setting.
- Login return paths are normalized with `safeInternalReturnPath` to prevent open redirects.
- Browser storage is not used for authentication tokens.

### Neon Database And Migrations

Neon production connection strings should require SSL/TLS. Use a separate development branch or database from production whenever possible.

Migration workflow:

```bash
corepack yarn migrate:status:cms
corepack yarn migrate:cms
corepack yarn migrate:create:cms --name descriptive_name
```

Review every generated migration before applying it to a shared database. Do not run destructive resets, drops, truncations, or production seed commands without explicit approval. Take a Neon backup or branch snapshot before applying production migrations.

### Media Uploads

Payload Media currently writes local uploads to `apps/cms/media`, which is ignored by Git. This is safe for local development but not reliable on ephemeral production filesystems.

Production media requires one of:

- a host with persistent storage mounted for uploads, or
- a future S3-compatible/object-storage adapter.

Cloud media storage is intentionally deferred. TODO: add an approved S3-compatible Payload storage plugin before relying on production uploads.

### Production Security Checklist

- No `.env` files are committed.
- `DATABASE_URL`, `PAYLOAD_SECRET`, AI keys, seed passwords, and session tokens remain private.
- Payload access control remains the source of truth for private records.
- Anonymous users cannot list private custom simulation requests.
- SvelteKit components do not call Payload directly from the browser.
- Private Payload endpoints are not exposed through wildcard CORS.
- Production cookies are HTTP-only, same-site, and secure over HTTPS.
- Payload `defaultDepth` and `maxDepth` are bounded to reduce over-fetching and expensive relationship traversal.
- The CMS health endpoint returns only non-sensitive service status.

### Performance Notes

- The frontend uses server-side DTO mapping to keep component data shapes small.
- Payload service calls use explicit `depth` values and focused query fields where practical.
- Chart components are CSS/SVG based and do not load a heavy charting runtime.
- Current 2D/3D assets are static and licensed; avoid adding large uncompressed media.
- Future optimization candidates: image CDN/object storage, route-level cache strategy for public pages, and query profiling after real traffic exists.

### Deployment Approval Checklist

Before deployment approval:

```bash
corepack yarn install
corepack yarn workspaces:list
corepack yarn lint:all
corepack yarn typecheck:all
corepack yarn build:all
corepack yarn test:web
corepack yarn test:e2e:web
corepack yarn test:cms
corepack yarn generate:types:cms
corepack yarn generate:importmap:cms
corepack yarn migrate:status:cms
```

Then verify locally with real Payload data: login, dashboard, products, customers, simulations, reports, insights, settings, request simulation, logout, protected redirects, message submission, product creation, simulation creation, and custom request submission.

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

- Request-simulation agent
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

- No AI provider, streaming, queues, WebSockets, or request-agent interface is implemented.
- Local media storage is not suitable for production.
- Email uses Payload's development console adapter.

## Phase 4 Status

Phase 4 connects the accepted SvelteKit interface to Payload without exposing private credentials to the browser.

Authentication flow:

1. The login form submits to a SvelteKit server action.
2. SvelteKit authenticates against Payload and stores the returned user token in an HTTP-only, same-site cookie.
3. `hooks.server.ts` validates the session through Payload `/api/users/me` and exposes only a safe user model through `event.locals`.
4. Protected routes redirect to `/login` when the session is missing or expired.
5. Logout attempts Payload logout, always clears the local cookie, and returns to `/login`.

API integration:

- `apps/web/src/lib/server/payload` contains the server-only client, query builder, authentication functions, runtime response guards, and safe error classes.
- `apps/web/src/lib/server/services` contains dashboard, simulation, report, message, and session behavior.
- `apps/web/src/lib/server/mappers` converts validated Payload REST records into frontend-safe view models.
- Reusable Svelte components receive view models and do not call Payload directly.
- Dashboard headline data uses the most recently completed, started, or updated accessible simulation; totals aggregate all accessible simulations.
- Simulation selection prefers an explicit accessible ID, then a running simulation, then the most recently completed or updated accessible simulation.
- Reports prefer an explicit accessible simulation report, otherwise the latest accessible report.
- Business message submissions validate content and relationships, retain the draft after recoverable failure, and use a unique client submission ID for idempotency.

Local startup order:

```bash
# Terminal 1
corepack yarn dev:cms

# Terminal 2
corepack yarn dev:web
```

Open `http://localhost:5173/login` and sign in with an authorised local Payload account. Development test credentials are derived from the ignored CMS environment during Playwright runs; passwords are not stored in test source or documentation.

Phase 4 tests:

```bash
corepack yarn test:web
corepack yarn test:cms
corepack yarn test:e2e:web
corepack yarn lint:all
corepack yarn typecheck:all
corepack yarn build:all
```

Current limitations:

- Message updates use normal HTTP form actions; real-time sockets, queues, streaming customer replies, and AI generation are not implemented.
- The report export is a text download based on the already loaded report view model, not a PDF.
- The local data files under `apps/web/src/lib/data` remain visual-reference fixtures only and are not part of runtime route loading.
- The custom simulation request agent is reserved for Phase 5.

## Phase 4.5 Status

Phase 4.5 completes the remaining authenticated frontend surface before the request-agent phase.

Completed frontend routes:

- `/products`: Payload-backed product list with search, status/category filters, simulation counts, empty/error handling, and responsive cards
- `/products/new`: server-validated product creation flow using the authenticated user as owner
- `/products/[id]`: product detail with metadata and related accessible simulations
- `/customers`: Payload-backed customer-agent directory with search, simulation, and price-sensitivity filtering
- `/insights`: deterministic insights derived only from accessible completed reports
- `/settings`: authenticated profile, role, company, session/security, and future preference sections
- `/simulations/new`: server-validated draft simulation creation from accessible products
- `/simulations/[id]/live`: specific simulation workspace reusing the existing live-simulation components and message action
- `/reports/[id]`: specific report detail route reusing the existing report components and export behavior

Products flow:

1. Authenticated users open `/products`.
2. Product records are loaded through SvelteKit server services and Payload access control.
3. `/products/new` validates required fields, supported currency, status, and non-negative price server-side.
4. Successful creation redirects to `/products/[id]`.

Simulation creation flow:

1. Authenticated users open `/simulations/new`.
2. Accessible products are loaded from Payload.
3. The form validates product selection, title, target audience, target location, simulation goal, and positive customer count.
4. Successful creation stores a draft simulation and redirects to `/simulations/[id]/live`.
5. No simulation engine, customer generation, queue, WebSocket, Redis, or AI process is started.

Insight derivation rules:

- Pricing insight uses the latest accessible completed report's optimal price range and current average price.
- Sentiment insight averages positive and negative sentiment across accessible completed reports.
- Customer objection and risk insights use the most frequent labels in accessible report arrays.
- Recommendations and risks are unique labels from accessible reports.
- These are deterministic summaries, not AI-generated predictions.

Phase 4.5 tests:

```bash
corepack yarn test:web
corepack yarn test:e2e:web
corepack yarn lint:all
corepack yarn typecheck:all
corepack yarn build:all
```

Phase 4.5 limitations:

- Product editing is not implemented yet.
- Newly created draft simulations do not generate customer agents.
- Deployment adapters and production infrastructure remain reserved for Phase 6.

## Phase 5 Status

Phase 5 adds the protected Custom Simulation Request Agent at `/request-simulation`.

Completed request-agent behavior:

- Authenticated users can open `/request-simulation` from desktop and mobile navigation.
- The page pre-fills customer name, email, and company from the authenticated session where available.
- The guided assistant collects customer, company, product, market, pricing, challenge, goal, budget, and timeline fields one step at a time.
- Users can move forward, go back, edit answers from the review screen, submit, see a success state, and start another request.
- Client-side validation gives immediate feedback; server-side validation remains authoritative.
- The server action validates input, generates a deterministic summary, and creates a record in Payload `custom-simulation-requests`.
- Submission uses the existing server-side Payload client. Svelte components do not call Payload directly and no token is stored in browser storage.

Summary generation:

- `apps/web/src/lib/server/ai` contains a server-only future AI-provider interface.
- No AI key is required for Phase 5.
- When no provider is configured, or a future provider fails, the app uses a deterministic summary.
- The UI states clearly that the preview summary is deterministic and not externally AI-generated in this phase.

Phase 5 tests:

```bash
corepack yarn test:web
corepack yarn workspace @parallel-market-ai/web playwright test --config=playwright.config.ts e2e-phase5.spec.ts --reporter=line --workers=1
corepack yarn lint:all
corepack yarn typecheck:all
corepack yarn build:all
```

Phase 5 limitations:

- The agent does not call an external AI provider.
- Submitted custom requests are intake records only; they are not automatically converted into products or simulations.
- No billing, deployment, queues, WebSockets, Redis, background workers, or real simulation generation is included.

## Public Landing Page

The SvelteKit root route (`/`) is a public marketing page. It does not depend on Payload CMS and
does not redirect visitors to the authenticated application.

The authenticated product begins at `/dashboard`. Existing product routes, including products,
customers, simulations, reports, insights, settings, and request simulation, remain protected by
the server authentication hook.

The landing page includes:

- a dedicated public navbar and mobile navigation,
- a product-led hero with an in-code dashboard preview,
- clearly labelled sample simulation metrics,
- feature, workflow, benefits, audience, and use-case sections,
- interactive product-preview tabs,
- a frontend-only sample persona conversation,
- an accessible FAQ accordion,
- login, dashboard, and custom-simulation CTAs,
- public-page metadata and social-card text metadata.

Landing content is stored as local typed constants. It does not fetch private Payload collections,
so the marketing page remains available when the CMS is offline.

Visual assets use the existing Lucide icon family, local demo avatars, semantic HTML, and
CSS/Svelte product mockups. No external images, hotlinks, stock photos, private screenshots, or
unlicensed assets are used. A future Open Graph image should be added only after a licensed,
optimised local asset is approved.

Accessibility and performance considerations include keyboard-visible focus states, native mobile
popover navigation, labelled tabs, accordion state attributes, semantic landmarks, reduced-motion
support, no animation dependency, no landing-page API requests, and no large raster assets.

Landing-specific coverage is included in the web unit and Playwright suites. It verifies public
access, CTA routing, protected request redirection, product tabs, FAQ behaviour, mobile navigation,
responsive overflow, and empty browser auth storage.

## Frontend Mock Preview Mode

For design review or local UI preview without Payload CMS, PostgreSQL, or admin login, the SvelteKit frontend supports a
server-only mock mode:

```env
FRONTEND_MOCK_MODE=true
```

The flag belongs in `apps/web/.env.local` or another ignored local environment file. When enabled, protected frontend
routes receive a safe demo user and typed mock view models from the SvelteKit server layer. Svelte components still use
the same route files, services, and view-model shapes as the real Payload-backed app.

Mock mode covers:

- `/dashboard`
- `/products`
- `/products/new`
- `/products/[id]`
- `/customers`
- `/simulations`
- `/simulations/new`
- `/simulations/[id]/live`
- `/reports`
- `/reports/[id]`
- `/insights`
- `/settings`
- `/request-simulation`

To preview:

```bash
corepack yarn dev:web
```

Then open `http://localhost:5173/dashboard`. Disable mock mode by setting `FRONTEND_MOCK_MODE=false` or removing
`apps/web/.env.local`, then restart `dev:web`.

Mock mode is for frontend review only. It does not create Payload records, weaken Payload access control, or replace
the real authenticated integration.
