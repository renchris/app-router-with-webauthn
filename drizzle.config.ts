import type { Config } from 'drizzle-kit'

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  // drizzle-kit 0.31 replaced the per-driver `driver` key with `dialect`; the
  // remaining `driver` values are the HTTP-proxy drivers only (d1-http, aws-data-api,
  // pglite), so `better-sqlite` no longer type-checks. The local better-sqlite3
  // connection is now expressed as dialect + a `url` credential.
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db',
  },
} satisfies Config
