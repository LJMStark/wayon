#!/usr/bin/env node
// One-shot: upload tmp/about-videos-compressed/about-*.mp4 to Payload media (R2).
//
// Usage:
//   node --env-file=.env.local scripts/uploadAboutVideos.mjs            # dry-run
//   node --env-file=.env.local scripts/uploadAboutVideos.mjs --apply    # execute

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";

const DRY_RUN = !process.argv.includes("--apply");

const SOURCE_DIR = path.join(process.cwd(), "tmp/about-videos-compressed");

const FILES = [
  { name: "about-pavilion-entrance.mp4", category: "showroom" },
  { name: "about-warehouse.mp4", category: "factory" },
  { name: "about-showroom-interior.mp4", category: "showroom" },
  { name: "about-factory-production.mp4", category: "factory" },
  { name: "about-service-team.mp4", category: "other" },
];

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY-RUN" : "APPLY"}\n`);

  let payload = null;
  if (!DRY_RUN) {
    const config = (await import("../src/payload.config.ts")).default;
    payload = await getPayload({ config });
  }

  const results = [];

  for (const { name, category } of FILES) {
    const src = path.join(SOURCE_DIR, name);
    const fstat = await stat(src);
    const sizeMb = (fstat.size / 1024 / 1024).toFixed(2);

    if (DRY_RUN) {
      console.log(`PLAN  ${name}  (${sizeMb} MB, category=${category})`);
      results.push({ name, category, bytes: fstat.size });
      continue;
    }

    const existing = await payload.find({
      collection: "media",
      where: { filename: { equals: name } },
      limit: 1,
    });
    if (existing.docs.length > 0) {
      const doc = existing.docs[0];
      console.log(`SKIP  ${name}  (already exists: ${doc.url})`);
      results.push({ name, category, url: doc.url, skipped: true });
      continue;
    }

    const data = await readFile(src);
    const created = await payload.create({
      collection: "media",
      data: {
        alt: name,
        category,
      },
      file: {
        data,
        mimetype: "video/mp4",
        name,
        size: fstat.size,
      },
    });
    console.log(`OK    ${name}  →  ${created.url}`);
    results.push({ name, category, url: created.url });
  }

  console.log("\n=== Summary ===");
  for (const r of results) {
    console.log(`  ${r.name}: ${r.url || `(${(r.bytes / 1024 / 1024).toFixed(2)} MB planned)`}`);
  }

  if (DRY_RUN) {
    console.log("\nRun with --apply to execute.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
