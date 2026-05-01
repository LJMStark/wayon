#!/usr/bin/env node
/**
 * Apply hand-written first-wave copy from docs/copywriting/first-wave-drafts.json
 * to Payload products collection.
 *
 * Usage:
 *   node --env-file=.env.local scripts/applyFirstWaveCopy.mjs          # dry-run
 *   node --env-file=.env.local scripts/applyFirstWaveCopy.mjs --apply  # write to DB
 *   node --env-file=.env.local scripts/applyFirstWaveCopy.mjs --apply --overwrite
 *   node --env-file=.env.local scripts/applyFirstWaveCopy.mjs --slug=aurora-grey
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getPayload } from "payload";

const LOCALES = ["zh", "en", "es", "ar"];
const DRAFTS_PATH = path.join(
  process.cwd(),
  "docs/copywriting/first-wave-drafts.json"
);

function parseArgs(argv) {
  const args = { apply: false, overwrite: false, slugs: [], help: false };

  for (const arg of argv) {
    if (arg === "--apply") { args.apply = true; continue; }
    if (arg === "--overwrite") { args.overwrite = true; continue; }
    if (arg === "--help" || arg === "-h") { args.help = true; continue; }
    if (arg.startsWith("--slug=")) {
      const slug = arg.slice("--slug=".length).trim();
      if (slug) args.slugs.push(slug);
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function isValidUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function loadDrafts(slugFilter) {
  const raw = await readFile(DRAFTS_PATH, "utf8");
  const data = JSON.parse(raw);

  if (!Array.isArray(data.items)) {
    throw new Error("first-wave-drafts.json missing items array.");
  }

  const items = data.items;

  const invalid = items.filter((item) => !isValidUuid(item.productId));
  if (invalid.length > 0) {
    throw new Error(
      `${invalid.length} item(s) still have placeholder productId: ${invalid
        .map((item) => item.slug)
        .join(", ")}`
    );
  }

  if (slugFilter.length > 0) {
    return items.filter((item) => slugFilter.includes(item.slug));
  }

  return items;
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
  const { productId, slug, title_en_proposed, description } = item;

  let existingProduct;
  try {
    existingProduct = await fetchExistingProduct(payload, productId);
  } catch {
    return { slug, status: "not_found", productId };
  }

  const localeResults = [];

  for (const locale of LOCALES) {
    const descText = description?.[locale];
    if (!descText || descText.trim().length === 0) {
      localeResults.push({ locale, status: "skipped_no_copy" });
      continue;
    }

    if (!args.overwrite && hasExistingDescription(existingProduct, locale)) {
      localeResults.push({ locale, status: "skipped_existing" });
      continue;
    }

    const data = { description: descText.trim() };
    if (locale === "en" && title_en_proposed?.trim()) {
      data.title = title_en_proposed.trim();
    }

    if (args.apply) {
      await payload.update({
        collection: "products",
        id: productId,
        locale,
        data,
        overrideAccess: true,
      });
    }

    localeResults.push({
      locale,
      status: args.apply ? "updated" : "dry-run",
      ...(locale === "en" && title_en_proposed ? { title: title_en_proposed } : {}),
      descChars: descText.length,
    });
  }

  const anyUpdated = localeResults.some((r) => r.status === "updated" || r.status === "dry-run");
  return {
    slug,
    productId,
    status: anyUpdated ? (args.apply ? "updated" : "dry-run") : "skipped_all",
    locales: localeResults,
  };
}

function printSummary(results) {
  const counts = { updated: 0, "dry-run": 0, skipped_all: 0, not_found: 0, failed: 0 };
  for (const r of results) {
    counts[r.status] = (counts[r.status] ?? 0) + 1;
  }

  console.log("\n── Summary ─────────────────────────────");
  for (const [status, count] of Object.entries(counts)) {
    if (count > 0) console.log(`  ${status.padEnd(16)} ${count}`);
  }
  console.log(`  ${"total".padEnd(16)} ${results.length}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Apply hand-written first-wave copy to Payload products.

Usage:
  node --env-file=.env.local scripts/applyFirstWaveCopy.mjs [options]

Options:
  --apply              Write to database (default: dry-run)
  --overwrite          Update products that already have descriptions
  --slug=<slug>        Process only this slug (repeatable)
  --help               Show this help
    `.trim());
    return;
  }

  const items = await loadDrafts(args.slugs);
  console.log(
    `Mode: ${args.apply ? "APPLY" : "DRY-RUN"}  |  items=${items.length}  |  overwrite=${args.overwrite}`
  );

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const results = [];

  for (const item of items) {
    try {
      const result = await applyItem(payload, item, args);
      const localeStatuses = result.locales
        ?.map((l) => `${l.locale}:${l.status}`)
        .join(" ") ?? "";
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
