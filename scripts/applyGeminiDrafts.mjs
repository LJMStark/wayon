#!/usr/bin/env node
/**
 * Apply Gemini-generated drafts from docs/copywriting/gemini-drafts.json
 * to Payload products, in safe batches that avoid DB connection timeouts.
 *
 * Usage:
 *   node --env-file=.env.local scripts/applyGeminiDrafts.mjs              # dry-run, batch 0
 *   node --env-file=.env.local scripts/applyGeminiDrafts.mjs --apply      # write batch 0
 *   node --env-file=.env.local scripts/applyGeminiDrafts.mjs --apply --batch=1
 *   node --env-file=.env.local scripts/applyGeminiDrafts.mjs --apply --all
 *   node --env-file=.env.local scripts/applyGeminiDrafts.mjs --status     # show progress
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getPayload } from "payload";

import { PRODUCT_COPY_LOCALES } from "../src/features/products/lib/productCopyGeneration.mts";

const DRAFTS_PATH = path.join(
  process.cwd(),
  "docs/copywriting/gemini-drafts.json"
);
const DEFAULT_BATCH_SIZE = 9;

function parseArgs(argv) {
  const args = {
    apply: false,
    overwrite: false,
    all: false,
    status: false,
    help: false,
    batch: 0,
    batchSize: DEFAULT_BATCH_SIZE,
  };

  for (const arg of argv) {
    if (arg === "--apply") { args.apply = true; continue; }
    if (arg === "--overwrite") { args.overwrite = true; continue; }
    if (arg === "--all") { args.all = true; continue; }
    if (arg === "--status") { args.status = true; continue; }
    if (arg === "--help" || arg === "-h") { args.help = true; continue; }
    if (arg.startsWith("--batch=")) {
      args.batch = parseInt(arg.slice("--batch=".length), 10);
      continue;
    }
    if (arg.startsWith("--batch-size=")) {
      args.batchSize = parseInt(arg.slice("--batch-size=".length), 10);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function loadDraftedItems() {
  const raw = await readFile(DRAFTS_PATH, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.items)) {
    throw new Error("gemini-drafts.json missing items array.");
  }

  return data.items.filter(
    (item) =>
      (item.status === "drafted" || item.status === "updated") &&
      item.description?.zh &&
      item.description?.en &&
      item.description?.es &&
      item.description?.ar &&
      item.productId
  );
}

async function fetchExistingProduct(payload, productId) {
  return payload.findByID({
    collection: "products",
    id: productId,
    locale: "all",
    depth: 0,
    overrideAccess: true,
  });
}

function hasExistingDescription(product, locale) {
  const value = product.description?.[locale];
  return typeof value === "string" && value.trim().length > 0;
}

async function applyItem(payload, item, args) {
  const { productId, slug, description } = item;

  let existingProduct;
  try {
    existingProduct = await fetchExistingProduct(payload, productId);
  } catch {
    return { slug, status: "not_found", productId };
  }

  const localeResults = [];

  for (const locale of PRODUCT_COPY_LOCALES) {
    const descText = description?.[locale]?.trim();
    if (!descText) {
      localeResults.push({ locale, status: "skipped_no_copy" });
      continue;
    }

    if (!args.overwrite && hasExistingDescription(existingProduct, locale)) {
      localeResults.push({ locale, status: "skipped_existing" });
      continue;
    }

    if (args.apply) {
      const existingTitle =
        existingProduct.title && typeof existingProduct.title === "object"
          ? existingProduct.title[locale] || existingProduct.title.zh || existingProduct.title.en || ""
          : String(existingProduct.title ?? "");

      await payload.update({
        collection: "products",
        id: productId,
        locale,
        data: { title: existingTitle, description: descText },
        overrideAccess: true,
      });
    }

    localeResults.push({ locale, status: args.apply ? "updated" : "dry-run" });
  }

  const anyWritten = localeResults.some((r) => r.status === "updated" || r.status === "dry-run");
  return {
    slug,
    productId,
    status: anyWritten ? (args.apply ? "updated" : "dry-run") : "skipped_all",
    locales: localeResults,
  };
}

function printSummary(results) {
  const counts = {};
  for (const r of results) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }
  console.log("\n── Summary ─────────────────────────────");
  for (const [status, count] of Object.entries(counts)) {
    if (count > 0) console.log(`  ${status.padEnd(16)} ${count}`);
  }
  console.log(`  ${"total".padEnd(16)} ${results.length}`);
}

async function showStatus() {
  const items = await loadDraftedItems();
  const batchSize = DEFAULT_BATCH_SIZE;
  const totalBatches = Math.ceil(items.length / batchSize);
  console.log(`Gemini drafts ready to apply: ${items.length} items`);
  console.log(`Batch size: ${batchSize}  →  ${totalBatches} batches (0–${totalBatches - 1})`);
  console.log(`\nTo apply all batches sequentially:`);
  for (let i = 0; i < totalBatches; i++) {
    const start = i * batchSize;
    const end = Math.min(start + batchSize, items.length);
    console.log(`  npm run apply:gemini-drafts -- --apply --batch=${i}  # items ${start + 1}–${end}`);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Apply Gemini-generated copy from gemini-drafts.json to Payload in safe batches.

Usage:
  node --env-file=.env.local scripts/applyGeminiDrafts.mjs [options]

Options:
  --apply              Write to database (default: dry-run)
  --overwrite          Update products that already have descriptions
  --batch=<n>          Which batch to process (0-indexed, default: 0)
  --batch-size=<n>     Items per batch (default: ${DEFAULT_BATCH_SIZE})
  --all                Process all batches in one run (use with care)
  --status             Show how many batches are needed and quit
  --help               Show this help
    `.trim());
    return;
  }

  if (args.status) {
    await showStatus();
    return;
  }

  const allItems = await loadDraftedItems();

  let itemsToProcess;
  if (args.all) {
    itemsToProcess = allItems;
    console.log(`Mode: ${args.apply ? "APPLY" : "DRY-RUN"}  |  all items=${allItems.length}  |  overwrite=${args.overwrite}`);
  } else {
    const start = args.batch * args.batchSize;
    const end = start + args.batchSize;
    itemsToProcess = allItems.slice(start, end);
    const totalBatches = Math.ceil(allItems.length / args.batchSize);
    console.log(
      `Mode: ${args.apply ? "APPLY" : "DRY-RUN"}  |  batch=${args.batch}/${totalBatches - 1}  |  items=${itemsToProcess.length}  |  overwrite=${args.overwrite}`
    );
  }

  if (itemsToProcess.length === 0) {
    console.log("No items to process in this batch.");
    return;
  }

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const results = [];

  for (const item of itemsToProcess) {
    try {
      const result = await applyItem(payload, item, args);
      const localeStatuses = result.locales?.map((l) => `${l.locale}:${l.status}`).join(" ") ?? "";
      console.log(`  ${result.status.padEnd(10)} ${item.slug}  [${localeStatuses}]`);
      results.push(result);
    } catch (error) {
      console.error(`  FAIL       ${item.slug}: ${error.message}`);
      results.push({ slug: item.slug, productId: item.productId, status: "failed", error: error.message });
    }
  }

  printSummary(results);

  if (!args.apply) {
    console.log("\n[dry-run] No changes written. Pass --apply to write.");
  }
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryUrl) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
