#!/usr/bin/env node

// One-shot backfill: every product with a normalizedName (i.e. imported from
// the trade catalog) is set to published = true, matching the exposure gate in
// src/data/products.ts. Manually authored products without a normalizedName
// are intentionally left alone — they stay unpublished until an editor flips
// the toggle in the admin panel.
//
// Idempotent: re-running only patches documents that still need it.
//
// Usage:
//   node scripts/backfillProductPublished.mjs              # apply
//   node scripts/backfillProductPublished.mjs --dry-run    # report only

import { getPayload } from "payload";

const dryRun = process.argv.includes("--dry-run");

async function main() {
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

  if (payload.db?.pool) {
    payload.db.pool.on("error", (err) => {
      if (err.message?.includes("Connection terminated") || err.code === "ECONNRESET") {
        console.warn("[pool] connection dropped, next query will reconnect");
      } else {
        console.error("[pool error]", err.message);
      }
    });
  }

  const { docs: targets } = await payload.find({
    collection: "products",
    where: {
      and: [
        { normalizedName: { exists: true } },
        { normalizedName: { not_equals: "" } },
        { published: { not_equals: true } },
      ],
    },
    limit: 5000,
    depth: 0,
    overrideAccess: true,
  });

  console.log(
    `Found ${targets.length} imported product(s) without published=true.`
  );

  if (targets.length === 0) {
    console.log("Nothing to do.");
    process.exit(0);
  }

  if (dryRun) {
    for (const doc of targets.slice(0, 10)) {
      console.log(`  [dry-run] would patch ${doc.id} (${doc.normalizedName})`);
    }
    if (targets.length > 10) {
      console.log(`  ...and ${targets.length - 10} more`);
    }
    process.exit(0);
  }

  let patched = 0;

  for (const doc of targets) {
    await payload.update({
      collection: "products",
      id: doc.id,
      data: { published: true },
      overrideAccess: true,
    });
    patched += 1;
    if (patched % 25 === 0 || patched === targets.length) {
      console.log(`  patched ${patched}/${targets.length}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
