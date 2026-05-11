import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Drops the `featured` column on products. The field had a "首页推荐" checkbox
// in admin and a getFeaturedProducts() helper, but no consumer ever called
// the helper — the homepage is 100% static (src/features/home renders from
// /public/assets only) so the flag was a dead UI element.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "featured";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false;
  `)
}
