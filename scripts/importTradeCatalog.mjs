import { promises as fs } from "node:fs";
import path from "node:path";

import { createClient } from "@sanity/client";
import * as dotenv from "dotenv";

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
  buildStableTradeProductId,
  buildStableTradeVariantId,
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
const SANITY_BATCH_SIZE = 100;

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-04-03",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function parseArgs(argv) {
  return {
    apply: argv.includes("--apply"),
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
    .replace(/（/g, "(")
    .replace(/）/g, ")")
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
        productId: buildStableTradeProductId(familyKey),
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

function mergeLocalizedTitle(existingTitle, familyName) {
  return {
    en: existingTitle?.en || familyName,
    zh: existingTitle?.zh || familyName,
    es: existingTitle?.es || existingTitle?.en || familyName,
    ar: existingTitle?.ar || existingTitle?.en || familyName,
    ru: existingTitle?.ru || existingTitle?.en || familyName,
  };
}

function chunkItems(items, size) {
  const chunks = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

async function fetchExistingProductsByNormalizedName(normalizedNames) {
  if (!client.config().token || normalizedNames.length === 0) {
    return new Map();
  }

  const documents = [];

  for (const chunk of chunkItems(normalizedNames, SANITY_BATCH_SIZE)) {
    const result = await client.fetch(
      '*[_type == "product" && normalizedName in $normalizedNames]',
      { normalizedNames: chunk }
    );
    documents.push(...result);
  }

  return new Map(documents.map((document) => [document.normalizedName, document]));
}

function buildExistingVariantLookupKey(normalizedName, code) {
  return `${normalizedName}::${code}`;
}

async function fetchExistingVariantsByProductIds(productIds) {
  if (!client.config().token || productIds.length === 0) {
    return new Map();
  }

  const documents = [];

  for (const chunk of chunkItems(productIds, SANITY_BATCH_SIZE)) {
    const result = await client.fetch(
      '*[_type == "productVariant" && productRef._ref in $productIds]{..., "normalizedName": productRef->normalizedName}',
      { productIds: chunk }
    );
    documents.push(...result);
  }

  return new Map(
    documents.map((document) => [
      buildExistingVariantLookupKey(document.normalizedName, document.code),
      document,
    ])
  );
}

function buildProductDocument(family, existingDocuments) {
  const existing = existingDocuments.get(family.normalizedName);
  const coverImageUrl = buildCoverImageUrl(family) || existing?.coverImageUrl;

  return {
    _id: existing?._id || family.productId,
    _type: "product",
    title: mergeLocalizedTitle(existing?.title, family.displayName),
    normalizedName: family.normalizedName,
    slug: { current: existing?.slug?.current || family.slug },
    category: existing?.category,
    image: existing?.image,
    description: existing?.description,
    seriesTypes:
      existing?.seriesTypes && existing.seriesTypes.length > 0
        ? existing.seriesTypes
        : family.seriesTypes,
    catalogMode: existing?.catalogMode || "standard",
    customCapability: existing?.customCapability,
    coverImageUrl: coverImageUrl || undefined,
    coverVideoPosterUrl: existing?.coverVideoPosterUrl,
    thickness: existing?.thickness,
    finish: existing?.finish,
    size: existing?.size,
    featured: existing?.featured ?? false,
    sortOrder: existing?.sortOrder ?? 0,
  };
}

function buildVariantDocument(
  family,
  variant,
  index,
  productId,
  existingDocuments
) {
  const existing = existingDocuments.get(
    buildExistingVariantLookupKey(family.normalizedName, variant.code)
  );
  const variantId =
    existing?._id || buildStableTradeVariantId(family.familyKey, variant.code);

  return {
    _id: variantId,
    _type: "productVariant",
    productRef: {
      _type: "reference",
      _ref: productId,
    },
    code: variant.code,
    size: existing?.size || variant.size,
    thickness: existing?.thickness || variant.thickness,
    process: existing?.process || variant.process,
    colorGroup: existing?.colorGroup || variant.colorGroup,
    faceCount: existing?.faceCount || variant.faceCount,
    facePatternNote: existing?.facePatternNote || variant.facePatternNote,
    sortOrder: existing?.sortOrder ?? index,
    elementImages: mergeMedia(existing?.elementImages, variant.elementImages),
    spaceImages: mergeMedia(existing?.spaceImages, variant.spaceImages),
    realImages: mergeMedia(existing?.realImages, variant.realImages),
    videos: mergeMedia(existing?.videos, variant.videos),
  };
}

async function writeReport(reportPath, payload) {
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, JSON.stringify(payload, null, 2), "utf8");
}

async function commitInBatches(documents) {
  for (const chunk of chunkItems(documents, SANITY_BATCH_SIZE)) {
    await client.mutate(
      chunk.map((document) => ({
        createOrReplace: document,
      }))
    );
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.apply && !process.env.SANITY_API_TOKEN) {
    console.error("Missing SANITY_API_TOKEN in .env.local");
    process.exit(1);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    dryRun: !args.apply,
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

  if (args.apply) {
    const existingProducts = await fetchExistingProductsByNormalizedName(
      families.map((family) => family.normalizedName)
    );
    const existingVariants = await fetchExistingVariantsByProductIds(
      [...existingProducts.values()].map((document) => document._id)
    );
    const productDocuments = families.map((family) =>
      buildProductDocument(family, existingProducts)
    );
    const productIdsByName = new Map(
      productDocuments.map((document) => [document.normalizedName, document._id])
    );
    const variantDocuments = families.flatMap((family) =>
      family.variants.map((variant, index) =>
        buildVariantDocument(
          family,
          variant,
          index,
          productIdsByName.get(family.normalizedName) || family.productId,
          existingVariants
        )
      )
    );

    await commitInBatches(productDocuments);
    await commitInBatches(variantDocuments);
  }

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
        pendingManualReview: report.pendingManualReview.length,
        skippedFiles: report.skippedFiles.length,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
