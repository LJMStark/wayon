/**
 * import422Catalog.mjs
 *
 * Scans docs/4.22/ and imports all product media directly into Payload CMS.
 * Each file is uploaded to the `media` collection → stored in Cloudflare R2
 * automatically via @payloadcms/storage-s3. Images are compressed and resized
 * by sharp (thumbnail/card/feature). Videos are stored as-is on R2.
 *
 * Usage (run from project root):
 *   npm run import:422-catalog                          # dry-run (default)
 *   npm run import:422-catalog -- --apply               # execute
 *   npm run import:422-catalog -- --apply --limit=5     # first 5 products only
 *
 * npm script uses --env-file=.env.local so env vars are loaded automatically.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { getPayload } from "payload";

import {
  extractTradeCode,
  extractTradeDisplayName,
  inferTradeColorGroup,
  inferTradeSize,
  inferTradeThickness,
  normalizeTradeProcess,
} from "../src/features/products/lib/tradeCatalog.ts";
import { buildStableTradeFamilySlug } from "../src/features/products/lib/tradeImportIdentity.ts";

const CATALOG_ROOT = path.join(process.cwd(), "docs/4.22");

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const VIDEO_EXTENSIONS = new Set([".mp4", ".mov"]);

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
    skipCategories: (() => {
      const flags = argv.filter((a) => a.startsWith("--skip-category="));
      return flags.map((f) => f.slice("--skip-category=".length));
    })(),
  };
}

// Detect media files in a directory (non-recursive)
async function listMediaFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile())
    .map((e) => e.name)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
    });
}

// Recursively find all leaf directories (those containing media files directly)
async function findLeafDirs(dir, result = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  const subdirs = entries.filter((e) => e.isDir?.() ?? e.isDirectory());
  const mediaFiles = entries.filter((e) => {
    if (!e.isFile()) return false;
    const ext = path.extname(e.name).toLowerCase();
    return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
  });

  if (mediaFiles.length > 0) {
    result.push(dir);
  }

  for (const subdir of subdirs) {
    await findLeafDirs(path.join(dir, subdir.name), result);
  }

  return result;
}

// Extract product code from directory name (handles dashes: LV1224-120 etc.)
function extractCode(dirName) {
  return extractTradeCode(dirName);
}

// Extract product display name from directory name
function extractName(dirName) {
  return extractTradeDisplayName(dirName) ?? dirName;
}

// Classify a filename into a media category
function classifyFile(filename) {
  const base = path.basename(filename, path.extname(filename));
  const ext = path.extname(filename).toLowerCase();

  if (VIDEO_EXTENSIONS.has(ext)) return "videos";
  if (base.includes("元素图")) return "elementImages";
  if (base.includes("空间图")) return "spaceImages";
  if (base.includes("实拍图")) return "realImages";

  // Unknown image type — default to realImages
  return "realImages";
}

function isCustomPatternProduct(segments) {
  return segments.includes("工艺岩板") && segments.includes("定制图案设计");
}

// Parse metadata from the directory path
function parsePathMetadata(leafDir) {
  const rel = path.relative(CATALOG_ROOT, leafDir);
  const segments = rel.split(path.sep);

  const fullPath = segments.join("/");

  const size = inferTradeSize(fullPath) ?? null;
  const thickness = inferTradeThickness(fullPath) ?? null;

  // Try to find a process in each segment (from deepest upward, excluding leaf)
  let process = null;
  for (let i = segments.length - 2; i >= 1; i--) {
    const candidate = normalizeTradeProcess(segments[i]);
    if (candidate) {
      process = candidate;
      break;
    }
  }

  if (!process && isCustomPatternProduct(segments)) {
    process = "数码模具面";
  }

  const topCategory = segments[0] ?? null;
  return { topCategory, size, thickness, process };
}

// Upload one file to Payload media collection; return { id, url }
async function uploadMedia(payload, filePath, altText, dryRun) {
  if (dryRun) {
    return { id: "dry-run", url: "https://r2.example.com/dry-run" };
  }

  const filename = path.basename(filePath);

  // Idempotency: reuse existing media doc if filename already uploaded
  const existing = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  });
  if (existing.docs.length > 0) {
    const doc = existing.docs[0];
    return { id: doc.id, url: doc.url ?? "" };
  }

  const data = await readFile(filePath);
  const ext = path.extname(filename).toLowerCase();
  const mimetype = MIME_TYPES[ext] ?? "application/octet-stream";

  const media = await payload.create({
    collection: "media",
    data: { alt: altText },
    file: {
      data,
      name: filename,
      mimetype,
      size: data.length,
    },
    overrideAccess: true,
  });

  return { id: media.id, url: media.url ?? "" };
}

// Upsert a product by slug; return the product id
async function upsertProduct(payload, slug, title, normalizedName, dryRun) {
  const existing = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });

  if (existing.docs.length > 0) {
    return existing.docs[0].id;
  }

  if (dryRun) return `dry-run-${slug}`;

  // Create with zh locale first, then patch en locale separately.
  // Passing { title: { zh, en } } without locale causes Payload to store the
  // entire object as a JSON string in the default locale field.
  const created = await payload.create({
    collection: "products",
    locale: "zh",
    data: { slug, title, normalizedName, published: false },
    overrideAccess: true,
  });
  await payload.update({
    collection: "products",
    id: created.id,
    locale: "en",
    data: { title },
    overrideAccess: true,
  });
  return created.id;
}

// Check if a variant already exists for this product + code
async function findExistingVariant(payload, productId, code) {
  const result = await payload.find({
    collection: "productVariants",
    where: {
      and: [
        { productRef: { equals: productId } },
        { code: { equals: code } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  });
  return result.docs[0] ?? null;
}

async function processLeafDir(payload, leafDir, uploadCache, args, stats) {
  const dirName = path.basename(leafDir);
  const code = extractCode(dirName);
  const name = extractName(dirName);

  if (!code) {
    stats.skipped.push({ dir: leafDir, reason: "Cannot extract product code" });
    return;
  }

  const mediaFiles = await listMediaFiles(leafDir);
  if (mediaFiles.length === 0) {
    stats.skipped.push({ dir: leafDir, reason: "No media files" });
    return;
  }

  const { size, thickness, process: mfgProcess } = parsePathMetadata(leafDir);

  const normalizedName = name;
  const slug = buildStableTradeFamilySlug(code);
  const colorGroup = inferTradeColorGroup(name) ?? null;

  // Group files by category
  const grouped = { elementImages: [], spaceImages: [], realImages: [], videos: [] };
  for (const filename of mediaFiles) {
    const category = classifyFile(filename);
    grouped[category].push(filename);
  }

  // Sort each group for stable sortOrder
  for (const group of Object.values(grouped)) {
    group.sort();
  }

  // Upload all media files (with deduplication via uploadCache)
  async function uploadFile(filename, altText) {
    const absPath = path.join(leafDir, filename);
    if (uploadCache.has(absPath)) {
      return uploadCache.get(absPath);
    }
    const result = await uploadMedia(payload, absPath, altText, args.dryRun);
    uploadCache.set(absPath, result);
    stats.filesUploaded += 1;
    return result;
  }

  const buildImageItems = async (filenames) => {
    const items = [];
    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      const { id, url } = await uploadFile(filename, name);
      items.push({
        mediaRef: id,
        sourcePath: path.relative(process.cwd(), path.join(leafDir, filename)),
        publicUrl: url,
        altZh: name,
        sortOrder: i,
      });
    }
    return items;
  };

  const buildVideoItems = async (filenames) => {
    const items = [];
    for (let i = 0; i < filenames.length; i++) {
      const filename = filenames[i];
      const { id, url } = await uploadFile(filename, name);
      items.push({
        mediaRef: id,
        sourcePath: path.relative(process.cwd(), path.join(leafDir, filename)),
        publicUrl: url,
        titleZh: name,
        sortOrder: i,
      });
    }
    return items;
  };

  const elementImages = await buildImageItems(grouped.elementImages);
  const spaceImages = await buildImageItems(grouped.spaceImages);
  const realImages = await buildImageItems(grouped.realImages);
  const videos = await buildVideoItems(grouped.videos);

  // Upsert product
  const productId = await upsertProduct(payload, slug, name, normalizedName, args.dryRun);

  // Check for existing variant
  const existingVariant = await findExistingVariant(payload, productId, code);

  const variantData = {
    productRef: productId,
    code,
    size: size ?? undefined,
    thickness: thickness ?? undefined,
    process: mfgProcess ?? undefined,
    colorGroup: colorGroup ?? undefined,
    sortOrder: 0,
    elementImages,
    spaceImages,
    realImages,
    videos,
  };

  if (!args.dryRun) {
    if (existingVariant) {
      await payload.update({
        collection: "productVariants",
        id: existingVariant.id,
        data: variantData,
        overrideAccess: true,
      });
    } else {
      await payload.create({
        collection: "productVariants",
        data: variantData,
        overrideAccess: true,
      });
    }
  }

  stats.productsProcessed += 1;
  console.log(
    `[${args.dryRun ? "dry" : "ok"}] ${code} ${name} — ${mediaFiles.length} files (elem:${grouped.elementImages.length} space:${grouped.spaceImages.length} real:${grouped.realImages.length} vid:${grouped.videos.length})`
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Supabase terminates idle pg connections; without a handler Node.js crashes the process.
  // Catch both pool-level and client-level errors so the import can continue after reconnect.
  process.on("uncaughtException", (err) => {
    if (err.message?.includes("Connection terminated") || err.code === "ECONNRESET") {
      console.warn("[pool] connection dropped by server, next query will reconnect");
    } else {
      console.error("Fatal uncaught exception:", err);
      process.exit(1);
    }
  });

  console.log(`Mode: ${args.dryRun ? "DRY-RUN (pass --apply to write)" : "APPLY"}`);
  if (args.limit) console.log(`Limit: first ${args.limit} product directories`);
  if (args.skipCategories.length) console.log(`Skip categories: ${args.skipCategories.join(", ")}`);

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  // Pool-level handler as belt-and-suspenders alongside uncaughtException above.
  if (payload.db?.pool) {
    payload.db.pool.on("error", (err) => {
      if (err.message?.includes("Connection terminated") || err.code === "ECONNRESET") {
        console.warn("[pool] connection dropped by server, next query will reconnect");
      } else {
        console.error("[pool error]", err.message);
      }
    });
  }

  console.log("Scanning docs/4.22/ for product directories...");
  let leafDirs = await findLeafDirs(CATALOG_ROOT);
  leafDirs.sort();

  console.log(`Found ${leafDirs.length} product directories`);

  if (args.skipCategories.length) {
    leafDirs = leafDirs.filter((d) => {
      const rel = path.relative(CATALOG_ROOT, d);
      const topCategory = rel.split(path.sep)[0];
      return !args.skipCategories.includes(topCategory);
    });
    console.log(`After skipping categories: ${leafDirs.length} directories`);
  }

  if (args.limit) {
    leafDirs = leafDirs.slice(0, args.limit);
    console.log(`Processing first ${leafDirs.length} directories`);
  }

  const uploadCache = new Map(); // absFilePath → { id, url }
  const stats = {
    productsProcessed: 0,
    filesUploaded: 0,
    skipped: [],
  };

  for (const leafDir of leafDirs) {
    try {
      await processLeafDir(payload, leafDir, uploadCache, args, stats);
    } catch (err) {
      console.error(`ERROR processing ${leafDir}:`, err.message);
      stats.skipped.push({ dir: leafDir, reason: err.message });
    }
  }

  console.log("\n=== Summary ===");
  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        totalDirectories: leafDirs.length,
        productsProcessed: stats.productsProcessed,
        filesUploaded: stats.filesUploaded,
        skipped: stats.skipped.length,
        skippedDetails: stats.skipped,
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
