#!/usr/bin/env node

// One-shot backfill: find all products that have at least one variant with a
// texture-indicating process (数码模具面, 火烧面, 精雕, 复刻釉, 定位彩晶) and
// add "质感岩板" to their seriesTypes if it isn't already there.
//
// Products can belong to multiple series simultaneously, so this never removes
// existing seriesTypes — it only appends.
//
// Idempotent: products that already have "质感岩板" are skipped.
//
// Usage:
//   node --env-file=.env.local scripts/backfillTextureSeriesType.mjs            # dry-run
//   node --env-file=.env.local scripts/backfillTextureSeriesType.mjs --apply    # write

import { getPayload } from "payload";

const TEXTURE_PROCESSES = [
  "数码模具面",
  "火烧面",
  "精雕",
  "复刻釉",
  "定位彩晶",
];

const apply = process.argv.includes("--apply");

async function main() {
  process.on("uncaughtException", (err) => {
    if (
      err.message?.includes("Connection terminated") ||
      err.code === "ECONNRESET"
    ) {
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
      if (
        err.message?.includes("Connection terminated") ||
        err.code === "ECONNRESET"
      ) {
        console.warn("[pool] connection dropped, next query will reconnect");
      } else {
        console.error("[pool error]", err.message);
      }
    });
  }

  // Step 1: find all variants with a texture process
  const { docs: variants } = await payload.find({
    collection: "productVariants",
    where: { process: { in: TEXTURE_PROCESSES } },
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  });

  console.log(
    `Found ${variants.length} variant(s) with a texture process across the catalog.`
  );

  // Step 2: collect unique product IDs
  const productIds = [
    ...new Set(
      variants
        .map((v) => (typeof v.productRef === "string" ? v.productRef : v.productRef?.id))
        .filter(Boolean)
    ),
  ];

  console.log(`Unique parent products: ${productIds.length}`);

  // Step 3: load those products and find which ones are missing "质感岩板"
  const { docs: products } = await payload.find({
    collection: "products",
    where: { id: { in: productIds } },
    limit: productIds.length,
    depth: 0,
    overrideAccess: true,
  });

  const toUpdate = products.filter(
    (p) => !(p.seriesTypes ?? []).includes("质感岩板")
  );

  console.log(
    `Products already tagged "质感岩板": ${products.length - toUpdate.length}`
  );
  console.log(`Products to patch: ${toUpdate.length}`);

  if (toUpdate.length === 0) {
    console.log("Nothing to do.");
    process.exit(0);
  }

  if (!apply) {
    console.log('\nDry-run — pass --apply to write. Preview (up to 20):');
    for (const p of toUpdate.slice(0, 20)) {
      const current = (p.seriesTypes ?? []).join(", ") || "(none)";
      console.log(`  ${p.id}  "${p.title}"  current: [${current}]`);
    }
    if (toUpdate.length > 20) {
      console.log(`  ...and ${toUpdate.length - 20} more`);
    }
    process.exit(0);
  }

  // Step 4: patch each product — append "质感岩板", keep existing series
  let patched = 0;

  for (const p of toUpdate) {
    const updated = [...(p.seriesTypes ?? []), "质感岩板"];
    await payload.update({
      collection: "products",
      id: p.id,
      data: { seriesTypes: updated },
      overrideAccess: true,
    });
    patched += 1;
    if (patched % 25 === 0 || patched === toUpdate.length) {
      console.log(`  patched ${patched}/${toUpdate.length}`);
    }
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
