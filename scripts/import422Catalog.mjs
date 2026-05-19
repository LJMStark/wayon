/**
 * import422Catalog.mjs
 *
 * Scans docs/4.22/ and imports product media directly into Payload CMS.
 * Each file is uploaded to the `media` collection → stored in Cloudflare R2
 * automatically via @payloadcms/storage-s3. Use the compressed catalog mirror
 * when it exists; otherwise this reads docs/4.22/, which is expected to be the
 * already-compressed production media set.
 *
 * Usage (run from project root):
 *   npm run import:422-catalog
 *   npm run import:422-catalog -- --only-category=新品素材 --only-missing
 *   npm run import:422-catalog -- --only-category=新品素材 --only-missing --apply
 *
 * npm script uses --env-file=.env.local so env vars are loaded automatically.
 */

import { access, readdir, readFile } from "node:fs/promises";
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

const REPO_ROOT = process.cwd();
const DEFAULT_CATALOG_ROOT = path.join(REPO_ROOT, "docs/4.22");
const COMPRESSED_CATALOG_ROOT = path.join(REPO_ROOT, "docs.compressed/4.22");

const CATEGORY_SERIES_TYPES = {
  新品素材: ["新品系列"],
  促销特惠款: ["特惠系列"],
};

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
  const valuesFor = (prefix) =>
    argv
      .filter((a) => a.startsWith(prefix))
      .map((f) => f.slice(prefix.length))
      .filter(Boolean);

  const mediaRootFlag = argv.find((a) => a.startsWith("--media-root="));

  return {
    dryRun: !argv.includes("--apply"),
    onlyMissing: argv.includes("--only-missing"),
    mediaRoot: mediaRootFlag
      ? path.resolve(mediaRootFlag.slice("--media-root=".length))
      : null,
    limit: (() => {
      const flag = argv.find((a) => a.startsWith("--limit="));
      return flag ? parseInt(flag.slice("--limit=".length), 10) : null;
    })(),
    onlyCategories: valuesFor("--only-category="),
    skipCategories: valuesFor("--skip-category="),
  };
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveCatalogRoot(args) {
  if (args.mediaRoot) {
    return args.mediaRoot;
  }

  if (await pathExists(COMPRESSED_CATALOG_ROOT)) {
    return COMPRESSED_CATALOG_ROOT;
  }

  return DEFAULT_CATALOG_ROOT;
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
  if (/元素图|素材图/u.test(base)) return "elementImages";
  if (/空间图|效果图|空图/u.test(base)) return "spaceImages";
  if (/实拍图|实物图|实物/u.test(base)) return "realImages";

  // Unknown image type — default to realImages
  return "realImages";
}

function isCustomPatternProduct(segments) {
  return segments.includes("工艺岩板") && segments.includes("定制图案设计");
}

// Parse metadata from the directory path
function parsePathMetadata(catalogRoot, leafDir) {
  const rel = path.relative(catalogRoot, leafDir);
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
    locale: "zh",
    data: { alt: altText, category: "product" },
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

async function findProductBySlug(payload, slug) {
  const existing = await payload.find({
    collection: "products",
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  });

  return existing.docs[0] ?? null;
}

async function findExistingVariantByCode(payload, code) {
  const result = await payload.find({
    collection: "productVariants",
    where: { code: { equals: code } },
    limit: 1,
    overrideAccess: true,
  });

  return result.docs[0] ?? null;
}

// Upsert a product by slug; return the product id
async function upsertProduct(payload, productData, dryRun) {
  const existing = await findProductBySlug(payload, productData.slug);

  if (existing) {
    return { id: existing.id, created: false };
  }

  if (dryRun) {
    return { id: `dry-run-${productData.slug}`, created: true };
  }

  // Create with zh locale only. Products auto-fill EN/ES/AR titles as pinyin
  // from the zh title via the Products afterChange hook; writing the raw
  // Chinese title into non-zh locales would fight the client naming rule.
  const created = await payload.create({
    collection: "products",
    locale: "zh",
    data: productData,
    overrideAccess: true,
  });
  return { id: created.id, created: true };
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
  const relDir = path.relative(args.catalogRoot, leafDir);

  if (!code) {
    stats.skipped.push({ dir: relDir, reason: "Cannot extract product code" });
    return;
  }

  const slug = buildStableTradeFamilySlug(code);
  const existingVariantForCode = await findExistingVariantByCode(payload, code);

  if (args.onlyMissing && existingVariantForCode) {
    stats.skippedExisting += 1;
    console.log(`[skip-existing] ${code} ${name} — variant code already exists`);
    return;
  }

  if (args.onlyMissing) {
    const existingProduct = await findProductBySlug(payload, slug);
    if (existingProduct) {
      stats.existingProductsMissingVariant += 1;
      console.log(`[complete-existing-product] ${code} ${name} — product exists, variant is missing`);
    }
  }

  const mediaFiles = await listMediaFiles(leafDir);
  if (mediaFiles.length === 0) {
    stats.skipped.push({ dir: relDir, reason: "No media files" });
    return;
  }

  const { topCategory, size, thickness, process: mfgProcess } = parsePathMetadata(args.catalogRoot, leafDir);

  const normalizedName = `4.22:${code}`;
  const colorGroup = inferTradeColorGroup(name) ?? null;
  const seriesTypes = CATEGORY_SERIES_TYPES[topCategory] ?? [];

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
  const productResult = await upsertProduct(
    payload,
    {
      slug,
      title: name,
      normalizedName,
      published: true,
      seriesTypes,
    },
    args.dryRun
  );
  const productId = productResult.id;

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

  if (existingVariant) {
    stats.variantsUpdated += 1;
  } else {
    stats.variantsCreated += 1;
  }
  if (productResult.created) {
    stats.productsCreated += 1;
  } else {
    stats.productsUpdated += 1;
  }
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
  if (args.onlyMissing) console.log("Only missing: yes");
  if (args.onlyCategories.length) console.log(`Only categories: ${args.onlyCategories.join(", ")}`);
  if (args.skipCategories.length) console.log(`Skip categories: ${args.skipCategories.join(", ")}`);

  const catalogRoot = await resolveCatalogRoot(args);
  if (!(await pathExists(catalogRoot))) {
    throw new Error(`Catalog media root does not exist: ${catalogRoot}`);
  }
  args.catalogRoot = catalogRoot;

  console.log(`Media source: ${path.relative(REPO_ROOT, catalogRoot) || catalogRoot}`);
  if (catalogRoot === DEFAULT_CATALOG_ROOT && !(await pathExists(COMPRESSED_CATALOG_ROOT))) {
    console.log(
      "Compressed mirror docs.compressed/4.22 not found; using docs/4.22 (expected compressed production media set)."
    );
  }

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

  console.log(`Scanning ${path.relative(REPO_ROOT, catalogRoot) || catalogRoot} for product directories...`);
  let leafDirs = await findLeafDirs(catalogRoot);
  leafDirs.sort();

  console.log(`Found ${leafDirs.length} product directories`);

  if (args.onlyCategories.length) {
    leafDirs = leafDirs.filter((d) => {
      const rel = path.relative(catalogRoot, d);
      const topCategory = rel.split(path.sep)[0];
      return args.onlyCategories.includes(topCategory);
    });
    console.log(`After only-category filter: ${leafDirs.length} directories`);
  }

  if (args.skipCategories.length) {
    leafDirs = leafDirs.filter((d) => {
      const rel = path.relative(catalogRoot, d);
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
    productsCreated: 0,
    productsUpdated: 0,
    variantsCreated: 0,
    variantsUpdated: 0,
    skippedExisting: 0,
    existingProductsMissingVariant: 0,
    filesUploaded: 0,
    skipped: [],
    conflicts: [],
  };

  for (const leafDir of leafDirs) {
    try {
      await processLeafDir(payload, leafDir, uploadCache, args, stats);
    } catch (err) {
      const relDir = path.relative(catalogRoot, leafDir);
      console.error(`ERROR processing ${relDir}:`, err.message);
      stats.skipped.push({ dir: relDir, reason: err.message });
    }
  }

  console.log("\n=== Summary ===");
  console.log(
    JSON.stringify(
      {
        dryRun: args.dryRun,
        mediaSource: path.relative(REPO_ROOT, catalogRoot) || catalogRoot,
        totalDirectories: leafDirs.length,
        productsCreated: stats.productsCreated,
        productsUpdated: stats.productsUpdated,
        variantsCreated: stats.variantsCreated,
        variantsUpdated: stats.variantsUpdated,
        skippedExisting: stats.skippedExisting,
        existingProductsMissingVariant: stats.existingProductsMissingVariant,
        filesUploaded: stats.filesUploaded,
        skipped: stats.skipped.length,
        skippedDetails: stats.skipped,
        conflicts: stats.conflicts.length,
        conflictDetails: stats.conflicts,
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
