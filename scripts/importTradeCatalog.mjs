import { promises as fs } from "node:fs";
import path from "node:path";

import * as dotenv from "dotenv";
import { getPayload } from "payload";

import {
  extractTradeCode,
  extractTradeDisplayName,
  extractTradeFaceMetadata,
  inferTradeColorGroup,
  inferTradeSize,
  inferTradeThickness,
  normalizeTradeProcess,
} from "../src/features/products/lib/tradeCatalog.ts";
import {
  buildStableTradeFamilyKey,
  buildStableTradeFamilySlug,
} from "../src/features/products/lib/tradeImportIdentity.ts";
import { inferTradeSeriesTypes } from "../src/features/products/content/tradeSeriesMappings.ts";
import { buildTradeMediaPublicUrl } from "../src/features/products/lib/tradeMedia.ts";
import { selectProductCoverUrl } from "../src/features/products/model/productDirectory.ts";

dotenv.config({ path: ".env.local" });

const ROOT_DIR = path.join(process.cwd(), "docs/外贸出口资料");
const CATALOG_ROOT = path.join(ROOT_DIR, "产品/众岩联标准素材集合");
const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  "docs/trade-import-report.json"
);
const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);
const SUPPORTED_VIDEO_EXTENSIONS = new Set([".mp4", ".mov"]);

function parseArgs(argv) {
  // Dry-run is the default to keep the `npm run import:trade-catalog` entry
  // point safe for report-only use. Writes require the explicit --apply flag.
  return {
    dryRun: !argv.includes("--apply"),
    reportPath:
      argv.find((arg) => arg.startsWith("--report="))?.slice("--report=".length) ||
      DEFAULT_REPORT_PATH,
  };
}

function normalizeFamilyName(name) {
  return name.replace(/\s+/g, " ").trim();
}

function mergeMedia(existing = [], imported = []) {
  const merged = [...existing];
  const seen = new Set(existing.map((item) => item.sourcePath || item.publicUrl));

  for (const item of imported) {
    const key = item.sourcePath || item.publicUrl;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    merged.push(item);
  }

  return merged;
}

// Reconstructs each item with only the fields our schema declares, dropping
// Payload's auto-generated array `id` so update calls don't conflict.
function cleanImageArray(items) {
  return (items || [])
    .filter((item) => item && item.sourcePath && item.publicUrl)
    .map((item) => ({
      sourcePath: item.sourcePath,
      publicUrl: item.publicUrl,
      altZh: item.altZh || undefined,
      sortOrder: item.sortOrder ?? 0,
    }));
}

function cleanVideoArray(items) {
  return (items || [])
    .filter((item) => item && item.sourcePath && item.publicUrl)
    .map((item) => ({
      sourcePath: item.sourcePath,
      publicUrl: item.publicUrl,
      posterUrl: item.posterUrl || undefined,
      titleZh: item.titleZh || undefined,
      sortOrder: item.sortOrder ?? 0,
    }));
}

function createImageRecord(sourcePath, basename, sortOrder) {
  return {
    sourcePath,
    publicUrl: buildTradeMediaPublicUrl(sourcePath),
    altZh: basename,
    sortOrder,
  };
}

function createVideoRecord(sourcePath, basename, sortOrder) {
  return {
    sourcePath,
    publicUrl: buildTradeMediaPublicUrl(sourcePath),
    posterUrl: undefined,
    titleZh: basename,
    sortOrder,
  };
}

function isSupportedImage(extension) {
  return SUPPORTED_IMAGE_EXTENSIONS.has(extension.toLowerCase());
}

function isSupportedVideo(extension) {
  return SUPPORTED_VIDEO_EXTENSIONS.has(extension.toLowerCase());
}

function normalizeBasename(input) {
  return input
    .replace(/\.[^.]+$/u, "")
    .replace(/\s+/g, "")
    .replaceAll("（", "(")
    .replaceAll("）", ")")
    .toLowerCase();
}

function classifyMedia(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (isSupportedVideo(extension)) {
    return "videos";
  }

  const normalized = normalizeBasename(path.basename(filePath));

  if (/元素图|素材图/u.test(normalized)) {
    return "elementImages";
  }

  if (/空间图|效果图|空图图/u.test(normalized)) {
    return "spaceImages";
  }

  if (/实拍图|实物图|实物图|实物/u.test(normalized)) {
    return "realImages";
  }

  return isSupportedImage(extension) ? "elementImages" : null;
}

async function collectProductDirectories(dir, report) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const childDirectories = entries.filter((entry) => entry.isDirectory());
  const supportedFiles = entries.filter((entry) => {
    if (!entry.isFile()) {
      return false;
    }

    const extension = path.extname(entry.name).toLowerCase();
    return isSupportedImage(extension) || isSupportedVideo(extension);
  });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!isSupportedImage(extension) && !isSupportedVideo(extension)) {
      const fullPath = path.join(dir, entry.name);
      const sourcePath = path.relative(ROOT_DIR, fullPath).split(path.sep).join("/");

      report.skippedFiles.push({
        sourcePath,
        reason: `Unsupported extension: ${extension || "unknown"}`,
      });
    }
  }

  if (supportedFiles.length > 0 && childDirectories.length === 0) {
    return [dir];
  }

  if (supportedFiles.length > 0 && childDirectories.length > 0) {
    for (const file of supportedFiles) {
      const fullPath = path.join(dir, file.name);
      const sourcePath = path.relative(ROOT_DIR, fullPath).split(path.sep).join("/");

      report.pendingManualReview.push({
        sourcePath,
        reason: "Media file stored above product-folder level",
      });
    }
  }

  const directories = [];

  for (const child of childDirectories) {
    directories.push(
      ...(await collectProductDirectories(path.join(dir, child.name), report))
    );
  }

  return directories;
}

async function readProductDirectory(productDir, report) {
  const entries = await fs.readdir(productDir, { withFileTypes: true });
  const relativeDirectory = path
    .relative(CATALOG_ROOT, productDir)
    .split(path.sep)
    .join("/");
  const segments = relativeDirectory.split("/").filter(Boolean);

  if (segments.length < 4) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "Unexpected product directory depth",
    });
    return null;
  }

  const sizeSegment = segments[1];
  const processSegment = segments[2];
  const productSegment = segments.at(-1);
  const code = extractTradeCode(productSegment);
  const displayName =
    extractTradeDisplayName(productSegment) ||
    extractTradeDisplayName(relativeDirectory);
  const normalizedName = displayName ? normalizeFamilyName(displayName) : null;
  const size = inferTradeSize(sizeSegment || relativeDirectory);
  const thickness = inferTradeThickness(sizeSegment || relativeDirectory);
  const process = normalizeTradeProcess(processSegment || relativeDirectory);
  const { faceCount, facePatternNote } = extractTradeFaceMetadata(productSegment);
  const colorGroup = normalizedName
    ? inferTradeColorGroup(normalizedName) || undefined
    : undefined;
  const seriesTypes = normalizedName
    ? inferTradeSeriesTypes({
        displayName: normalizedName,
        process,
        facePatternNote,
      })
    : [];

  if (!code) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "Missing product code in folder name",
    });
    return null;
  }

  if (!displayName) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "Missing display name in folder name",
    });
  }

  if (!size) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "Missing normalized size",
    });
  }

  if (!process) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "Missing normalized process",
    });
  }

  if (seriesTypes.length === 0) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "Missing series type mapping",
    });
  }

  const variant = {
    code,
    size,
    thickness,
    process,
    colorGroup,
    faceCount,
    facePatternNote,
    seriesTypes,
    elementImages: [],
    spaceImages: [],
    realImages: [],
    videos: [],
  };

  const mediaFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const extension = path.extname(name).toLowerCase();
      return isSupportedImage(extension) || isSupportedVideo(extension);
    })
    .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

  mediaFiles.forEach((fileName, index) => {
    const fullPath = path.join(productDir, fileName);
    const sourcePath = path.relative(ROOT_DIR, fullPath).split(path.sep).join("/");
    const mediaKind = classifyMedia(fullPath);

    if (!mediaKind) {
      report.pendingManualReview.push({
        sourcePath,
        reason: "Unable to classify media kind",
      });
      return;
    }

    const displayTitle = extractTradeDisplayName(fileName) || displayName || fileName;

    if (mediaKind === "videos") {
      variant.videos.push(createVideoRecord(sourcePath, displayTitle, index));
      return;
    }

    variant[mediaKind].push(createImageRecord(sourcePath, displayTitle, index));
  });

  const mediaCount =
    variant.elementImages.length +
    variant.spaceImages.length +
    variant.realImages.length +
    variant.videos.length;

  if (mediaCount === 0) {
    report.pendingManualReview.push({
      sourcePath: relativeDirectory,
      reason: "No supported media found in product folder",
    });
    return null;
  }

  return {
    sourcePath: relativeDirectory,
    displayName: displayName || code,
    normalizedName: normalizedName || code,
    variant,
  };
}

async function collectFamilies(report) {
  const productDirectories = await collectProductDirectories(CATALOG_ROOT, report);
  const families = new Map();

  for (const productDir of productDirectories) {
    const productRecord = await readProductDirectory(productDir, report);

    if (!productRecord) {
      continue;
    }

    const family =
      families.get(productRecord.normalizedName) ||
      {
        normalizedName: productRecord.normalizedName,
        displayName: productRecord.displayName,
        seriesTypes: new Set(),
        variants: new Map(),
      };
    const existingVariant =
      family.variants.get(productRecord.variant.code) ||
      {
        ...productRecord.variant,
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      };

    existingVariant.size = existingVariant.size || productRecord.variant.size;
    existingVariant.thickness =
      existingVariant.thickness || productRecord.variant.thickness;
    existingVariant.process = existingVariant.process || productRecord.variant.process;
    existingVariant.colorGroup =
      existingVariant.colorGroup || productRecord.variant.colorGroup;
    existingVariant.faceCount =
      existingVariant.faceCount || productRecord.variant.faceCount;
    existingVariant.facePatternNote =
      existingVariant.facePatternNote || productRecord.variant.facePatternNote;
    existingVariant.elementImages = mergeMedia(
      existingVariant.elementImages,
      productRecord.variant.elementImages
    );
    existingVariant.spaceImages = mergeMedia(
      existingVariant.spaceImages,
      productRecord.variant.spaceImages
    );
    existingVariant.realImages = mergeMedia(
      existingVariant.realImages,
      productRecord.variant.realImages
    );
    existingVariant.videos = mergeMedia(
      existingVariant.videos,
      productRecord.variant.videos
    );

    for (const seriesType of productRecord.variant.seriesTypes) {
      family.seriesTypes.add(seriesType);
    }

    family.variants.set(productRecord.variant.code, existingVariant);
    families.set(productRecord.normalizedName, family);
  }

  return [...families.values()]
    .map((family) => {
      const variants = [...family.variants.values()].filter((variant) => {
        const mediaCount =
          variant.elementImages.length +
          variant.spaceImages.length +
          variant.realImages.length +
          variant.videos.length;

        return mediaCount > 0;
      });

      if (variants.length === 0) {
        return null;
      }

      const familyKey = buildStableTradeFamilyKey(family.normalizedName);
      const slug = buildStableTradeFamilySlug(family.normalizedName);

      return {
        familyKey,
        normalizedName: family.normalizedName,
        displayName: family.displayName,
        seriesTypes: [...family.seriesTypes],
        slug,
        variants,
      };
    })
    .filter(Boolean);
}

function buildCoverImageUrl(family) {
  return selectProductCoverUrl(
    {
      slug: family.slug,
      seriesTypes: family.seriesTypes,
      coverImageUrl: null,
      variants: family.variants,
    },
    ""
  );
}

function buildLocalizedTitle(existingTitle, familyName) {
  const et =
    existingTitle && typeof existingTitle === "object" ? existingTitle : {};
  return {
    zh: et.zh || familyName,
    en: et.en || familyName,
    es: et.es || et.en || familyName,
    ar: et.ar || et.en || familyName,
    ru: et.ru || et.en || familyName,
  };
}

async function fetchExistingProductsByNormalizedName(payload, normalizedNames) {
  if (normalizedNames.length === 0) return new Map();

  const map = new Map();
  const chunkSize = 100;

  for (let i = 0; i < normalizedNames.length; i += chunkSize) {
    const chunk = normalizedNames.slice(i, i + chunkSize);
    const { docs } = await payload.find({
      collection: "products",
      where: { normalizedName: { in: chunk } },
      limit: chunkSize,
      locale: "all",
      depth: 0,
      overrideAccess: true,
    });
    for (const doc of docs) {
      map.set(doc.normalizedName, doc);
    }
  }

  return map;
}

async function fetchExistingVariantsByProductIds(payload, productIds) {
  if (productIds.length === 0) return new Map();

  const map = new Map();
  const chunkSize = 100;

  for (let i = 0; i < productIds.length; i += chunkSize) {
    const chunk = productIds.slice(i, i + chunkSize);
    const { docs } = await payload.find({
      collection: "productVariants",
      where: { productRef: { in: chunk } },
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    });
    for (const doc of docs) {
      const productRef =
        typeof doc.productRef === "object" ? doc.productRef?.id : doc.productRef;
      map.set(`${productRef}::${doc.code}`, doc);
    }
  }

  return map;
}

function buildProductData(family, existing) {
  const coverImageUrl = buildCoverImageUrl(family) || existing?.coverImageUrl;
  const existingCategory =
    existing?.category && typeof existing.category === "object"
      ? existing.category.id
      : existing?.category;
  const existingCapability =
    existing?.customCapability && typeof existing.customCapability === "object"
      ? existing.customCapability.id
      : existing?.customCapability;
  const existingImage =
    existing?.image && typeof existing.image === "object"
      ? existing.image.id
      : existing?.image;

  return {
    title: buildLocalizedTitle(existing?.title, family.displayName),
    slug: existing?.slug || family.slug,
    normalizedName: family.normalizedName,
    // Imported trade products are publish-ready by definition: they carry
    // canonical names, slugs, and media. Default to true so re-imports never
    // hide previously-visible products. Editors can flip back to false in
    // the admin if a specific family needs to be temporarily hidden.
    published: true,
    category: existingCategory ?? undefined,
    image: existingImage ?? undefined,
    description: existing?.description ?? undefined,
    seriesTypes:
      existing?.seriesTypes && existing.seriesTypes.length > 0
        ? existing.seriesTypes
        : family.seriesTypes,
    catalogMode: existing?.catalogMode || "standard",
    customCapability: existingCapability ?? undefined,
    coverImageUrl: coverImageUrl || undefined,
    coverVideoPosterUrl: existing?.coverVideoPosterUrl ?? undefined,
    thickness: existing?.thickness ?? undefined,
    finish: existing?.finish ?? undefined,
    size: existing?.size ?? undefined,
    featured: existing?.featured ?? false,
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function buildVariantData(family, variant, index, productId, existing) {
  return {
    productRef: productId,
    code: variant.code,
    size: existing?.size || variant.size || undefined,
    thickness: existing?.thickness || variant.thickness || undefined,
    process: existing?.process || variant.process || undefined,
    colorGroup: existing?.colorGroup || variant.colorGroup || undefined,
    faceCount: existing?.faceCount ?? variant.faceCount ?? undefined,
    facePatternNote:
      existing?.facePatternNote || variant.facePatternNote || undefined,
    sortOrder: existing?.sortOrder ?? index,
    elementImages: cleanImageArray(
      mergeMedia(existing?.elementImages, variant.elementImages)
    ),
    spaceImages: cleanImageArray(
      mergeMedia(existing?.spaceImages, variant.spaceImages)
    ),
    realImages: cleanImageArray(
      mergeMedia(existing?.realImages, variant.realImages)
    ),
    videos: cleanVideoArray(mergeMedia(existing?.videos, variant.videos)),
  };
}

async function upsertProduct(payload, family, existingProducts, dryRun) {
  const existing = existingProducts.get(family.normalizedName);
  const data = buildProductData(family, existing);

  if (existing) {
    if (dryRun) return existing.id;
    await payload.update({
      collection: "products",
      id: existing.id,
      data,
      overrideAccess: true,
    });
    return existing.id;
  }

  if (dryRun) return null;
  const created = await payload.create({
    collection: "products",
    data,
    overrideAccess: true,
  });
  return created.id;
}

async function upsertVariant(
  payload,
  family,
  variant,
  index,
  productId,
  existingVariants,
  dryRun
) {
  if (!productId) return;
  const lookupKey = `${productId}::${variant.code}`;
  const existing = existingVariants.get(lookupKey);
  const data = buildVariantData(family, variant, index, productId, existing);

  if (existing) {
    if (dryRun) return;
    await payload.update({
      collection: "productVariants",
      id: existing.id,
      data,
      overrideAccess: true,
    });
    return;
  }

  if (dryRun) return;
  await payload.create({
    collection: "productVariants",
    data,
    overrideAccess: true,
  });
}

async function writeReport(reportPath, payload) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(payload, null, 2), "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: args.dryRun,
    skippedFiles: [],
    pendingManualReview: [],
    families: 0,
    variants: 0,
    images: 0,
    videos: 0,
  };

  const families = await collectFamilies(report);

  report.families = families.length;
  report.variants = families.reduce(
    (total, family) => total + family.variants.length,
    0
  );
  report.images = families.reduce(
    (total, family) =>
      total +
      family.variants.reduce(
        (variantTotal, variant) =>
          variantTotal +
          variant.elementImages.length +
          variant.spaceImages.length +
          variant.realImages.length,
        0
      ),
    0
  );
  report.videos = families.reduce(
    (total, family) =>
      total +
      family.variants.reduce(
        (variantTotal, variant) => variantTotal + variant.videos.length,
        0
      ),
    0
  );

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const normalizedNames = families.map((family) => family.normalizedName);
  const existingProducts = await fetchExistingProductsByNormalizedName(
    payload,
    normalizedNames
  );
  const existingProductIds = [...existingProducts.values()].map((doc) => doc.id);
  const existingVariants = await fetchExistingVariantsByProductIds(
    payload,
    existingProductIds
  );

  let productsWritten = 0;
  let variantsWritten = 0;

  for (const family of families) {
    const productId = await upsertProduct(
      payload,
      family,
      existingProducts,
      args.dryRun
    );

    if (productId) {
      productsWritten += 1;
    }

    for (let i = 0; i < family.variants.length; i += 1) {
      const variant = family.variants[i];
      await upsertVariant(
        payload,
        family,
        variant,
        i,
        productId,
        existingVariants,
        args.dryRun
      );
      variantsWritten += 1;
    }
  }

  report.productsWritten = productsWritten;
  report.variantsWritten = variantsWritten;

  await writeReport(args.reportPath, report);

  console.log(
    JSON.stringify(
      {
        dryRun: report.dryRun,
        reportPath: args.reportPath,
        families: report.families,
        variants: report.variants,
        images: report.images,
        videos: report.videos,
        productsWritten,
        variantsWritten,
        pendingManualReview: report.pendingManualReview.length,
        skippedFiles: report.skippedFiles.length,
      },
      null,
      2
    )
  );

  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
