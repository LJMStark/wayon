#!/usr/bin/env node

// Rollback companion to mergeVariantsIntoProducts.mjs. Clears the backfilled
// data from products (attribute columns + 4 media sub-tables) WITHOUT touching
// the legacy product_variants tables, which remain the source of truth during
// Deploy 1. Use this if the backfill produced bad data and you want to retry
// from a clean slate (before dropping old tables in Deploy 2).
//
// This does NOT drop the columns/tables themselves (that's the migration's
// down()); it only empties them so the backfill can be re-run.
//
// Usage:
//   node --env-file=.env.local scripts/rollbackMergedFields.mjs            # dry-run
//   node --env-file=.env.local scripts/rollbackMergedFields.mjs --apply    # write (prompts on prod)
//   node --env-file=.env.local scripts/rollbackMergedFields.mjs --apply --yes

import { getPayload } from "payload";
import readline from "node:readline";

const apply = process.argv.includes("--apply");
const skipPrompt = process.argv.includes("--yes");

function looksLikeProduction(dbUrl) {
  return !/localhost|127\.0\.0\.1|:5433/.test(dbUrl);
}

async function confirmProduction(dbUrl) {
  const masked = dbUrl.replace(/:\/\/[^@]+@/, "://***@");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(
      `\n⚠️  DATABASE_URL looks like PRODUCTION:\n    ${masked}\n` +
        `Type 'yes' to CLEAR backfilled product fields with --apply: `,
      resolve,
    );
  });
  rl.close();
  return answer.trim() === "yes";
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || "";
  if (!dbUrl) {
    console.error("DATABASE_URL not set. Run with --env-file=.env.local");
    process.exit(1);
  }

  if (apply && looksLikeProduction(dbUrl) && !skipPrompt) {
    const ok = await confirmProduction(dbUrl);
    if (!ok) {
      console.log("Aborted — confirmation not given.");
      process.exit(1);
    }
  }

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });
  const pool = payload.db?.pool;
  if (!pool) {
    console.error("payload.db.pool unavailable.");
    process.exit(1);
  }

  const beforeQ = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE size IS NOT NULL)::int AS products_with_size,
      (SELECT COUNT(*) FROM products_element_images)::int AS element_images,
      (SELECT COUNT(*) FROM products_space_images)::int AS space_images,
      (SELECT COUNT(*) FROM products_real_images)::int AS real_images,
      (SELECT COUNT(*) FROM products_videos)::int AS videos;
  `);
  console.log("Current backfilled state:", beforeQ.rows[0]);

  if (!apply) {
    console.log("\nDRY RUN — pass --apply to clear the above. Legacy product_variants untouched.");
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`TRUNCATE products_element_images, products_space_images, products_real_images, products_videos;`);
    await client.query(`
      UPDATE products SET
        product_code = NULL,
        size = NULL,
        thickness = NULL,
        thickness_custom = NULL,
        process = NULL,
        color_group = NULL,
        face_count = NULL,
        face_pattern_note = NULL;
    `);
    await client.query("COMMIT");
    console.log("\n✓ ROLLBACK COMPLETE — product self-fields cleared. Re-run merge to retry.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n✗ ROLLBACK FAILED — transaction reverted.");
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }

  process.exit(process.exitCode ?? 0);
}

main();
