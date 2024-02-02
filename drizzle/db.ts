import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from 'drizzle/schema'

const sqlite = new Database('sqlite.db')
const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, { schema })

export default db
