/**
 * One-shot: rewrite the legacy R2 Public Development host to the custom media
 * domain across every column that stores an absolute media URL.
 *
 * Context (2026-09-02): media used to be served from R2's Public Development
 * URL (`pub-*.r2.dev`), which Cloudflare documents as rate-limited, uncacheable
 * and not for production — and which is DNS-blocked by ISPs in Turkey, South
 * Korea and mainland China. The bucket now has a custom domain. Code and env
 * vars were switched in commit 1ef04a4; this script finishes the job in
 * Postgres.
 *
 * Why raw SQL instead of `getPayload()` (the usual convention in this folder):
 *   - `media.url` and `media.sizes_*_url` are produced by s3Storage's
 *     `generateFileURL` on read. There is no Payload write path for them.
 *   - This is a pure host swap with no business logic, across ~22.7k rows.
 *     Going row-by-row through Payload would fire every collection hook for no
 *     benefit and take orders of magnitude longer.
 *   - Precedent: scripts/fillDescriptionsSQL.mjs does the same for the same
 *     reasons.
 *
 * Only `products.cover_image_url` actually changes what the site renders — rows
 * carrying a `media` relation already resolve through `generateFileURL`. The
 * rest are cleaned up so the legacy host disappears entirely, which is the
 * retirement condition for LEGACY_R2_ORIGIN in next.config.ts.
 *
 * Idempotent: matches only rows still containing the source host, so re-running
 * is a no-op.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrateMediaDomain.mjs             # dry run
 *   node --env-file=.env.local scripts/migrateMediaDomain.mjs --apply     # write
 *   node --env-file=.env.local scripts/migrateMediaDomain.mjs --rollback --apply
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const LEGACY_HOST = "pub-56e13f04b3fa43f6bf63a8e037e2e643.r2.dev";
const CUSTOM_HOST = "cdn.zylsinteredstone.com";

/** Every column holding an absolute media URL. Keep in sync with the schema. */
const TARGETS = [
  ["media", "url"],
  ["media", "sizes_card_url"],
  ["media", "sizes_feature_url"],
  ["media", "sizes_thumbnail_url"],
  ["products", "cover_image_url"],
  ["products", "cover_video_poster_url"],
  ["products_element_images", "public_url"],
  ["products_real_images", "public_url"],
  ["products_space_images", "public_url"],
  ["products_videos", "public_url"],
  ["products_videos", "poster_url"],
];

const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

const apply = process.argv.includes("--apply");
const rollback = process.argv.includes("--rollback");

const fromHost = rollback ? CUSTOM_HOST : LEGACY_HOST;
const toHost = rollback ? LEGACY_HOST : CUSTOM_HOST;

function assertSafeIdentifiers() {
  for (const [table, column] of TARGETS) {
    if (!IDENTIFIER.test(table) || !IDENTIFIER.test(column)) {
      throw new Error(`Unsafe identifier in TARGETS: ${table}.${column}`);
    }
  }
}

async function countMatches(client, table, column, host) {
  const { rows } = await client.query(
    `SELECT count(*)::int AS n FROM ${table} WHERE ${column} LIKE $1`,
    [`%${host}%`]
  );
  return rows[0].n;
}

async function sampleMatches(client, table, column, host, limit = 2) {
  const { rows } = await client.query(
    `SELECT id, ${column} AS value FROM ${table} WHERE ${column} LIKE $1 LIMIT ${limit}`,
    [`%${host}%`]
  );
  return rows;
}

async function backupMatches(client) {
  const entries = [];
  for (const [table, column] of TARGETS) {
    const { rows } = await client.query(
      `SELECT id, ${column} AS value FROM ${table} WHERE ${column} LIKE $1`,
      [`%${fromHost}%`]
    );
    for (const row of rows) {
      entries.push({ table, column, id: row.id, value: row.value });
    }
  }
  return entries;
}

async function main() {
  assertSafeIdentifiers();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing environment variable: DATABASE_URL");
  }

  const client = new pg.Client({ connectionString });
  await client.connect();

  console.log(`\nRewrite  ${fromHost}`);
  console.log(`     ->  ${toHost}`);
  console.log(`Mode:    ${apply ? "APPLY (writes)" : "DRY RUN (no writes)"}`);
  if (rollback) console.log("Direction: ROLLBACK\n");
  else console.log("");

  let total = 0;
  const plan = [];
  for (const [table, column] of TARGETS) {
    const n = await countMatches(client, table, column, fromHost);
    total += n;
    plan.push({ table, column, n });
    console.log(`${`${table}.${column}`.padEnd(38)}${String(n).padStart(6)}`);
  }
  console.log(`${"".padEnd(38, "-")}------`);
  console.log(`${"total".padEnd(38)}${String(total).padStart(6)}\n`);

  if (total === 0) {
    console.log("Nothing to do — already migrated.");
    await client.end();
    return;
  }

  for (const { table, column, n } of plan) {
    if (n === 0) continue;
    const samples = await sampleMatches(client, table, column, fromHost);
    console.log(`sample ${table}.${column}:`);
    for (const s of samples) {
      console.log(`  - ${s.value}`);
      console.log(`  + ${s.value.split(fromHost).join(toHost)}`);
    }
  }

  if (!apply) {
    console.log("\nDry run complete. Re-run with --apply to write.");
    await client.end();
    return;
  }

  const backupDir = path.join(process.cwd(), ".tmp");
  await mkdir(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupDir, `media-domain-${stamp}.json`);

  console.log("\nBacking up affected rows...");
  const backup = await backupMatches(client);
  await writeFile(
    backupPath,
    JSON.stringify({ fromHost, toHost, rows: backup }, null, 2)
  );
  console.log(`Wrote ${backup.length} rows to ${backupPath}`);

  console.log("\nApplying inside a transaction...");
  let updated = 0;
  try {
    await client.query("BEGIN");
    for (const [table, column] of TARGETS) {
      const res = await client.query(
        `UPDATE ${table}
            SET ${column} = replace(${column}, $1, $2)
          WHERE ${column} LIKE $3`,
        [fromHost, toHost, `%${fromHost}%`]
      );
      if (res.rowCount > 0) {
        console.log(`  ${`${table}.${column}`.padEnd(38)}${String(res.rowCount).padStart(6)}`);
      }
      updated += res.rowCount;
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("\nTransaction rolled back. No rows changed.");
    throw error;
  }

  console.log(`\nUpdated ${updated} rows.`);

  let remaining = 0;
  for (const [table, column] of TARGETS) {
    remaining += await countMatches(client, table, column, fromHost);
  }
  console.log(`Remaining rows still on ${fromHost}: ${remaining}`);
  if (remaining !== 0) {
    throw new Error("Verification failed: source host still present after update");
  }

  await client.end();
  console.log("\nDone.");
}

main().catch((error) => {
  console.error(`\nERROR: ${error.message}`);
  process.exit(1);
});
