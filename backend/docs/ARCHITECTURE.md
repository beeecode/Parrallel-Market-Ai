# Architecture

## Request flow

```
HTTP request
  → app.js middleware chain (helmet, cors, requestLogger, rateLimiter,
    compression, hpp, json/urlencoded body parsing, sanitize)
  → routes/*.js (matches path to a controller)
  → controller (parses req, calls a service, calls res via ApiResponse, or next(error))
  → service (business/use-case logic; the only thing controllers call)
  → repository (the only layer that imports a Mongoose model)
  → MongoDB
```

Errors thrown anywhere in that chain are caught by `asyncHandler` (for async
controllers) and flow to `middlewares/errorHandler.js`, which normalizes them
and writes the standard envelope.

## Controller → Service → Repository

- **Controllers** (`src/controllers/`) only coordinate: read `req`, call
  exactly one service method, and either call `sendSuccess(res, ...)` or
  `next(error)`. No `Model.find(...)` calls here, ever.
- **Services** (`src/services/`) hold business/use-case logic. They call
  repositories, never Mongoose models directly.
- **Repositories** (`src/repositories/`) are the only files allowed to import
  a model from `src/models/`. Every MongoDB query lives here.
- **Models** (`src/models/`) only define Mongoose schemas — no methods beyond
  what Mongoose itself needs, no business logic.
- **Validators** (`src/validators/`) hold express-validator chains, applied
  in routes before the controller runs, via `middlewares/validate.js`.

The health feature (`repositories/health.repository.js` →
`services/health.service.js` → `controllers/health.controller.js`), the
auth/profile feature (`repositories/user.repository.js` →
`services/{auth,user}.service.js` →
`controllers/{auth,profile}.controller.js`), and Products/Customers
(`repositories/{product,customer}.repository.js` →
`services/{product,customer}.service.js` →
`controllers/{product,customer}.controller.js`) are implemented end-to-end.
Every other resource is still a placeholder that returns `501` directly from
`controllers/notImplemented.controller.js`.

## Middleware order (`app.js`)

1. `helmet()` — secure headers
2. `cors()` — restricted to `CLIENT_URL`
3. `requestLogger` (Morgan) — method/URL/status/response-time for every request
4. `rateLimiter` — 429 with the standard envelope once exceeded
5. `compression()`
6. `hpp()` — HTTP parameter pollution protection
7. `express.json()` / `express.urlencoded()` — 1 MB body limit
8. `sanitize` — strips Mongo operator keys (`$…`, dotted paths) and HTML-like
   content from `body`/`query`/`params`
9. Routes (mounted under `/api`)
10. Swagger UI (`/api/docs`)
11. `notFound` — turns any unmatched route into a `404` `ApiError`
12. `errorHandler` — the only place that writes an error response body

Note: `sanitize` mutates `req.query`/`req.params` **in place** rather than
reassigning them, because Express 5 exposes those as read-only getters —
reassigning throws at runtime.

## Response envelope

Every response other than `/api/health` (which has its own flat shape per
spec) uses:

```json
{
  "success": true,
  "message": "...",
  "data": {},
  "errors": [],
  "meta": { "timestamp": "..." }
}
```

Built by `utils/ApiResponse.js` on success and by `middlewares/errorHandler.js`
(via `utils/normalizeError.js`) on failure — no controller builds this shape
by hand.

## Configuration

`src/config/env.js` is the **only** file that reads `process.env`. Every
other config module (`database.js`, `jwt.js`, `swagger.js`, `cloudinary.js`,
`logger.js`) imports `env` from there. Required variables
(`MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`) throw on startup if
missing.

## Database

Mongoose connects with retry-and-backoff (`config/database.js`,
`connectWithRetry`), logs connection/error/disconnected events, and never
crashes the process if MongoDB is unreachable — `/api/health` simply reports
`database: "disconnected"`. `disconnectDatabase()` is awaited during
`SIGINT`/`SIGTERM` shutdown in `server.js`, after the HTTP server stops
accepting new connections.

`HealthLog` proves a real read round-trip to MongoDB (not just `readyState`
introspection) behind `/api/health`. `User` (`src/models/User.js`) is the
first application model — see Authentication below.

## Authentication

Implemented end-to-end: `src/routes/auth.routes.js` mounts 7 real endpoints
(register, login, logout, refresh-token, me, profile, change-password) —
see [API.md](API.md) for request/response shapes.

- **`User` model** (`src/models/User.js`): `password` and `refreshToken` are
  declared `select: false` so a normal `findById`/`findOne` never pulls them
  back; repositories opt in explicitly (`{ includeSecrets: true }`) only
  where needed (login, refresh). A `toJSON` transform strips both fields
  unconditionally as a second layer of defense, and maps `_id` → `id`.
- **`user.repository.js`**: the only file that queries the `User` model.
  `updateProfile` whitelists exactly `['fullName', 'avatar', 'companyName',
  'phone']` so a client can never PATCH `role`, `isActive`, or any other
  field via the profile endpoint.
- **`password.service.js`**: bcrypt hash/verify for the user's actual
  password (12 salt rounds) — appropriate for a low-entropy, human-chosen
  secret.
- **`token.service.js`**: JWT sign/verify for access and refresh tokens.
  Every signed token (access *and* refresh) gets a random `jti` claim
  (`crypto.randomUUID()`) baked in automatically, independent of the
  caller's payload — `iat`/`exp` only carry second-precision, so two tokens
  issued for the same user inside the same wall-clock second would
  otherwise be byte-for-byte identical (same header + payload + secret ⇒
  same signature). The `jti` guarantees uniqueness regardless of timing,
  which matters for refresh-token rotation to be detectable at all.
  Refresh tokens are hashed with SHA-256 + compared with
  `crypto.timingSafeEqual` (`hashRefreshToken`/`compareRefreshToken`) —
  deliberately *not* bcrypt, which truncates its input at 72 bytes. Two JWTs
  for the same user share an identical header + `sub`-claim prefix well
  within that limit, so bcrypt would treat an old, rotated-out refresh
  token as still matching the new stored hash, defeating rotation.
- **`auth.service.js`**: `issueTokenPair` is the single place that signs a
  token pair and persists the refresh token's hash — used by `register`,
  `login`, and `refreshTokens` alike, so rotation logic isn't duplicated.
  `refreshTokens` verifies the incoming JWT, re-fetches the stored hash, and
  compares before rotating; any mismatch (forged, expired, or already
  rotated-out) is a `401`, not a silent no-op.
- **`middlewares/authentication.js`** (`authenticate`) verifies the Bearer
  access token and attaches `req.user` (the decoded JWT payload — `sub`,
  `email`, `role` — not a re-fetched database document). All 7 auth/profile
  endpoints are self-service and require no elevated role, but
  **`middlewares/authorization.js`** (`requireRoles`, `requireMinimumRole`)
  is integrated, unit-tested (`tests/authorization.test.js`), and now also
  exercised for real on the Products/Customers write routes below. Roles
  are `ADMIN > BUSINESS_OWNER > ANALYST > VIEWER` (`src/constants/roles.js`).

## Products and Customers

Both resources are implemented identically end-to-end and documented in
full in [API.md](API.md) — this section covers the shared design decisions
behind them.

- **Models** (`src/models/Product.js`, `src/models/Customer.js`): each has
  an `owner` reference to `User`, an `isActive` soft-delete flag (default
  `true`), and a compound unique index on `owner` + the resource's natural
  key (`name` for Product, `email` for Customer) with a case-insensitive
  collation (`src/utils/mongoCollation.js`) — "Widget" and "widget" collide
  as the same product name for one owner. Product additionally has a
  `status` enum (`draft`/`active`/`archived`) that is a business/workflow
  state, deliberately independent of `isActive` (soft-delete): an archived
  product is still visible to its owner, a soft-deleted one never is.
- **Repositories** whitelist which fields `updateById` can write
  (`ALLOWED_UPDATE_FIELDS`), the same defense-in-depth pattern
  `user.repository.js` uses for profile updates — `owner` and `isActive` can
  never be changed via a PATCH body regardless of what the client sends.
  Duplicate-checking lookups (`findByOwnerAndName`/`findByOwnerAndEmail`)
  pass the same collation as the unique index and accept an `excludeId` so
  a same-owner *case-only* rename doesn't collide with itself.
- **`src/utils/resourceAccess.js`** centralizes the ownership rule used by
  both services: `scopeToOwnerIfNeeded` narrows a BUSINESS_OWNER's list
  query to `owner: <their id>`; every other role lists across all owners.
  `canAccessResource` answers whether a specific document is reachable —
  true for ADMIN/ANALYST/VIEWER unconditionally, true for BUSINESS_OWNER
  only when they own it. Both services throw `NotFoundError` (never
  `AuthorizationError`) when a BUSINESS_OWNER's id doesn't match — a
  `404`, not a `403`, so a caller can never tell the difference between "no
  such record" and "a record I'm not allowed to see," which would otherwise
  leak the existence of another owner's data.
  `requireRoles(ADMIN, BUSINESS_OWNER)` is applied at the route level on
  every write endpoint, so ANALYST/VIEWER are rejected with `403` before
  the controller — let alone the service's ownership check — ever runs.
- **Duplicate detection** happens in the service (a pre-check via the
  repository, mirroring how `auth.service.js` pre-checks email during
  register) and raises `ConflictError` — the unique index is a safety net
  for races, not the primary path.
  `src/utils/stringHelpers.js#escapeRegExp` prevents user-supplied `search`
  text from being interpreted as regex syntax when building the
  case-insensitive `$or` search filter.
  `src/utils/pagination.js` (`parsePagination`/`buildPaginatedResult`)
  is the shared pagination utility — `{ page, limit }` in,
  `{ items, pagination: { page, limit, totalItems, totalPages } }` out —
  used identically by both `listProducts` and `listCustomers`.
- `owner` is populated with a trimmed, non-sensitive projection
  (`fullName email companyName`) on every read and after every
  create/update, via each repository's shared `OWNER_POPULATE_FIELDS`
  constant.

## Uploads

`middlewares/upload.js` configures Multer with local disk storage
(`env.UPLOAD_PATH`), a MIME allow-list, and a size limit. `config/cloudinary.js`
configures the Cloudinary SDK but nothing calls it yet — swapping the storage
engine is a future phase.
