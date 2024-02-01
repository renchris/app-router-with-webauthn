import { type InferSelectModel, type InferInsertModel, relations } from 'drizzle-orm'
import {
  sqliteTable, text, integer, blob,
} from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: integer('id').primaryKey().notNull(),
  email: text('email').unique().notNull(),
  username: text('username').unique().notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),
})

export type User = InferSelectModel<typeof user>
export type InsertUser = InferInsertModel<typeof user>

export const credential = sqliteTable('credential', {
  id: integer('id').primaryKey().notNull(),
  userID: integer('user_id').notNull(),
  name: text('name'),
  externalID: text('external_id').unique().notNull(),
  publicKey: blob('public_key', { mode: 'buffer' }).unique().notNull(),
  signCount: integer('sign_count').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull(),

})

export type Credential = InferSelectModel<typeof credential>
export type InsertCredential = InferInsertModel<typeof credential>
