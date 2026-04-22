#!/usr/bin/env node

// One-shot cleanup: scrub every productVariant media entry + product cover URL
// that points outside the active catalog prefix (产品/众岩联标准素材集合/).
//
// Background: commit 38b64c9 narrowed the on-disk catalog but left a mass
// of productVariant media entries and product cover URLs pointing at the
// legacy subtrees (众岩联--元素图整理/, 众岩联--产品效果图/, 众岩联--实物图/,
// 视频/众岩联--实物视频/, ...) that now live under docs/外贸出口资料/_removed/.
// The trade-media proxy 404s for those paths, so the UI is full of broken
// images. This script keeps the dataset in sync with disk.
//
// Scope:
//   productVariant.{elementImages, spaceImages, realImages, videos}[]
//     -> drop entries whose sourcePath is not under the active prefix
//   product.{coverImageUrl, coverVideoPosterUrl}
//     -> null-out when the stored URL is not under the percent-encoded active
//        URL prefix (sourcePaths are stored decoded; cover URLs are stored
//        percent-encoded because buildTradeMediaPublicUrl runs encodeURIComponent)
//
// Idempotent: re-running only touches documents that still contain at least
// one stale entry. A clean dataset yields 0 targets.
//
// Usage:
//   node scripts/pruneStaleTradeMedia.mjs              # apply
//   node scripts/pruneStaleTradeMedia.mjs --dry-run    # report only

import * as dotenv from "dotenv";
import { getPayload } from "payload";

dotenv.config({ path: ".env.local" });

const ACTIVE_SOURCE_PATH_PREFIX = "产品/众岩联标准素材集合/";
const ACTIVE_COVER_URL_PREFIX =
  "/api/trade-media/%E4%BA%A7%E5%93%81/%E4%BC%97%E5%B2%A9%E8%81%94%E6%A0%87%E5%87%86%E7%B4%A0%E6%9D%90%E9%9B%86%E5%90%88/";

const dryRun = process.argv.includes("--dry-run");

const MEDIA_FIELDS = ["elementImages", "spaceImages", "realImages", "videos"];

function isActiveSourcePath(sourcePath) {
  return (
    typeof sourcePath === "string" &&
    sourcePath.startsWith(ACTIVE_SOURCE_PATH_PREFIX)
  );
}

function isActiveCoverUrl(url) {
  return typeof url === "string" && url.startsWith(ACTIVE_COVER_URL_PREFIX);
}

function stripArrayIds(items, keep) {
  return (items || [])
    .filter((item) => item && keep(item))
    .map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _dropped, ...rest } = item;
      return rest;
    });
}

function planVariantPatch(variant) {
  const next = {};
  let changed = false;
  const totals = {
    elementImages: { dropped: 0, kept: 0 },
    spaceImages: { dropped: 0, kept: 0 },
    realImages: { dropped: 0, kept: 0 },
    videos: { dropped: 0, kept: 0 },
  };

  for (const field of MEDIA_FIELDS) {
    const current = variant[field] ?? [];
    const kept = current.filter((item) => isActiveSourcePath(item?.sourcePath));
    const dropped = current.length - kept.length;
    totals[field].dropped = dropped;
    totals[field].kept = kept.length;

    if (dropped > 0) {
      next[field] = stripArrayIds(kept, () => true);
      changed = true;
    }
  }

  return changed ? { next, totals } : null;
}

async function findStaleVariants(payload) {
  // Payload has no "array-of-objects field contains X" filter expressive enough
  // to match the GROQ query; fetch all variants and filter in JS. Trade catalog
  // is small enough (< few thousand variants) that this is fine.
  const { docs } = await payload.find({
    collection: "productVariants",
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  });

  const stale = [];
  for (const doc of docs) {
    const plan = planVariantPatch(doc);
    if (plan) {
      stale.push({ id: doc.id, code: doc.code, ...plan });
    }
  }
  return stale;
}

async function findStaleProducts(payload) {
  const { docs } = await payload.find({
    collection: "products",
    limit: 10000,
    depth: 0,
    overrideAccess: true,
  });

  const stale = [];
  for (const doc of docs) {
    const toClear = [];
    if (doc.coverImageUrl && !isActiveCoverUrl(doc.coverImageUrl)) {
      toClear.push("coverImageUrl");
    }
    if (doc.coverVideoPosterUrl && !isActiveCoverUrl(doc.coverVideoPosterUrl)) {
      toClear.push("coverVideoPosterUrl");
    }
    if (toClear.length > 0) {
      stale.push({ id: doc.id, slug: doc.slug, clear: toClear });
    }
  }
  return stale;
}

async function main() {
  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  // ---------- variants ----------
  console.log("Scanning productVariant documents...");
  const variantPlans = await findStaleVariants(payload);

  const variantTotals = {
    elementImages: { dropped: 0, kept: 0 },
    spaceImages: { dropped: 0, kept: 0 },
    realImages: { dropped: 0, kept: 0 },
    videos: { dropped: 0, kept: 0 },
  };
  for (const plan of variantPlans) {
    for (const field of MEDIA_FIELDS) {
      variantTotals[field].dropped += plan.totals[field].dropped;
      variantTotals[field].kept += plan.totals[field].kept;
    }
  }

  console.log(`  variants to patch: ${variantPlans.length}`);
  for (const field of MEDIA_FIELDS) {
    console.log(
      `    ${field}: dropped ${variantTotals[field].dropped}, kept ${variantTotals[field].kept}`
    );
  }

  // ---------- products ----------
  console.log("Scanning product documents...");
  const productPlans = await findStaleProducts(payload);

  const staleCover = productPlans.filter((p) =>
    p.clear.includes("coverImageUrl")
  ).length;
  const staleVideoPoster = productPlans.filter((p) =>
    p.clear.includes("coverVideoPosterUrl")
  ).length;

  console.log(`  products to patch: ${productPlans.length}`);
  console.log(`    coverImageUrl to clear: ${staleCover}`);
  console.log(`    coverVideoPosterUrl to clear: ${staleVideoPoster}`);

  if (variantPlans.length === 0 && productPlans.length === 0) {
    console.log("Nothing to do. Dataset is clean.");
    process.exit(0);
  }

  if (dryRun) {
    console.log("\n[dry-run] sample variant plans:");
    for (const plan of variantPlans.slice(0, 10)) {
      const summary = MEDIA_FIELDS.filter((field) => field in plan.next)
        .map((field) => `${field}=${plan.next[field].length}`)
        .join(" ");
      console.log(`  ${plan.id} (${plan.code}): keep ${summary}`);
    }
    if (variantPlans.length > 10) {
      console.log(`  ...and ${variantPlans.length - 10} more`);
    }

    console.log("\n[dry-run] sample product plans:");
    for (const plan of productPlans.slice(0, 10)) {
      console.log(
        `  ${plan.id} (${plan.slug}): clear ${plan.clear.join(", ")}`
      );
    }
    if (productPlans.length > 10) {
      console.log(`  ...and ${productPlans.length - 10} more`);
    }
    process.exit(0);
  }

  if (variantPlans.length > 0) {
    console.log(`\nPatching ${variantPlans.length} variant(s)...`);
    let patched = 0;
    for (const plan of variantPlans) {
      await payload.update({
        collection: "productVariants",
        id: plan.id,
        data: plan.next,
        overrideAccess: true,
      });
      patched += 1;
      if (patched % 25 === 0 || patched === variantPlans.length) {
        console.log(`    patched ${patched}/${variantPlans.length}`);
      }
    }
  }

  if (productPlans.length > 0) {
    console.log(`\nPatching ${productPlans.length} product(s)...`);
    let patched = 0;
    for (const plan of productPlans) {
      const data = {};
      for (const field of plan.clear) {
        data[field] = null;
      }
      await payload.update({
        collection: "products",
        id: plan.id,
        data,
        overrideAccess: true,
      });
      patched += 1;
      if (patched % 25 === 0 || patched === productPlans.length) {
        console.log(`    patched ${patched}/${productPlans.length}`);
      }
    }
  }

  console.log("\nDone.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
