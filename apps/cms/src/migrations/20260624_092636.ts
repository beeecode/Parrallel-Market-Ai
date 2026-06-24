import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({
  db,
  payload: _payload,
  req: _req,
}: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "simulations" ADD COLUMN "conversation_count" numeric DEFAULT 0 NOT NULL;`)
}

export async function down({
  db,
  payload: _payload,
  req: _req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "simulations" DROP COLUMN "conversation_count";`)
}
