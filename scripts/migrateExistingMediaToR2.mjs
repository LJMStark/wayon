/**
 * migrateExistingMediaToR2.mjs
 *
 * Migrates productVariant media items that still point to /api/trade-media/ disk URLs
 * → uploads source files from docs/{sourcePath} to the Payload media collection
 * → images compressed by sharp, stored in Cloudflare R2 via @payloadcms/storage-s3
 * → patches each variant with new mediaRef (Payload media ID) + publicUrl (R2 URL)
 * → also updates products.coverImageUrl / coverVideoPosterUrl
 *
 * Usage (run from project root):
 *   npm run migrate:existing-media                          # dry-run (default)
 *   npm run migrate:existing-media -- --apply               # execute
 *   npm run migrate:existing-media -- --apply --limit=5     # first 5 variants only
 */

import { readFile, access } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

const DOCS_ROOT = path.join(process.cwd(), "docs");
const TRADE_MEDIA_PREFIX = "/api/trade-media/";

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

function parseArgs(argv) {
  return {
    dryRun: !argv.includes("--apply"),
    limit: (() => {
      const flag = argv.find((a) => a.startsWith("--limit="));
      return flag ? parseInt(flag.slice("--limit=".length), 10) : null;
    })(),
  };
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function uploadMedia(payload, filePath, altText, uploadCache, dryRun) {
  if (uploadCache.has(filePath)) {
    return uploadCache.get(filePath);
  }

  if (dryRun) {
    const result = { id: "dry-run", url: "https://r2.example.com/dry-run" };
    uploadCache.set(filePath, result);
    return result;
  }

  const data = await readFile(filePath);
  const filename = path.basename(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimetype = MIME_TYPES[ext] ?? "application/octet-stream";

  const media = await payload.create({
    collection: "media",
    data: { alt: altText },
    file: { data, name: filename, mimetype, size: data.length },
    overrideAccess: true,
  });

  const result = { id: media.id, url: media.url ?? "" };
  uploadCache.set(filePath, result);
  return result;
}

// Determine whether a media array item still needs R2 migration
function needsMigration(item) {
  return !item.mediaRef && typeof item.publicUrl === "string" && item.publicUrl.startsWith(TRADE_MEDIA_PREFIX);
}

// Resolve the absolute file path for a media item
function resolveFilePath(item) {
  if (item.sourcePath) {
    return path.join(DOCS_ROOT, item.sourcePath);
  }
  // Fallback: decode URL path
  if (item.publicUrl?.startsWith(TRADE_MEDIA_PREFIX)) {
    const rel = decodeURIComponent(item.publicUrl.slice(TRADE_MEDIA_PREFIX.length));
    return path.join(DOCS_ROOT, rel);
  }
  return null;
}

// Decode a coverImageUrl / coverVideoPosterUrl to an absolute file path
function coverUrlToFilePath(coverUrl) {
  if (!coverUrl?.startsWith(TRADE_MEDIA_PREFIX)) return null;
  const rel = decodeURIComponent(coverUrl.slice(TRADE_MEDIA_PREFIX.length));
  return path.join(DOCS_ROOT, rel);
}

async function migrateMediaArray(items, altText, payload, uploadCache, stats, dryRun) {
  if (!items?.length) return items ?? [];

  const result = [];
  for (const item of items) {
    if (!needsMigration(item)) {
      result.push(item);
      continue;
    }

    const filePath = resolveFilePath(item);
    if (!filePath || !(await fileExists(filePath))) {
      stats.missingFiles.push(filePath ?? item.publicUrl ?? "(unknown)");
      result.push(item);
      continue;
    }

    const { id, url } = await uploadMedia(payload, filePath, altText, uploadCache, dryRun);
    stats.filesUploaded += 1;
    result.push({ ...item, mediaRef: id, publicUrl: url });
  }
  return result;
}

async function migrateVariant(payload, variant, uploadCache, stats, dryRun) {
  const allItems = [
    ...(variant.elementImages ?? []),
    ...(variant.spaceImages ?? []),
    ...(variant.realImages ?? []),
    ...(variant.videos ?? []),
  ];

  if (!allItems.some(needsMigration)) return;

  const altText = variant.code ?? "";
  const countBefore = allItems.filter(needsMigration).length;

  const elementImages = await migrateMediaArray(variant.elementImages, altText, payload, uploadCache, stats, dryRun);
  const spaceImages = await migrateMediaArray(variant.spaceImages, altText, payload, uploadCache, stats, dryRun);
  const realImages = await migrateMediaArray(variant.realImages, altText, payload, uploadCache, stats, dryRun);
  const videos = await migrateMediaArray(variant.videos, altText, payload, uploadCache, stats, dryRun);

  if (!dryRun) {
    await payload.update({
      collection: "productVariants",
      id: variant.id,
      data: { elementImages, spaceImages, realImages, videos },
      overrideAccess: true,
    });
  }

  stats.variantsUpdated += 1;
  console.log(
    `[${dryRun ? "dry" : "ok"}] variant ${variant.id} (${variant.code}) — ${countBefore} item(s) migrated`
  );
}

async function migrateProductCovers(payload, uploadCache, stats, dryRun) {
  console.log("\nMigrating product coverImageUrl / coverVideoPosterUrl...");

  let page = 1;
  let productsUpdated = 0;

  while (true) {
    const { docs, hasNextPage } = await payload.find({
      collection: "products",
      where: {
        or: [
          { coverImageUrl: { contains: TRADE_MEDIA_PREFIX } },
          { coverVideoPosterUrl: { contains: TRADE_MEDIA_PREFIX } },
        ],
      },
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    });

    if (docs.length === 0) break;

    for (const product of docs) {
      const updateData = {};
      let changed = false;

      if (product.coverImageUrl?.startsWith(TRADE_MEDIA_PREFIX)) {
        const filePath = coverUrlToFilePath(product.coverImageUrl);
        if (filePath && (await fileExists(filePath))) {
          const { url } = await uploadMedia(payload, filePath, "", uploadCache, dryRun);
          updateData.coverImageUrl = url;
          changed = true;
          stats.filesUploaded += 1;
        } else {
          stats.missingFiles.push(filePath ?? product.coverImageUrl);
        }
      }

      if (product.coverVideoPosterUrl?.startsWith(TRADE_MEDIA_PREFIX)) {
        const filePath = coverUrlToFilePath(product.coverVideoPosterUrl);
        if (filePath && (await fileExists(filePath))) {
          const { url } = await uploadMedia(payload, filePath, "", uploadCache, dryRun);
          updateData.coverVideoPosterUrl = url;
          changed = true;
          stats.filesUploaded += 1;
        } else {
          stats.missingFiles.push(filePath ?? product.coverVideoPosterUrl);
        }
      }

      if (changed) {
        if (!dryRun) {
          await payload.update({
            collection: "products",
            id: product.id,
            data: updateData,
            overrideAccess: true,
          });
        }
        productsUpdated += 1;
        console.log(`[${dryRun ? "dry" : "ok"}] product ${product.id} cover URL updated`);
      }
    }

    if (!hasNextPage) break;
    page += 1;
  }

  stats.productsUpdated += productsUpdated;
  console.log(`Products with covers migrated: ${productsUpdated}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  console.log(`Mode: ${args.dryRun ? "DRY-RUN (pass --apply to write)" : "APPLY"}`);
  if (args.limit) console.log(`Limit: first ${args.limit} variants`);

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const stats = {
    variantsScanned: 0,
    variantsUpdated: 0,
    productsUpdated: 0,
    filesUploaded: 0,
    missingFiles: [],
  };

  const uploadCache = new Map();

  // Load all variants (paginated)
  const allVariants = [];
  let page = 1;
  while (true) {
    const { docs, hasNextPage } = await payload.find({
      collection: "productVariants",
      limit: 100,
      page,
      depth: 0,
      overrideAccess: true,
    });
    allVariants.push(...docs);
    if (!hasNextPage) break;
    page += 1;
  }

  console.log(`Total variants in DB: ${allVariants.length}`);

  const pending = allVariants.filter((v) =>
    [...(v.elementImages ?? []), ...(v.spaceImages ?? []), ...(v.realImages ?? []), ...(v.videos ?? [])].some(
      needsMigration
    )
  );

  console.log(`Variants needing R2 migration: ${pending.length}`);

  const toProcess = args.limit ? pending.slice(0, args.limit) : pending;
  if (args.limit) console.log(`Processing first ${toProcess.length} variants`);

  for (const variant of toProcess) {
    stats.variantsScanned += 1;
    try {
      await migrateVariant(payload, variant, uploadCache, stats, args.dryRun);
    } catch (err) {
      console.error(`ERROR migrating variant ${variant.id} (${variant.code}):`, err.message);
      stats.missingFiles.push(`variant:${variant.id} — ${err.message}`);
    }
  }

  await migrateProductCovers(payload, uploadCache, stats, args.dryRun);

  console.log("\n=== Summary ===");
  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        variantsScanned: stats.variantsScanned,
        variantsUpdated: stats.variantsUpdated,
        productsUpdated: stats.productsUpdated,
        filesUploaded: stats.filesUploaded,
        missingFilesCount: stats.missingFiles.length,
        missingFiles: stats.missingFiles,
      },
      null,
      2
    )
  );

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
