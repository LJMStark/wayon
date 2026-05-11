import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Removes the standalone Categories collection. The detail-page subtitle now
// reads seriesTypes[0] directly. 76 products carried a category_id; their
// seriesTypes were already populated (confirmed via DB audit) so the only
// information loss is the optional custom subtitle string those 76 products
// had, which was a duplicate of the series concept.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "category_id";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "categories_id";
    DROP TABLE IF EXISTS "categories_locales";
    DROP TABLE IF EXISTS "categories";
  `)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Categories is not recoverable from this migration — the original
  // 20260422_130902 baseline still describes the table shape if someone
  // really needs to rebuild it.
}
