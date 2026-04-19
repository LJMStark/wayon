#!/usr/bin/env node

// One-shot cleanup: every productVariant document has its `videos` array
// rewritten to drop entries whose `sourcePath` falls outside the active
// catalog prefix (产品/众岩联标准素材集合/). Legacy trade imports stored
// video sourcePaths under 视频/众岩联--实物视频/... — those files now live
// under docs/外贸出口资料/_removed/ and their publicUrls 404 through the
// trade-media route. Once this script runs, the render-time filter in
// src/features/products/model/product-detail.ts is no longer needed.
//
// Idempotent: re-running only touches variants that still contain at least
// one stale entry.
//
// Usage:
//   node scripts/pruneStaleVariantVideos.mjs              # apply
//   node scripts/pruneStaleVariantVideos.mjs --dry-run    # report only

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ACTIVE_CATALOG_PATH_PREFIX = "产品/众岩联标准素材集合/";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-04-03";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset || !token) {
  console.error(
    "Missing Sanity environment variables. Required: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN"
  );
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

// Fetch every variant whose videos array contains at least one stale entry.
// The `count(...[...stale...]) > 0` check keeps already-clean variants out of
// the result set so the script is cheap to re-run.
const QUERY = `*[_type == "productVariant" && count(videos[!(sourcePath match $prefix + "*")]) > 0]{
  _id,
  code,
  videos
}`;

function isActive(sourcePath) {
  return (
    typeof sourcePath === "string" &&
    sourcePath.startsWith(ACTIVE_CATALOG_PATH_PREFIX)
  );
}

async function main() {
  const targets = await client.fetch(QUERY, {
    prefix: ACTIVE_CATALOG_PATH_PREFIX,
  });

  console.log(
    `Found ${targets.length} variant(s) with stale video entries.`
  );

  if (targets.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  let staleCount = 0;
  let keepCount = 0;
  const plans = targets.map((variant) => {
    const kept = (variant.videos ?? []).filter((v) => isActive(v.sourcePath));
    const dropped = (variant.videos ?? []).length - kept.length;
    staleCount += dropped;
    keepCount += kept.length;
    return { id: variant._id, code: variant.code, kept, dropped };
  });

  console.log(
    `  total videos dropped: ${staleCount}, kept: ${keepCount}`
  );

  if (dryRun) {
    for (const plan of plans.slice(0, 10)) {
      console.log(
        `  [dry-run] ${plan.id} (${plan.code}): drop ${plan.dropped}, keep ${plan.kept.length}`
      );
    }
    if (plans.length > 10) {
      console.log(`  ...and ${plans.length - 10} more`);
    }
    return;
  }

  const BATCH = 100;
  let patched = 0;

  for (let i = 0; i < plans.length; i += BATCH) {
    const chunk = plans.slice(i, i + BATCH);
    const tx = client.transaction();
    for (const plan of chunk) {
      tx.patch(plan.id, (p) => p.set({ videos: plan.kept }));
    }
    await tx.commit({ visibility: "async" });
    patched += chunk.length;
    console.log(`  patched ${patched}/${plans.length}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
