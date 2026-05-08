import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Adds a `translation_meta` JSONB column to news and products. The column is
// admin-only metadata that records which localized fields were filled by the
// in-admin "Translate from Chinese" tool, so we can render an "AI translated"
// badge in the editor and clear it when an operator manually rewrites the
// field. The public frontend does not read this column.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "news" ADD COLUMN IF NOT EXISTS "translation_meta" jsonb;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "translation_meta" jsonb;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "news" DROP COLUMN IF EXISTS "translation_meta";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "translation_meta";
  `)
}
