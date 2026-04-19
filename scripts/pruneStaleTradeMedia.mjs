#!/usr/bin/env node

// One-shot cleanup: scrub every Sanity reference that points outside the
// active catalog prefix (产品/众岩联标准素材集合/).
//
// Background: commit 38b64c9 narrowed the on-disk catalog but left a mass
// of productVariant media entries and product cover URLs pointing at the
// legacy subtrees (众岩联--元素图整理/, 众岩联--产品效果图/, 众岩联--实物图/,
// 视频/众岩联--实物视频/, ...) that now live under docs/外贸出口资料/_removed/.
// The trade-media proxy 404s for those paths, so the UI is full of broken
// images. This script brings Sanity back in sync with disk.
//
// Scope:
//   productVariant.{elementImages, spaceImages, realImages, videos}[]
//     -> drop entries whose sourcePath is not under the active prefix
//   product.{coverImageUrl, coverVideoPosterUrl}
//     -> unset when the stored URL is not under the percent-encoded active
//        URL prefix (sourcePaths are stored decoded; cover URLs are stored
//        percent-encoded because buildTradeMediaPublicUrl runs encodeURIComponent)
//
// Idempotent: re-running only touches documents that still contain at least
// one stale entry. A clean dataset yields 0 targets.
//
// Usage:
//   node scripts/pruneStaleTradeMedia.mjs              # apply
//   node scripts/pruneStaleTradeMedia.mjs --dry-run    # report only

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ACTIVE_SOURCE_PATH_PREFIX = "产品/众岩联标准素材集合/";
const ACTIVE_COVER_URL_PREFIX =
  "/api/trade-media/%E4%BA%A7%E5%93%81/%E4%BC%97%E5%B2%A9%E8%81%94%E6%A0%87%E5%87%86%E7%B4%A0%E6%9D%90%E9%9B%86%E5%90%88/";

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

const MEDIA_FIELDS = ["elementImages", "spaceImages", "realImages", "videos"];

const VARIANT_QUERY = `*[_type == "productVariant" && (
  count(elementImages[!(sourcePath match $prefix + "*")]) > 0 ||
  count(spaceImages[!(sourcePath match $prefix + "*")])   > 0 ||
  count(realImages[!(sourcePath match $prefix + "*")])    > 0 ||
  count(videos[!(sourcePath match $prefix + "*")])        > 0
)]{
  _id,
  code,
  "elementImages": coalesce(elementImages, []),
  "spaceImages": coalesce(spaceImages, []),
  "realImages": coalesce(realImages, []),
  "videos": coalesce(videos, [])
}`;

const PRODUCT_QUERY = `*[_type == "product" && (
  (defined(coverImageUrl) && !(coverImageUrl match $coverPrefix + "*")) ||
  (defined(coverVideoPosterUrl) && !(coverVideoPosterUrl match $coverPrefix + "*"))
)]{
  _id,
  "slug": slug.current,
  coverImageUrl,
  coverVideoPosterUrl
}`;

function isActiveSourcePath(sourcePath) {
  return (
    typeof sourcePath === "string" &&
    sourcePath.startsWith(ACTIVE_SOURCE_PATH_PREFIX)
  );
}

function isActiveCoverUrl(url) {
  return typeof url === "string" && url.startsWith(ACTIVE_COVER_URL_PREFIX);
}

function planVariantPatches(variants) {
  const plans = [];
  const totals = {
    elementImages: { dropped: 0, kept: 0 },
    spaceImages: { dropped: 0, kept: 0 },
    realImages: { dropped: 0, kept: 0 },
    videos: { dropped: 0, kept: 0 },
  };

  for (const variant of variants) {
    const next = {};
    let variantChanged = false;

    for (const field of MEDIA_FIELDS) {
      const current = variant[field] ?? [];
      const kept = current.filter((item) => isActiveSourcePath(item?.sourcePath));
      const dropped = current.length - kept.length;
      totals[field].dropped += dropped;
      totals[field].kept += kept.length;

      if (dropped > 0) {
        next[field] = kept;
        variantChanged = true;
      }
    }

    if (variantChanged) {
      plans.push({ id: variant._id, code: variant.code, next });
    }
  }

  return { plans, totals };
}

function planProductPatches(products) {
  const plans = [];
  let staleCover = 0;
  let staleVideoPoster = 0;

  for (const product of products) {
    const toUnset = [];

    if (product.coverImageUrl && !isActiveCoverUrl(product.coverImageUrl)) {
      toUnset.push("coverImageUrl");
      staleCover += 1;
    }

    if (
      product.coverVideoPosterUrl &&
      !isActiveCoverUrl(product.coverVideoPosterUrl)
    ) {
      toUnset.push("coverVideoPosterUrl");
      staleVideoPoster += 1;
    }

    if (toUnset.length > 0) {
      plans.push({ id: product._id, slug: product.slug, unset: toUnset });
    }
  }

  return { plans, staleCover, staleVideoPoster };
}

async function commitPatches(plans, applyPatch) {
  const BATCH = 100;
  let patched = 0;

  for (let i = 0; i < plans.length; i += BATCH) {
    const chunk = plans.slice(i, i + BATCH);
    const tx = client.transaction();

    for (const plan of chunk) {
      tx.patch(plan.id, (p) => applyPatch(p, plan));
    }

    await tx.commit({ visibility: "async" });
    patched += chunk.length;
    console.log(`    patched ${patched}/${plans.length}`);
  }
}

async function main() {
  // ---------- variants ----------
  console.log("Scanning productVariant documents...");
  const staleVariants = await client.fetch(VARIANT_QUERY, {
    prefix: ACTIVE_SOURCE_PATH_PREFIX,
  });
  const { plans: variantPlans, totals: variantTotals } =
    planVariantPatches(staleVariants);

  console.log(`  variants to patch: ${variantPlans.length}`);
  for (const field of MEDIA_FIELDS) {
    console.log(
      `    ${field}: dropped ${variantTotals[field].dropped}, kept ${variantTotals[field].kept}`
    );
  }

  // ---------- products ----------
  console.log("Scanning product documents...");
  const staleProducts = await client.fetch(PRODUCT_QUERY, {
    coverPrefix: ACTIVE_COVER_URL_PREFIX,
  });
  const {
    plans: productPlans,
    staleCover,
    staleVideoPoster,
  } = planProductPatches(staleProducts);

  console.log(`  products to patch: ${productPlans.length}`);
  console.log(`    coverImageUrl to unset: ${staleCover}`);
  console.log(`    coverVideoPosterUrl to unset: ${staleVideoPoster}`);

  if (variantPlans.length === 0 && productPlans.length === 0) {
    console.log("Nothing to do. Dataset is clean.");
    return;
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
        `  ${plan.id} (${plan.slug}): unset ${plan.unset.join(", ")}`
      );
    }
    if (productPlans.length > 10) {
      console.log(`  ...and ${productPlans.length - 10} more`);
    }
    return;
  }

  if (variantPlans.length > 0) {
    console.log(`\nPatching ${variantPlans.length} variant(s)...`);
    await commitPatches(variantPlans, (patch, plan) => patch.set(plan.next));
  }

  if (productPlans.length > 0) {
    console.log(`\nPatching ${productPlans.length} product(s)...`);
    await commitPatches(productPlans, (patch, plan) => patch.unset(plan.unset));
  }

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
