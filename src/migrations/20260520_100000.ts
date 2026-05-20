import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Deploy 1 of the ProductVariants → Products merge (expand step).
// Adds variant attribute columns + 4 media array sub-tables to `products`,
// reusing the existing enum types created for product_variants. The legacy
// product_variants tables are left untouched here; data is backfilled by
// scripts/mergeVariantsIntoProducts.mjs and the old tables are dropped in the
// Deploy 2 contract migration. This migration is additive and reversible.

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`SET lock_timeout = '10s';`)
  await db.execute(sql`SET statement_timeout = '60s';`)

  // Pre-flight: the four enum types must already exist (created for
  // product_variants). Fail fast with a clear message if any is missing,
  // rather than erroring deep inside an ALTER TABLE.
  await db.execute(sql`
    DO $$
    DECLARE missing text;
    BEGIN
      SELECT string_agg(t, ', ') INTO missing
      FROM (
        SELECT unnest(ARRAY[
          'enum_product_variants_size',
          'enum_product_variants_thickness',
          'enum_product_variants_process',
          'enum_product_variants_color_group'
        ]) AS t
      ) wanted
      WHERE NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = wanted.t
      );
      IF missing IS NOT NULL THEN
        RAISE EXCEPTION '迁移中止：缺少枚举类型 %。请确认 product_variants 表及其枚举存在于当前数据库。', missing;
      END IF;
    END $$;
  `)

  // 1. Add variant attribute columns to products (all nullable during the
  //    backfill window; Deploy 2 sets size / product_code / process NOT NULL).
  await db.execute(sql`
    ALTER TABLE "products"
      ADD COLUMN IF NOT EXISTS "product_code" varchar,
      ADD COLUMN IF NOT EXISTS "size" "enum_product_variants_size",
      ADD COLUMN IF NOT EXISTS "thickness" "enum_product_variants_thickness",
      ADD COLUMN IF NOT EXISTS "thickness_custom" varchar,
      ADD COLUMN IF NOT EXISTS "process" "enum_product_variants_process",
      ADD COLUMN IF NOT EXISTS "color_group" "enum_product_variants_color_group",
      ADD COLUMN IF NOT EXISTS "face_count" varchar,
      ADD COLUMN IF NOT EXISTS "face_pattern_note" varchar;
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_product_code_idx" ON "products" USING btree ("product_code");
  `)

  // 2. Four media array sub-tables, mirroring product_variants_* exactly.
  //    source_path / public_url are nullable here (defensive: the legacy
  //    tables were declared NOT NULL but Payload API writes may have left
  //    nulls, which would otherwise block the backfill INSERT).
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_element_images" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "media_ref_id" uuid,
      "source_path" varchar,
      "public_url" varchar,
      "alt_zh" varchar,
      "sort_order" numeric DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS "products_element_images_order_idx" ON "products_element_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_element_images_parent_id_idx" ON "products_element_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_element_images_media_ref_id_idx" ON "products_element_images" USING btree ("media_ref_id");
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_space_images" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "media_ref_id" uuid,
      "source_path" varchar,
      "public_url" varchar,
      "alt_zh" varchar,
      "sort_order" numeric DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS "products_space_images_order_idx" ON "products_space_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_space_images_parent_id_idx" ON "products_space_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_space_images_media_ref_id_idx" ON "products_space_images" USING btree ("media_ref_id");
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_real_images" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "media_ref_id" uuid,
      "source_path" varchar,
      "public_url" varchar,
      "alt_zh" varchar,
      "sort_order" numeric DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS "products_real_images_order_idx" ON "products_real_images" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_real_images_parent_id_idx" ON "products_real_images" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_real_images_media_ref_id_idx" ON "products_real_images" USING btree ("media_ref_id");
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_videos" (
      "_order" integer NOT NULL,
      "_parent_id" uuid NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "media_ref_id" uuid,
      "source_path" varchar,
      "public_url" varchar,
      "poster_url" varchar,
      "title_zh" varchar,
      "sort_order" numeric DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS "products_videos_order_idx" ON "products_videos" USING btree ("_order");
    CREATE INDEX IF NOT EXISTS "products_videos_parent_id_idx" ON "products_videos" USING btree ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_videos_media_ref_id_idx" ON "products_videos" USING btree ("media_ref_id");
  `)

  // 3. Foreign keys. Wrapped in DO $$ EXCEPTION blocks for PG14/15
  //    compatibility (ADD CONSTRAINT IF NOT EXISTS is PG16+ only).
  const addForeignKeys = [
    'products_element_images',
    'products_space_images',
    'products_real_images',
    'products_videos',
  ]
  for (const table of addForeignKeys) {
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE ${sql.raw(`"${table}"`)}
          ADD CONSTRAINT ${sql.raw(`"${table}_parent_id_fk"`)}
          FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id")
          ON DELETE cascade ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `)
    await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE ${sql.raw(`"${table}"`)}
          ADD CONSTRAINT ${sql.raw(`"${table}_media_ref_id_fk"`)}
          FOREIGN KEY ("media_ref_id") REFERENCES "public"."media"("id")
          ON DELETE set null ON UPDATE no action;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Reversible only before the backfill runs. After
  // mergeVariantsIntoProducts.mjs has populated these columns/tables, running
  // this down() discards the merged data — restore from the backup snapshot
  // instead (see merge plan, A.1).
  await db.execute(sql`
    DROP TABLE IF EXISTS "products_element_images" CASCADE;
    DROP TABLE IF EXISTS "products_space_images" CASCADE;
    DROP TABLE IF EXISTS "products_real_images" CASCADE;
    DROP TABLE IF EXISTS "products_videos" CASCADE;
  `)
  await db.execute(sql`
    DROP INDEX IF EXISTS "products_product_code_idx";
    ALTER TABLE "products"
      DROP COLUMN IF EXISTS "product_code",
      DROP COLUMN IF EXISTS "size",
      DROP COLUMN IF EXISTS "thickness",
      DROP COLUMN IF EXISTS "thickness_custom",
      DROP COLUMN IF EXISTS "process",
      DROP COLUMN IF EXISTS "color_group",
      DROP COLUMN IF EXISTS "face_count",
      DROP COLUMN IF EXISTS "face_pattern_note";
  `)
}
