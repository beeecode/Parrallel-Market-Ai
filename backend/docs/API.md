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

## Placeholder resource groups

Each of the following is mounted and responds `501 Not Implemented` (via the
standard envelope) for **every** HTTP method and sub-path:

| Path                      | Reserved for |
| ------------------------- | ------------ |
| `/api/users`                | User *administration* (distinct from `/api/auth`, which owns the current user's own identity) |
| `/api/simulations`           | Simulation workflows |
| `/api/messages`              | Conversations and messages |
| `/api/reports`               | Reports and insights |
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
