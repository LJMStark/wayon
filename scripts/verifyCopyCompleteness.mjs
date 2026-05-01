#!/usr/bin/env node
/**
 * Verify that every published product has non-empty descriptions for all 4
 * locales (zh / en / es / ar), so no product falls back to the default
 * site-copy template on the product detail page.
 *
 * Usage:
 *   node --env-file=.env.local scripts/verifyCopyCompleteness.mjs
 *   node --env-file=.env.local scripts/verifyCopyCompleteness.mjs --show-missing
 *   node --env-file=.env.local scripts/verifyCopyCompleteness.mjs --out=docs/copywriting/coverage-report.json
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getPayload } from "payload";

import { PRODUCT_COPY_LOCALES } from "../src/features/products/lib/productCopyGeneration.mts";

function parseArgs(argv) {
  const args = { showMissing: false, out: null, help: false };

  for (const arg of argv) {
    if (arg === "--show-missing") { args.showMissing = true; continue; }
    if (arg === "--help" || arg === "-h") { args.help = true; continue; }
    if (arg.startsWith("--out=")) {
      args.out = path.resolve(arg.slice("--out=".length).trim());
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

async function fetchAllPublished(payload) {
  const { docs } = await payload.find({
    collection: "products",
    where: { published: { equals: true } },
    locale: "all",
    depth: 0,
    limit: 2000,
    sort: "sortOrder",
    overrideAccess: true,
  });
  return docs;
}

function checkProduct(product) {
  const missingLocales = [];

  for (const locale of PRODUCT_COPY_LOCALES) {
    const value = product.description?.[locale];
    const hasDescription = typeof value === "string" && value.trim().length > 0;
    if (!hasDescription) missingLocales.push(locale);
  }

  return missingLocales;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log(`
Verify copy completeness across all published products.

Usage:
  node --env-file=.env.local scripts/verifyCopyCompleteness.mjs [options]

Options:
  --show-missing    Print each product with missing locales
  --out=<path>      Write JSON report to file
  --help            Show this help
    `.trim());
    return;
  }

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const products = await fetchAllPublished(payload);
  console.log(`Checking ${products.length} published products across ${PRODUCT_COPY_LOCALES.join("/")}\n`);

  const missing = [];
  const localeMissingCount = Object.fromEntries(PRODUCT_COPY_LOCALES.map((l) => [l, 0]));

  for (const product of products) {
    const missingLocales = checkProduct(product);
    if (missingLocales.length > 0) {
      for (const locale of missingLocales) localeMissingCount[locale] += 1;
      missing.push({
        productId: product.id,
        slug: product.slug,
        title: typeof product.title === "object"
          ? (product.title.zh || product.title.en || product.slug)
          : (product.title || product.slug),
        missingLocales,
      });
    }
  }

  const complete = products.length - missing.length;
  const coveragePct = products.length > 0
    ? Math.round((complete / products.length) * 100)
    : 100;

  console.log(`── Coverage ─────────────────────────────────`);
  console.log(`  Total published:     ${products.length}`);
  console.log(`  Fully covered:       ${complete}  (${coveragePct}%)`);
  console.log(`  Missing any locale:  ${missing.length}`);
  console.log();
  console.log(`── Missing by locale ────────────────────────`);
  for (const locale of PRODUCT_COPY_LOCALES) {
    const count = localeMissingCount[locale];
    const bar = "█".repeat(Math.min(Math.round(count / products.length * 40), 40));
    console.log(`  ${locale.padEnd(4)}  ${String(count).padStart(4)}  ${bar}`);
  }

  if (missing.length > 0) {
    console.log(`\n── Products still missing copy (${missing.length}) ────`);

    if (args.showMissing) {
      for (const item of missing) {
        console.log(
          `  [${item.missingLocales.join(",")}]  ${item.slug}`
        );
      }
    } else {
      console.log(`  (pass --show-missing to list them)`);
    }
  } else {
    console.log(`\n✓ All products have copy in all ${PRODUCT_COPY_LOCALES.length} locales.`);
  }

  if (args.out) {
    const report = {
      generatedAt: new Date().toISOString(),
      totalPublished: products.length,
      fullyCovered: complete,
      coveragePct,
      localeMissingCount,
      missingProducts: missing,
    };
    await mkdir(path.dirname(args.out), { recursive: true });
    await writeFile(args.out, JSON.stringify(report, null, 2), "utf8");
    console.log(`\nReport written: ${args.out}`);
  }

  if (missing.length > 0) process.exit(1);
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
