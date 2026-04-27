import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_media_category" AS ENUM('product', 'license', 'showroom', 'factory', 'case-sales', 'case-factory', 'other');

    ALTER TABLE "media" ADD COLUMN "category" "public"."enum_media_category";

    UPDATE "media" SET "category" = 'product' WHERE "category" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "media" DROP COLUMN IF EXISTS "category";
    DROP TYPE IF EXISTS "public"."enum_media_category";
  `)
}
