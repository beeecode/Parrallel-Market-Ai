import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload: _payload, req: _req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "messages" ADD COLUMN "client_submission_id" varchar;
  CREATE UNIQUE INDEX "messages_client_submission_id_idx" ON "messages" USING btree ("client_submission_id");`)
}

export async function down({ db, payload: _payload, req: _req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "messages_client_submission_id_idx";
  ALTER TABLE "messages" DROP COLUMN "client_submission_id";`)
}
