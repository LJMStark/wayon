#!/usr/bin/env node

// One-shot backfill: every product with a normalizedName (i.e. imported from
// the trade catalog) is set to published = true, matching the new exposure
// gate in src/sanity/lib/queries.ts. Manually authored products without a
// normalizedName are intentionally left alone — they will stay unpublished
// until an editor flips the toggle in Studio.
//
// Idempotent: re-running only patches documents that still need it.
//
// Usage:
//   node scripts/backfillProductPublished.mjs              # apply
//   node scripts/backfillProductPublished.mjs --dry-run    # report only

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
// API version mirrors src/sanity/env.ts (which defaults when not set in env).
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

const QUERY = `*[_type == "product" && defined(normalizedName) && published != true]{ _id, normalizedName }`;

async function main() {
  const targets = await client.fetch(QUERY);

  console.log(
    `Found ${targets.length} imported product(s) without published=true.`
  );

  if (targets.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (dryRun) {
    for (const doc of targets.slice(0, 10)) {
      console.log(`  [dry-run] would patch ${doc._id} (${doc.normalizedName})`);
    }
    if (targets.length > 10) {
      console.log(`  ...and ${targets.length - 10} more`);
    }
    return;
  }

  const BATCH = 100;
  let patched = 0;

  for (let i = 0; i < targets.length; i += BATCH) {
    const chunk = targets.slice(i, i + BATCH);
    const tx = client.transaction();
    for (const doc of chunk) {
      tx.patch(doc._id, (p) => p.set({ published: true }));
    }
    await tx.commit({ visibility: "async" });
    patched += chunk.length;
    console.log(`  patched ${patched}/${targets.length}`);
  }

  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
