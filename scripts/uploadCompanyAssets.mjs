#!/usr/bin/env node
// Walks docs/海盛/* and uploads each file to Payload Media collection (R2),
// renaming to {category}-{NNN}.{ext} and tagging with category.
//
// Usage:
//   node --env-file=.env.local scripts/uploadCompanyAssets.mjs            # dry-run
//   node --env-file=.env.local scripts/uploadCompanyAssets.mjs --apply    # execute

import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getPayload } from "payload";

const DRY_RUN = !process.argv.includes("--apply");

const SOURCE_ROOT = path.join(process.cwd(), "docs/海盛");

// Map source subdirectory → Media.category enum value + filename prefix
const FOLDER_MAP = [
  { dir: "营业执照",                                 category: "license",       prefix: "license" },
  { dir: "展厅图片",                                 category: "showroom",      prefix: "showroom" },
  { dir: "工厂图片",                                 category: "factory",       prefix: "factory" },
  { dir: "合作案例(优先用销售案例）/销售合作案例",       category: "case-sales",    prefix: "case-sales" },
  { dir: "合作案例(优先用销售案例）/工厂合作案例",       category: "case-factory",  prefix: "case-factory" },
];

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".heic": "image/heic",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

async function listFiles(dir) {
  try {
    const entries = await (await import("node:fs/promises")).readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && !e.name.startsWith("."))
      .map((e) => path.join(dir, e.name))
      .sort();
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function uploadOne(payload, srcPath, newFilename, category, dryRun) {
  const ext = path.extname(srcPath).toLowerCase();
  const mimeType = MIME_TYPES[ext];
  if (!mimeType) {
    console.warn(`  SKIP unsupported ext: ${path.relative(process.cwd(), srcPath)}`);
    return { skipped: true };
  }

  if (dryRun) {
    const fstat = await stat(srcPath);
    return {
      planned: true,
      newFilename,
      bytes: fstat.size,
    };
  }

  const data = await readFile(srcPath);
  const fstat = await stat(srcPath);
  const created = await payload.create({
    collection: "media",
    data: {
      alt: newFilename,
      category,
    },
    file: {
      data,
      mimetype: mimeType,
      name: newFilename,
      size: fstat.size,
    },
  });
  return { uploaded: true, id: created.id, url: created.url };
}

async function loadExistingFilenames(payload) {
  const existing = new Set();
  let page = 1;
  while (true) {
    const res = await payload.find({
      collection: "media",
      limit: 200,
      page,
      depth: 0,
      where: {
        category: {
          in: ["license", "showroom", "factory", "case-sales", "case-factory"],
        },
      },
    });
    for (const doc of res.docs) {
      if (doc.filename) existing.add(doc.filename);
    }
    if (page >= res.totalPages) break;
    page += 1;
  }
  return existing;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY-RUN" : "APPLY"}`);
  console.log(`Source: ${SOURCE_ROOT}\n`);

  let payload = null;
  let existingFilenames = new Set();
  if (!DRY_RUN) {
    const config = (await import("../src/payload.config.ts")).default;
    payload = await getPayload({ config });
    existingFilenames = await loadExistingFilenames(payload);
    console.log(`Already uploaded (will skip): ${existingFilenames.size} files\n`);

    // Catch unhandled pg pool errors so a single network blip doesn't kill the run.
    process.on("uncaughtException", (err) => {
      console.error(`  WARN uncaughtException: ${err.message}`);
    });
  }

  const totals = { planned: 0, uploaded: 0, skipped: 0, failed: 0, bytes: 0 };

  for (const { dir, category, prefix } of FOLDER_MAP) {
    const fullDir = path.join(SOURCE_ROOT, dir);
    const files = await listFiles(fullDir);
    console.log(`\n[${category}] ${dir}  (${files.length} files)`);
    if (files.length === 0) continue;

    for (let i = 0; i < files.length; i++) {
      const src = files[i];
      let ext = path.extname(src).toLowerCase();
      // Compressed mirror already converted .heic→.jpg and .mov→.mp4, but be defensive
      if (ext === ".heic") ext = ".jpg";
      if (ext === ".mov") ext = ".mp4";
      if (ext === ".jpeg") ext = ".jpg";
      const seq = String(i + 1).padStart(3, "0");
      const newFilename = `${prefix}-${seq}${ext}`;

      if (!DRY_RUN && existingFilenames.has(newFilename)) {
        totals.skipped++;
        console.log(`  SKIP  ${newFilename} (already uploaded)`);
        continue;
      }

      try {
        const r = await uploadOne(payload, src, newFilename, category, DRY_RUN);
        if (r.skipped) {
          totals.skipped++;
        } else if (r.planned) {
          totals.planned++;
          totals.bytes += r.bytes;
          console.log(`  PLAN  ${path.basename(src)}  →  ${newFilename}  (${(r.bytes / 1024 / 1024).toFixed(2)} MB)`);
        } else if (r.uploaded) {
          totals.uploaded++;
          console.log(`  OK    ${newFilename}  →  ${r.url}`);
        }
      } catch (err) {
        totals.failed++;
        console.error(`  FAIL  ${newFilename}: ${err.message}`);
      }
    }
  }

  console.log(`\n=== Summary (${DRY_RUN ? "dry-run" : "applied"}) ===`);
  if (DRY_RUN) {
    console.log(`Files planned: ${totals.planned}`);
    console.log(`Total bytes:   ${(totals.bytes / 1024 / 1024).toFixed(1)} MB`);
    console.log(`Skipped:       ${totals.skipped}`);
    console.log(`\nRun with --apply to execute.`);
  } else {
    console.log(`Uploaded: ${totals.uploaded}`);
    console.log(`Skipped:  ${totals.skipped}`);
    console.log(`Failed:   ${totals.failed}`);
  }

  process.exit(totals.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
