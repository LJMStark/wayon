import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  // Pre-flight: fail fast if any existing thickness value is not in the allowed enum set.
  // Cast to text because the column is already an enum type (dev mode pushed the type).
  await db.execute(sql`
    DO $$ DECLARE bad_count integer;
    BEGIN
      SELECT COUNT(*) INTO bad_count
      FROM product_variants
      WHERE thickness IS NOT NULL
        AND thickness::text NOT IN ('3mm', '6mm', '9mm', '12mm', '15mm', 'custom');
      IF bad_count > 0 THEN
        RAISE EXCEPTION
          '迁移中止：product_variants 中有 % 条记录的 thickness 值不在允许范围内。'
          '请先执行：SELECT DISTINCT thickness FROM product_variants '
          'WHERE thickness::text NOT IN (''3mm'',''6mm'',''9mm'',''12mm'',''15mm'',''custom'');',
          bad_count;
      END IF;
    END $$;
  `)

  // The enum type and column already exist (applied by dev mode push).
  // Only add the display column for custom thickness values.
  // ALTER TYPE ADD VALUE 'custom' is kept in 20260511_090000 (outside transaction).
  await db.execute(sql`
    SET lock_timeout = '5s';
    ALTER TABLE "product_variants"
      ADD COLUMN IF NOT EXISTS "thickness_custom" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "product_variants"
      DROP COLUMN IF EXISTS "thickness_custom";

    ALTER TABLE "product_variants"
      ALTER COLUMN "thickness" TYPE varchar
      USING (
        CASE
          WHEN "thickness" IS NULL THEN NULL
          ELSE "thickness"::text
        END
      );

    DROP TYPE IF EXISTS "public"."enum_product_variants_thickness";
  `)
}
