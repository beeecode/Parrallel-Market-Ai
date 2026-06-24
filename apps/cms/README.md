# Parallel Market AI CMS

Payload CMS foundation for the Parallel Market AI monorepo.

This Phase 1 app is intentionally minimal:

- Payload admin and REST/GraphQL route foundation
- PostgreSQL adapter configuration
- Lexical editor configuration
- Auth-enabled `Users` collection only

Additional application collections, access rules, seed data, and API integration will be added in later phases.

## Local Development

Copy the root `.env.example` values into a local environment file and provide a real local PostgreSQL database URL before starting the CMS.

```bash
yarn workspace @parallel-market-ai/cms dev
```

Default local port: `3001`.
