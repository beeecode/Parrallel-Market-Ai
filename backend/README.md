# Parallel Market AI — Backend

Express + MongoDB backend. Plain JavaScript (no TypeScript), standalone (not
part of any Yarn/npm workspace) — mirrors how `frontend/` is set up.
Authentication and user management (registration, login, JWT access/refresh
tokens with rotation, profile, password change), Products, Customers,
Simulations, Customer Agents, Reports, and Insights are fully implemented.
Every other resource (messaging, AI, request-simulation, etc.) is still a
placeholder reserved for later phases.

## Why this exists

The project was rebuilt from SvelteKit + Payload. An earlier attempt at this
backend used TypeScript + Prisma + PostgreSQL (moved aside to
`backend-postgres-legacy/`). This is the fresh MERN rebuild: Node.js,
Express, MongoDB via Mongoose.

## Getting started

```bash
cd backend
npm install
cp .env.example .env   # then fill in a real MONGODB_URI and JWT secrets
npm run dev             # http://localhost:4000
```

- Health: `http://localhost:4000/api/health`
- Swagger UI: `http://localhost:4000/api/docs`
- Auth: `http://localhost:4000/api/auth` (register, login, logout,
  refresh-token, me, profile, change-password — see
  [docs/API.md](docs/API.md))
- Products: `http://localhost:4000/api/products` (CRUD, soft-delete,
  pagination, search — see [docs/API.md](docs/API.md))
- Customers: `http://localhost:4000/api/customers` (CRUD, soft-delete,
  pagination, search — see [docs/API.md](docs/API.md))
- Simulations: `http://localhost:4000/api/simulations` (CRUD, archive/restore,
  status workflow, auto-calculated statistics — see [docs/API.md](docs/API.md))
- Customer Agents: `http://localhost:4000/api/customer-agents` (CRUD, plus
  `GET /api/simulations/:id/customer-agents` — see [docs/API.md](docs/API.md))
- Reports: `http://localhost:4000/api/reports` (generate from a completed
  simulation, archive/restore, auto-computed metrics/recommendations — see
  [docs/API.md](docs/API.md))
- Insights: `http://localhost:4000/api/insights` (read-only, auto-generated
  alongside each report, plus `GET /api/reports/:id/insights` — see
  [docs/API.md](docs/API.md))

The server starts even if MongoDB is unreachable — `/api/health` reports
`database: "disconnected"` instead of the process crashing.

## Scripts

```bash
npm run dev      # node --watch server.js
npm start        # node server.js
npm test         # jest --runInBand
npm run lint     # eslint .
npm run format   # prettier --write .
```

## Folder structure

```
backend/
├── app.js                Express app assembly (middleware order, routes)
├── server.js             HTTP server startup, DB connect, graceful shutdown
├── src/
│   ├── config/           env.js (the only file reading process.env), database.js,
│   │                     jwt.js, swagger.js, cloudinary.js, logger.js
│   ├── controllers/      Coordinate request → service → response. No business logic.
│   ├── middlewares/       authentication, authorization, errorHandler, notFound,
│   │                     requestLogger, rateLimiter, sanitize, validate, upload
│   ├── models/           Mongoose schemas only (HealthLog, User, Product, Customer,
│   │                     Simulation, CustomerAgent, Report, Insight)
│   ├── repositories/     The only layer that talks to Mongoose/MongoDB
│   ├── services/         Business/use-case logic, calls repositories
│   ├── routes/           One file per resource; index.js aggregates them
│   ├── validators/       Reusable express-validator chains
│   ├── utils/            ApiResponse, ApiError, asyncHandler, pagination, helpers
│   ├── constants/        Roles, HTTP status codes, error codes, route paths
│   └── types/            JSDoc typedefs only (no TypeScript in this project)
├── docs/                 API.md, ARCHITECTURE.md
├── uploads/               Multer's local disk destination (gitignored contents)
└── tests/                Jest + Supertest
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the request flow and
layering rules, and [docs/API.md](docs/API.md) for the current endpoints.

## Environment setup

Copy `.env.example` to `.env`. Required: `MONGODB_URI`, `JWT_SECRET`,
`JWT_REFRESH_SECRET` — the app throws on startup if any are missing. Never
commit real credentials; `.env` is gitignored.

## Testing

```bash
npm test
```

Tests run against the Express `app` directly via Supertest. Auth/profile,
Products, Customers, Simulations, Customer Agents, Reports, and Insights
tests (`tests/auth/*.js`, `tests/products/*.js`, `tests/customers/*.js`,
`tests/simulations/*.js`, `tests/customerAgents/*.js`, `tests/reports/*.js`,
`tests/insights/*.js`) spin up a real, in-memory MongoDB instance per suite
via `mongodb-memory-server` (`tests/helpers/dbHandler.js`) — no external
database is required, but the reads/writes are real, not mocked. The
deterministic analytics/insight formulas (`reportAnalytics.js`,
`insightRules.js`) are additionally covered by pure unit tests with no
database at all (`tests/reports/analytics.test.js`,
`tests/insights/rules.test.js`). The health/placeholder tests don't need a
database either: the health check simply reports `disconnected` and asserts
on response *shape*.

First run downloads the `mongodb-memory-server` binary and can take longer
than the Jest default timeout — `jest.config.js` sets `testTimeout: 60000`
to cover it.

## Current scope

`/api/health`, `/api/docs`, `/api/auth` (7 endpoints), `/api/products`,
`/api/customers`, `/api/simulations`, `/api/customer-agents`, `/api/reports`,
and `/api/insights` are fully implemented and backed by MongoDB. Every other
resource group (`/api/users`, `/api/messages`, `/api/request-simulation`)
still responds `501 Not Implemented` for every method — placeholders
reserving the route shape ahead of the feature phases that will implement
them.

Note: `/api/users` is a separate placeholder for future user-*administration*
endpoints (e.g. an admin listing/managing all accounts) — it is distinct from
`/api/auth`, which already owns the current user's own identity (register,
login, `/me`, `/profile`, `/change-password`).

Products, Customers, Simulations, Customer Agents, and Reports all follow the
same ownership model: every record has an `owner`, BUSINESS_OWNER is confined
to records they own, ADMIN has unrestricted access, and ANALYST/VIEWER have
unrestricted *read* access. A Simulation belongs to a Product, a Customer
Agent belongs to a Simulation, a Report belongs to exactly one Simulation and
one Product, and an Insight belongs to exactly one Report — ownership is
inherited down this whole chain (a Customer Agent's and a Report's `owner`
are always copied from their parent, never from the caller). Reports can
only be generated from a **completed** simulation, and at most one active
report exists per simulation — generating again just returns the existing
one. Insights have no manual-creation endpoint at all; they are always a
deterministic side effect of report generation, built from the report's own
`metrics` with fixed threshold rules — no AI, no randomness. See
[docs/API.md](docs/API.md) for the full authorization matrix and
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the reasoning and the exact
formulas.
