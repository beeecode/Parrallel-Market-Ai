import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { collections, Users } from './collections'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const isProduction = process.env.NODE_ENV === 'production'

const parseCorsOrigins = (value: string | undefined): string[] =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

const requireEnvironmentValue = (name: string): string => {
  const value = process.env[name]

  if (isProduction && !value) {
    throw new Error(`${name} is required in production.`)
  }

  return value ?? ''
}

const allowedOrigins = parseCorsOrigins(process.env.CORS_ORIGINS)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections,
  cookiePrefix: 'parallel-market-ai',
  cors: allowedOrigins,
  csrf: allowedOrigins,
  defaultDepth: 1,
  defaultMaxTextLength: 4_000,
  editor: lexicalEditor(),
  endpoints: [
    {
      path: '/health',
      method: 'get',
      handler: () =>
        Response.json({
          service: 'parallel-market-ai-cms',
          status: 'ok',
        }),
    },
  ],
  maxDepth: 4,
  secret: requireEnvironmentValue('PAYLOAD_SECRET'),
  serverURL: process.env.CMS_SERVER_URL,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: requireEnvironmentValue('DATABASE_URL'),
    },
    push: false,
  }),
  sharp,
  plugins: [],
})
