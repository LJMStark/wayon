import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Drops three legacy product columns (thickness, finish, size) that were
// superseded by the product_variants collection. DB audit confirmed all three
// columns hold zero non-null values across 452 product rows, so no data is
// being lost. The `finish` column was a select, so its enum type is dropped
// alongside the column.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "thickness";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "finish";
    ALTER TABLE "products" DROP COLUMN IF EXISTS "size";
    DROP TYPE IF EXISTS "public"."enum_products_finish";
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_products_finish" AS ENUM ('polished', 'honed', 'leathered', 'brushed', 'sandblasted');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "thickness" varchar;
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "finish" "public"."enum_products_finish";
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "size" varchar;
  `)
}
