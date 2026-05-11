import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// ALTER TYPE ... ADD VALUE cannot run inside a transaction on Postgres < 15.
// This migration is intentionally kept separate so Payload runs it as its own unit.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`ALTER TYPE "public"."enum_products_series_types" ADD VALUE IF NOT EXISTS '新品系列';`)
  await db.execute(sql`ALTER TYPE "public"."enum_products_series_types" ADD VALUE IF NOT EXISTS '特惠系列';`)
  await db.execute(sql`ALTER TYPE "public"."enum_product_variants_thickness" ADD VALUE IF NOT EXISTS 'custom';`)
}

export async function down(_args: MigrateDownArgs): Promise<void> {
  // Postgres does not support removing enum values. No-op.
}
