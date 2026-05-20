#!/usr/bin/env node

// One-shot data backfill for the ProductVariants → Products merge (Deploy 1).
//
// Copies every product_variants row's attribute columns + 4 media arrays into
// the matching products row (strict 1:1). Runs entirely inside a single
// transaction: any failed assertion rolls the whole thing back, leaving the
// legacy product_variants tables untouched as the source of truth.
//
// Safety:
//   - Default DRY RUN. Pass --apply to write.
//   - Refuses to --apply against a production-looking DATABASE_URL without an
//     interactive "yes" (or --yes for non-interactive runs you've verified).
//   - Idempotent: new sub-table rows use fresh UUIDs + ON CONFLICT DO NOTHING,
//     and column UPDATE is overwrite-safe. Re-running after a partial failure
//     is safe (wrap-up COMMIT only happens once all assertions pass).
//   - Writes a before/after audit JSON to ~/db-backup/merge-audit-*.json.
//
// Usage:
//   node --env-file=.env.local scripts/mergeVariantsIntoProducts.mjs            # dry-run
//   node --env-file=.env.local scripts/mergeVariantsIntoProducts.mjs --apply    # write (prompts on prod)
//   node --env-file=.env.local scripts/mergeVariantsIntoProducts.mjs --apply --yes

import { getPayload } from "payload";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline";

const apply = process.argv.includes("--apply");
const skipPrompt = process.argv.includes("--yes");

const ARRAY_TABLES = [
  {
    name: "element_images",
    columns: "_order, _parent_id, id, media_ref_id, source_path, public_url, alt_zh, sort_order",
    select:
      "pv._order, v.product_ref_id, gen_random_uuid()::text, pv.media_ref_id, pv.source_path, pv.public_url, pv.alt_zh, pv.sort_order",
  },
  {
    name: "space_images",
    columns: "_order, _parent_id, id, media_ref_id, source_path, public_url, alt_zh, sort_order",
    select:
      "pv._order, v.product_ref_id, gen_random_uuid()::text, pv.media_ref_id, pv.source_path, pv.public_url, pv.alt_zh, pv.sort_order",
  },
  {
    name: "real_images",
    columns: "_order, _parent_id, id, media_ref_id, source_path, public_url, alt_zh, sort_order",
    select:
      "pv._order, v.product_ref_id, gen_random_uuid()::text, pv.media_ref_id, pv.source_path, pv.public_url, pv.alt_zh, pv.sort_order",
  },
  {
    name: "videos",
    columns: "_order, _parent_id, id, media_ref_id, source_path, public_url, poster_url, title_zh, sort_order",
    select:
      "pv._order, v.product_ref_id, gen_random_uuid()::text, pv.media_ref_id, pv.source_path, pv.public_url, pv.poster_url, pv.title_zh, pv.sort_order",
  },
];

function looksLikeProduction(dbUrl) {
  const isLocal = /localhost|127\.0\.0\.1|:5433/.test(dbUrl);
  return !isLocal;
}

async function confirmProduction(dbUrl) {
  const masked = dbUrl.replace(/:\/\/[^@]+@/, "://***@");
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise((resolve) => {
    rl.question(
      `\n⚠️  DATABASE_URL looks like PRODUCTION:\n    ${masked}\n` +
        `Type 'yes' to run the backfill with --apply: `,
      resolve,
    );
  });
  rl.close();
  return answer.trim() === "yes";
}

async function assertZero(pool, label, query) {
  const { rows } = await pool.query(query);
  const n = Number(rows[0]?.n ?? 0);
  if (n !== 0) {
    throw new Error(`Assertion failed [${label}]: expected 0, got ${n}`);
  }
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

  process.on("uncaughtException", (err) => {
    if (err.message?.includes("Connection terminated") || err.code === "ECONNRESET") {
      console.warn("[pool] connection dropped, next query will reconnect");
    } else {
      console.error("Fatal:", err);
      process.exit(1);
    }
  });

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });
  const pool = payload.db?.pool;
  if (!pool) {
    console.error("payload.db.pool unavailable — cannot run raw SQL backfill.");
    process.exit(1);
  }

  // ---- Pre-flight: orphan checks (must all be zero) ----
  await assertZero(
    pool,
    "orphan variants (no matching product)",
    `SELECT COUNT(*)::int AS n FROM product_variants v
     LEFT JOIN products p ON p.id = v.product_ref_id WHERE p.id IS NULL;`,
  );
  for (const t of ARRAY_TABLES) {
    await assertZero(
      pool,
      `orphan ${t.name} (no matching variant)`,
      `SELECT COUNT(*)::int AS n FROM product_variants_${t.name} pv
       LEFT JOIN product_variants v ON pv._parent_id = v.id WHERE v.id IS NULL;`,
    );
  }

  // ---- Snapshot before counts ----
  const beforeQ = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM product_variants)::int AS variants_total,
      (SELECT COUNT(*) FROM product_variants_element_images)::int AS old_element_images,
      (SELECT COUNT(*) FROM product_variants_space_images)::int AS old_space_images,
      (SELECT COUNT(*) FROM product_variants_real_images)::int AS old_real_images,
      (SELECT COUNT(*) FROM product_variants_videos)::int AS old_videos;
  `);
  const before = beforeQ.rows[0];
  console.log("Before:", before);

  if (!apply) {
    console.log("\nDRY RUN — pass --apply to write. Would:");
    console.log(`  • UPDATE ${before.variants_total} products with variant attribute columns`);
    console.log(`  • INSERT ${before.old_element_images} element_images`);
    console.log(`  • INSERT ${before.old_space_images} space_images`);
    console.log(`  • INSERT ${before.old_real_images} real_images`);
    console.log(`  • INSERT ${before.old_videos} videos`);
    process.exit(0);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Attribute columns + productCode (uppercase code).
    await client.query(`
      UPDATE products p SET
        product_code = v.code,
        size = v.size,
        thickness = v.thickness,
        thickness_custom = v.thickness_custom,
        process = v.process,
        color_group = v.color_group,
        face_count = v.face_count,
        face_pattern_note = v.face_pattern_note
      FROM product_variants v
      WHERE v.product_ref_id = p.id;
    `);

    // 2. Four media arrays (fresh UUIDs, conflict-safe).
    for (const t of ARRAY_TABLES) {
      await client.query(`
        INSERT INTO products_${t.name} (${t.columns})
        SELECT ${t.select}
        FROM product_variants_${t.name} pv
        JOIN product_variants v ON pv._parent_id = v.id
        ON CONFLICT (id) DO NOTHING;
      `);
    }

    // 3. Strong assertions inside the transaction.
    const afterQ = await client.query(`
      SELECT
        (SELECT COUNT(*) FROM products WHERE size IS NULL)::int AS products_missing_size,
        (SELECT COUNT(*) FROM products WHERE product_code IS NULL)::int AS products_missing_code,
        (SELECT COUNT(*) FROM products_element_images)::int AS new_element_images,
        (SELECT COUNT(*) FROM products_space_images)::int AS new_space_images,
        (SELECT COUNT(*) FROM products_real_images)::int AS new_real_images,
        (SELECT COUNT(*) FROM products_videos)::int AS new_videos;
    `);
    const after = afterQ.rows[0];

    const checks = [
      [after.products_missing_size === 0, `products_missing_size = ${after.products_missing_size} (expected 0)`],
      [after.products_missing_code === 0, `products_missing_code = ${after.products_missing_code} (expected 0)`],
      [
        after.new_element_images === before.old_element_images,
        `element_images ${after.new_element_images} != ${before.old_element_images}`,
      ],
      [
        after.new_space_images === before.old_space_images,
        `space_images ${after.new_space_images} != ${before.old_space_images}`,
      ],
      [
        after.new_real_images === before.old_real_images,
        `real_images ${after.new_real_images} != ${before.old_real_images}`,
      ],
      [after.new_videos === before.old_videos, `videos ${after.new_videos} != ${before.old_videos}`],
    ];
    for (const [ok, msg] of checks) {
      if (!ok) throw new Error(`Verification failed: ${msg}`);
    }

    // 4. Per-product image-count parity (catches mis-distributed rows even when
    //    totals match). Returns offending product ids; must be empty.
    const mismatch = await client.query(`
      SELECT v.product_ref_id AS pid,
        (SELECT COUNT(*) FROM product_variants_element_images WHERE _parent_id = v.id) AS old_n,
        (SELECT COUNT(*) FROM products_element_images WHERE _parent_id = v.product_ref_id) AS new_n
      FROM product_variants v
      GROUP BY v.id, v.product_ref_id
      HAVING (SELECT COUNT(*) FROM product_variants_element_images WHERE _parent_id = v.id)
           != (SELECT COUNT(*) FROM products_element_images WHERE _parent_id = v.product_ref_id);
    `);
    if (mismatch.rows.length > 0) {
      throw new Error(
        `Per-product element_images mismatch on ${mismatch.rows.length} products, e.g. ${JSON.stringify(mismatch.rows[0])}`,
      );
    }

    await client.query("COMMIT");

    // 5. Audit log.
    const auditDir = path.join(os.homedir(), "db-backup");
    fs.mkdirSync(auditDir, { recursive: true });
    const auditFile = path.join(auditDir, `merge-audit-${Date.now()}.json`);
    fs.writeFileSync(
      auditFile,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          user: process.env.USER ?? "unknown",
          dbUrl: dbUrl.replace(/:\/\/[^@]+@/, "://***@"),
          before,
          after,
        },
        null,
        2,
      ),
    );

    console.log("\n✓ MIGRATION COMPLETE");
    console.log("Before:", before);
    console.log("After:", after);
    console.log("Audit:", auditFile);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("\n✗ MIGRATION FAILED — ROLLED BACK. Legacy tables untouched.");
    console.error(err);
    process.exitCode = 1;
  } finally {
    client.release();
  }

  process.exit(process.exitCode ?? 0);
}

main();
