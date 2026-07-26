# API Reference

Base URL: `/api`. Interactive docs generated from `@openapi` JSDoc comments
in `src/routes/*.js`: `GET /api/docs`.

## Response envelope

Every endpoint except `/api/health` uses:

```ts
{
  success: boolean;
  message: string;
  data: object | null;
  errors: Array<{ code: string; message: string; field?: string }>;
  meta: { timestamp: string };
}
```

## `GET /api/health`

Has its own flat shape (per spec), not the envelope above:

```json
{
  "success": true,
  "version": "0.1.0",
  "uptime": 12.5,
  "database": "connected",
  "timestamp": "2026-07-25T00:00:00.000Z"
}
```

- `200` when MongoDB is reachable (`database: "connected"`).
- `503` when it is not (`database: "disconnected"`, `success: false`). The
  process itself never crashes on a database outage.

## Authentication (`/api/auth`)

All 7 endpoints are implemented and use the standard envelope. Full request/
response schemas are also in Swagger (`GET /api/docs`).

| Method | Path                      | Auth required | Purpose |
| ------ | ------------------------- | -------------- | ------- |
| POST   | `/api/auth/register`       | No              | Create an account, returns `{ user, accessToken, refreshToken }` |
| POST   | `/api/auth/login`           | No              | Verify credentials, returns `{ user, accessToken, refreshToken }` |
| POST   | `/api/auth/logout`          | Yes (Bearer)     | Invalidates the current refresh token |
| POST   | `/api/auth/refresh-token`   | No (body token)   | Rotates the token pair; the token passed in is invalidated |
| GET    | `/api/auth/me`               | Yes (Bearer)     | Returns the current user |
| PATCH  | `/api/auth/profile`          | Yes (Bearer)     | Updates `fullName`/`avatar`/`companyName`/`phone` |
| PATCH  | `/api/auth/change-password`   | Yes (Bearer)     | Requires `currentPassword` + `newPassword` |

**Register / Login response shape:**

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "…", "fullName": "…", "email": "…", "role": "BUSINESS_OWNER",
      "avatar": null, "companyName": null, "phone": null,
      "isActive": true, "emailVerified": false, "lastLogin": null,
      "createdAt": "…", "updatedAt": "…"
    },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  },
  "errors": [],
  "meta": { "timestamp": "…" }
}
```

`password` and `refreshToken` never appear on the `user` object — the
`User` model's `toJSON` transform strips them unconditionally.

**Auth flow notes:**

- Access tokens are short-lived (`JWT_ACCESS_EXPIRES_IN`, default `15m`) and
  sent as `Authorization: Bearer <token>` on protected routes.
- Refresh tokens are longer-lived (`JWT_REFRESH_EXPIRES_IN`, default `7d`).
  Only a SHA-256 hash of the refresh token is stored on the user document —
  never the raw token.
- **Rotation**: every successful `/refresh-token` call issues a brand-new
  pair and immediately invalidates the token that was just used (the old
  hash is overwritten). Reusing a rotated-out refresh token returns `401`.
- **Logout** clears the stored refresh token hash, so the refresh token the
  client was holding stops working immediately even though it hasn't expired.
- Roles (`ADMIN > BUSINESS_OWNER > ANALYST > VIEWER`,
  `src/constants/roles.js`) are carried in the access token payload and
  enforced by `middlewares/authorization.js` (`requireRoles`,
  `requireMinimumRole`). None of the 7 endpoints above require an elevated
  role yet — they're all self-service — but the middleware is wired and
  tested (`tests/authorization.test.js`), ready for the first admin-only
  route in a later phase.
- The server never stores JWTs anywhere on the client's behalf; what the
  frontend does with the returned tokens (memory, cookie, etc.) is a
  frontend-phase decision.

## Products (`/api/products`) and Customers (`/api/customers`)

Both resources are fully implemented, share an identical shape, and require
authentication on every endpoint.

| Method | Path                    | Roles that may call it | Purpose |
| ------ | ----------------------- | ----------------------- | ------- |
| GET    | `/api/products`          | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Paginated, searchable, sortable list |
| GET    | `/api/products/{id}`      | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Single product |
| POST   | `/api/products`           | ADMIN, BUSINESS_OWNER   | Create (owned by the caller) |
| PATCH  | `/api/products/{id}`      | ADMIN, BUSINESS_OWNER   | Update |
| DELETE | `/api/products/{id}`      | ADMIN, BUSINESS_OWNER   | Soft-delete (`isActive: false`) |

The same table applies to `/api/customers`. See Swagger (`GET /api/docs`)
for full request/response schemas and examples.

**Ownership and authorization model:**

| Role | List scope | Read/Update/Delete a specific record |
| ---- | ---------- | -------------------------------------- |
| ADMIN | All owners | Any record |
| BUSINESS_OWNER | Only records they own | Only records they own — someone else's record responds `404`, not `403`, so its existence is never confirmed |
| ANALYST | All owners (read-only) | Any record (read-only; write routes 403 before the service layer runs) |
| VIEWER | All owners (read-only) | Any record (read-only; write routes 403 before the service layer runs) |

A created record's `owner` is always the authenticated caller — there is no
way to create a record on another user's behalf, including as ADMIN.

**Pagination, search, and sort** (query parameters on both list endpoints):

| Param | Default | Notes |
| ----- | ------- | ----- |
| `page` | `1` | 1-indexed |
| `limit` | `20` | Max `100` |
| `search` | — | Case-insensitive substring match. Products: `name`, `category`. Customers: `fullName`, `email`, `company`. |
| `sort` | `createdAt` | Products: `name`, `price`, `createdAt`, `updatedAt`. Customers: `fullName`, `company`, `createdAt`, `updatedAt`. |
| `order` | `desc` | `asc` or `desc` |
| `status` | — | Products: `draft`/`active`/`archived`. Customers: `active`/`inactive`. |

List responses use this shape (as `data`):

```json
{
  "items": [ /* Product or Customer objects */ ],
  "pagination": { "page": 1, "limit": 20, "totalItems": 42, "totalPages": 3 }
}
```

**Duplicate detection:** Product names and Customer emails are unique
*per owner*, case-insensitively (a MongoDB collation-backed compound index
on `owner` + `name`/`email` is the source of truth; the service pre-checks
and returns `409 CONFLICT` before ever hitting the index, so races are the
only path to the index actually rejecting an insert).

**Soft delete only:** `DELETE` never removes a document — it sets
`isActive: false`. Every read path (list, get, update, delete) filters
`isActive: true`, so a soft-deleted record behaves as if it doesn't exist
everywhere except a direct database query.

## Simulations (`/api/simulations`) and Customer Agents (`/api/customer-agents`)

Both are fully implemented. A Simulation belongs to one owner and one
Product; a Customer Agent belongs to one Simulation (and inherits its
`owner` from that Simulation). All endpoints require authentication.

| Method | Path                                  | Roles that may call it | Purpose |
| ------ | ------------------------------------- | ------------------------ | ------- |
| GET    | `/api/simulations`                     | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Paginated, searchable, sortable list |
| GET    | `/api/simulations/{id}`                 | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Single simulation |
| GET    | `/api/simulations/{id}/customer-agents`  | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Agents belonging to one simulation |
| POST   | `/api/simulations`                      | ADMIN, BUSINESS_OWNER    | Create (owned by the caller, status always starts `draft`) |
| PATCH  | `/api/simulations/{id}`                  | ADMIN, BUSINESS_OWNER    | Update fields and/or transition `status` |
| DELETE | `/api/simulations/{id}`                  | ADMIN, BUSINESS_OWNER    | Soft-delete, cascades to the simulation's agents |
| PATCH  | `/api/simulations/{id}/archive`           | ADMIN, BUSINESS_OWNER    | Identical operation to `DELETE` above |
| PATCH  | `/api/simulations/{id}/restore`           | ADMIN, BUSINESS_OWNER    | Un-does archive/delete (does not restore agents) |
| GET    | `/api/customer-agents`                   | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Paginated, searchable, sortable list |
| GET    | `/api/customer-agents/{id}`               | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Single agent |
| POST   | `/api/customer-agents`                    | ADMIN, BUSINESS_OWNER    | Create on a simulation the caller can access |
| PATCH  | `/api/customer-agents/{id}`                | ADMIN, BUSINESS_OWNER    | Update |
| DELETE | `/api/customer-agents/{id}`                | ADMIN, BUSINESS_OWNER    | Soft-delete |

Ownership, 404-not-403, pagination/search/sort, and soft-delete all follow
exactly the same rules as Products/Customers above. See Swagger
(`GET /api/docs`) for full request/response schemas and examples.

**Simulation status workflow** (`status` field): `draft → running →
{paused, completed, cancelled}`, `paused → {running, cancelled}`.
`completed` and `cancelled` are terminal. An invalid transition returns
`409 CONFLICT`. Transitioning to `running` for the first time sets
`startedAt`; transitioning to `completed` sets `completedAt` and forces
`progress` to `100`; transitioning to `cancelled` sets `completedAt`.

**Statistics** (`statistics` on Simulation) are always computed server-side
and can never be set via the API — simple, deterministic, no AI:

| Field | Formula |
| ----- | ------- |
| `conversationCount` | Count of this simulation's active customer agents |
| `responseRate` | `round(activeAgentCount / customerCount * 100)`, `0` if `customerCount` is `0` |
| `completionRate` | `100` once `status` is `completed`, otherwise mirrors `progress` |
| `averageSentiment` | Fixed mapping of `configuration.sentiment`: positive→100, neutral/mixed→50, negative→0 |

Recomputed whenever a simulation is created/updated, and whenever one of its
customer agents is created or soft-deleted.

**Cascading soft-delete:** archiving/deleting a Simulation also soft-deletes
every active Customer Agent belonging to it (agents are never physically
removed). Restoring a Simulation does **not** cascade-restore its agents —
an agent removed independently before the cascade must be restored on its
own; this phase has no restore endpoint for agents.

**Relationship validation:** creating a Simulation requires an accessible
Product (`404` if it doesn't exist or belongs to another owner); creating a
Customer Agent requires an accessible Simulation (same rule). A Customer
Agent's `owner` is always copied from its parent Simulation's `owner` — never
from the caller — so ownership stays consistent even when ADMIN creates an
agent on someone else's simulation.

## Reports (`/api/reports`) and Insights (`/api/insights`)

Both are fully implemented. A Report belongs to exactly one Simulation and
one Product; an Insight belongs to exactly one Report (and inherits its
`owner` from that Report). All endpoints require authentication.

| Method | Path                            | Roles that may call it | Purpose |
| ------ | -------------------------------- | ------------------------ | ------- |
| GET    | `/api/reports`                    | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Paginated, searchable, sortable list |
| GET    | `/api/reports/{id}`                | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Single report |
| GET    | `/api/reports/{id}/insights`        | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Insights belonging to one report |
| POST   | `/api/reports/generate`             | ADMIN, BUSINESS_OWNER    | Generate a report from a **completed** simulation (idempotent — see below) |
| PATCH  | `/api/reports/{id}`                  | ADMIN, BUSINESS_OWNER    | Update `title`/`description`/`summary` only |
| DELETE | `/api/reports/{id}`                  | ADMIN, BUSINESS_OWNER    | Soft-delete, cascades to the report's insights |
| PATCH  | `/api/reports/{id}/archive`           | ADMIN, BUSINESS_OWNER    | Identical operation to `DELETE` above |
| PATCH  | `/api/reports/{id}/restore`           | ADMIN, BUSINESS_OWNER    | Un-does archive/delete (does not restore insights) |
| GET    | `/api/insights`                       | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Paginated, searchable, sortable list |
| GET    | `/api/insights/{id}`                   | ADMIN, BUSINESS_OWNER, ANALYST, VIEWER | Single insight |

There is **no manual insight-creation endpoint** — insights are always an
automatic side effect of `POST /reports/generate`.

Ownership, 404-not-403, pagination/search/sort, and soft-delete all follow
exactly the same rules as Products/Customers/Simulations above. See Swagger
(`GET /api/docs`) for full request/response schemas and examples.

**Generation rules:**

- Only a simulation with `status: "completed"` may generate a report —
  attempting it from `draft`/`running`/`paused`/`cancelled` returns
  `409 CONFLICT`.
- At most one *active* report exists per simulation. Calling
  `POST /reports/generate` again for the same simulation does **not** create
  a duplicate — it returns the existing report with `200` (the first
  successful generation returns `201`).
- `metrics`, `recommendations`, `generatedAt`, and `generatedBy` are always
  server-computed. No client input for any of them is ever accepted — not
  on generate, not on update.
- A report's `owner` is copied from its simulation's owner (same pattern as
  Customer Agent inheriting from Simulation); `generatedBy` is always the
  caller who triggered generation — the two can differ when ADMIN generates
  a report on a BUSINESS_OWNER's simulation.

**Metrics** (`metrics` on Report) are always computed server-side from the
source simulation's own data — simple, deterministic, no AI:

| Field | Formula |
| ----- | ------- |
| `conversationCount`, `completionRate`, `responseRate`, `averageSentiment` | Carried over unchanged from `simulation.statistics` |
| `positiveResponses` / `neutralResponses` / `negativeResponses` | Tallied from each active Customer Agent's own `sentiment` field for that simulation (`mixed` folds into neutral) |
| `averageResponseTime` (seconds) | `round(estimatedDuration * 60 / max(conversationCount, 1))`, or `0` if the simulation has no `estimatedDuration` |
| `conversionScore` | `round(completionRate * 0.6 + responseRate * 0.4)` |
| `engagementScore` | `round(responseRate * 0.5 + averageSentiment * 0.5)` |

**Recommendations** (`recommendations` on Report) are generated from fixed
threshold rules over `metrics` (low conversion/engagement/sentiment/
completion each add a recommendation; strong conversion with more positive
than negative responses adds a "scale it" recommendation; if nothing
triggers, a single "maintain current strategy" recommendation is added so
the array is never empty). See `src/services/reportAnalytics.js` for the
exact thresholds.

**Insights** are generated from ten independent, fixed threshold rules over
the same `metrics` (any number can fire for one report): High Engagement,
Low Sentiment, Strong/Weak Conversion, Customer Satisfaction, Pricing
Concern, Purchase Hesitation, Communication Issue, Product Fit, and
Response Quality (both a "concern" and a "strong" variant). See
`src/services/insightRules.js` for the exact thresholds and
[ARCHITECTURE.md](ARCHITECTURE.md) for the reasoning.

**Cascading soft-delete:** archiving/deleting a Report also soft-deletes
every active Insight belonging to it. Restoring a Report does **not**
cascade-restore its insights — there is no insight-restore endpoint at all.

## Placeholder resource groups

Each of the following is mounted and responds `501 Not Implemented` (via the
standard envelope) for **every** HTTP method and sub-path:

| Path                      | Reserved for |
| ------------------------- | ------------ |
| `/api/users`                | User *administration* (distinct from `/api/auth`, which owns the current user's own identity) |
| `/api/messages`              | Conversations and messages |
| `/api/request-simulation`     | Custom simulation request intake |

```json
{
  "success": false,
  "message": "This endpoint has not been implemented yet.",
  "data": null,
  "errors": [{ "code": "NOT_IMPLEMENTED", "message": "This endpoint has not been implemented yet." }],
  "meta": { "timestamp": "2026-07-25T00:00:00.000Z" }
}
```

## Error codes

| Code                    | HTTP Status | Meaning |
| ------------------------ | ----------- | ------- |
| `VALIDATION_ERROR`       | 422         | Request failed express-validator checks |
| `AUTHENTICATION_ERROR`   | 401         | Missing, invalid, or expired access token |
| `AUTHORIZATION_ERROR`    | 403         | Authenticated but role does not permit the action |
| `NOT_FOUND`              | 404         | Route or resource does not exist |
| `CONFLICT`               | 409         | Request conflicts with current state (e.g. duplicate key) |
| `NOT_IMPLEMENTED`        | 501         | Endpoint reserved for a future phase |
| `DATABASE_ERROR`         | 500         | A known MongoDB error occurred |
| `INTERNAL_SERVER_ERROR`  | 500         | An unexpected, non-operational error |
| `RATE_LIMITED`           | 429         | Too many requests from the same client |
