# Parallel Market AI Web

SvelteKit frontend for the Parallel Market AI product application.

## Local Development

Run from the repository root:

```bash
corepack yarn dev:web
```

Default local URL: `http://localhost:5173`.

For real Payload-backed development, start the CMS first and set private frontend environment values in an ignored local env file:

```env
CMS_API_URL=http://localhost:3001
SESSION_COOKIE_NAME=parallel_market_session
SESSION_COOKIE_SECURE=false
FRONTEND_MOCK_MODE=false
```

`CMS_API_URL` and session values are server-only. Do not expose Payload tokens or private CMS credentials to browser code.

## Production Target

The web app selects `@sveltejs/adapter-vercel` when Vercel sets `VERCEL=1`. Local non-Vercel builds use `@sveltejs/adapter-node` so Windows development machines can run production checks without administrator symlink privileges.

Recommended Vercel settings from the monorepo root:

```txt
Install command: corepack yarn install --immutable
Build command: corepack yarn build:web
Development command: corepack yarn dev:web
```

Production environment values:

```env
CMS_API_URL=https://your-cms-host.example
PUBLIC_CMS_URL=https://your-cms-host.example
SESSION_COOKIE_NAME=parallel_market_session
SESSION_COOKIE_SECURE=true
FRONTEND_MOCK_MODE=false
```

To test Vercel packaging locally, use a symlink-capable environment:

```bash
VERCEL=1 corepack yarn build:web
```

## Public And Authenticated Routes

`/` is a static public landing page with its own marketing navigation. It uses local typed content,
Lucide icons, local demo avatars, and in-code product previews, and it makes no Payload requests.

`/dashboard` and the remaining product routes are authenticated and continue to use the application
sidebar and mobile drawer. `/request-simulation` remains protected, so the public landing CTA routes
unauthenticated visitors through login before they can submit a request.

Landing interactions include product showcase tabs, an FAQ accordion, a sample persona
conversation, anchor navigation, and a native mobile popover menu. Reduced-motion preferences are
respected by the global stylesheet.

## Checks

```bash
corepack yarn lint:web
corepack yarn typecheck:web
corepack yarn build:web
corepack yarn test:web
corepack yarn test:e2e:web
```
