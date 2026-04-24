#!/usr/bin/env node

import { promises as fs } from "node:fs";
import path from "node:path";

import { getPayload } from "payload";

import { inferTradeSeriesTypes } from "../src/features/products/content/tradeSeriesMappings.ts";
import {
  extractTradeCode,
  extractTradeDisplayName,
  extractTradeFaceMetadata,
  inferTradeColorGroup,
  inferTradeSize,
  inferTradeThickness,
  normalizeTradeProcess,
} from "../src/features/products/lib/tradeCatalog.ts";
import { buildTradeMediaPublicUrl } from "../src/features/products/lib/tradeMedia.ts";
import { chineseSlugify } from "../src/lib/slugify.ts";

const DOCS_ROOT = path.join(process.cwd(), "docs");
const MATERIAL_ROOT_NAME = "4.22";
const MATERIAL_ROOT = path.join(DOCS_ROOT, MATERIAL_ROOT_NAME);
const TRADE_MEDIA_ROOT = path.join(DOCS_ROOT, "外贸出口资料");
const TRADE_MEDIA_ALIAS = path.join(TRADE_MEDIA_ROOT, MATERIAL_ROOT_NAME);
const REPORT_PATH = path.join(DOCS_ROOT, "4.22-sample-import-report.json");

const DEFAULT_PRODUCT_DIRS = [
  "特定厚度/800×2600×9mm/精雕/LV826Y053JD意大利灰洞",
  "特定厚度/800×2600×9mm/精雕/LV826Y027JD南美柚木细纹米白",
];

const SUPPORTED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
]);
const SUPPORTED_VIDEO_EXTENSIONS = new Set([".mp4", ".mov"]);

async function loadLocalEnv() {
  const envPath = path.join(process.cwd(), ".env.local");

  try {
    const raw = await fs.readFile(envPath, "utf8");

    for (const line of raw.split(/\r?\n/u)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const index = trimmed.indexOf("=");

      if (index === -1) {
        continue;
      }

      const key = trimmed.slice(0, index).trim();
      const value = trimmed
        .slice(index + 1)
        .trim()
        .replace(/^['"]|['"]$/g, "");

      if (key && process.env[key] == null) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }
}

function parseArgs(argv) {
  const productDirs = argv
    .filter((arg) => arg.startsWith("--product="))
    .map((arg) => arg.slice("--product=".length))
    .filter(Boolean);

  return {
    apply: argv.includes("--apply"),
    productDirs: productDirs.length > 0 ? productDirs : DEFAULT_PRODUCT_DIRS,
  };
}

function localized(value) {
  return {
    zh: value,
    en: value,
    es: value,
    ar: value,
    ru: value,
  };
}

function normalizePathForUrl(value) {
  return value.split(path.sep).join("/");
}

function mediaKindFor(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  const normalized = fileName
    .replace(/\.[^.]+$/u, "")
    .replace(/\s+/g, "")
    .replaceAll("（", "(")
    .replaceAll("）", ")");

  if (SUPPORTED_VIDEO_EXTENSIONS.has(extension)) {
    return "videos";
  }

  if (!SUPPORTED_IMAGE_EXTENSIONS.has(extension)) {
    return null;
  }

  if (/元素图|素材图/u.test(normalized)) {
    return "elementImages";
  }

  if (/空间图|效果图|空图/u.test(normalized)) {
    return "spaceImages";
  }

  if (/实拍图|实物图|实物/u.test(normalized)) {
    return "realImages";
  }

  return "elementImages";
}

function buildImageRecord(sourcePath, fallbackAlt, sortOrder) {
  return {
    sourcePath,
    publicUrl: buildTradeMediaPublicUrl(sourcePath),
    altZh: fallbackAlt,
    sortOrder,
  };
}

function buildVideoRecord(sourcePath, fallbackTitle, sortOrder) {
  return {
    sourcePath,
    publicUrl: buildTradeMediaPublicUrl(sourcePath),
    titleZh: fallbackTitle,
    sortOrder,
  };
}

function stripArrayIds(items = []) {
  return items.map((item) => {
    const { id: _id, ...rest } = item;
    return rest;
  });
}

function mergeMedia(existing = [], imported = []) {
  const merged = stripArrayIds(existing);
  const seen = new Set(merged.map((item) => item.sourcePath || item.publicUrl));

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

function pickSize(segments) {
  for (const segment of segments) {
    const size = inferTradeSize(segment);
    if (size) return size;
  }

  return null;
}

function pickThickness(segments) {
  for (const segment of segments) {
    const thickness = inferTradeThickness(segment);
    if (thickness) return thickness;
  }

  return null;
}

function pickProcess(segments) {
  for (const segment of [...segments].reverse()) {
    const process = normalizeTradeProcess(segment);
    if (process) return process;
  }

  return null;
}

function inferSeriesTypes(displayName, process, facePatternNote) {
  const inferred = inferTradeSeriesTypes({
    displayName,
    process,
    facePatternNote,
  });

  if (inferred.length > 0) {
    return inferred;
  }

  if (/木|胡桃|柚木|橡木|香樟|檀木/u.test(displayName)) {
    return ["木纹岩板"];
  }

  if (/洞/u.test(displayName)) {
    return ["洞石岩板"];
  }

  return ["名石岩板"];
}

function buildSlug(code, displayName) {
  return chineseSlugify(`${code} ${displayName}`);
}

async function ensureTradeMediaAlias() {
  await fs.mkdir(TRADE_MEDIA_ROOT, { recursive: true });

  try {
    const stat = await fs.lstat(TRADE_MEDIA_ALIAS);

    if (!stat.isSymbolicLink()) {
      throw new Error(
        `${TRADE_MEDIA_ALIAS} already exists and is not a symlink.`
      );
    }

    const target = await fs.readlink(TRADE_MEDIA_ALIAS);
    const resolved = path.resolve(path.dirname(TRADE_MEDIA_ALIAS), target);

    if (resolved !== MATERIAL_ROOT) {
      throw new Error(
        `${TRADE_MEDIA_ALIAS} points to ${resolved}, expected ${MATERIAL_ROOT}.`
      );
    }

    return;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  await fs.symlink(path.relative(TRADE_MEDIA_ROOT, MATERIAL_ROOT), TRADE_MEDIA_ALIAS);
}

async function readProductDirectory(relativeProductDir) {
  const absoluteProductDir = path.join(MATERIAL_ROOT, relativeProductDir);
  const entries = await fs.readdir(absoluteProductDir, { withFileTypes: true });
  const mediaFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => {
      const extension = path.extname(name).toLowerCase();
      return (
        SUPPORTED_IMAGE_EXTENSIONS.has(extension) ||
        SUPPORTED_VIDEO_EXTENSIONS.has(extension)
      );
    })
    .sort((left, right) => left.localeCompare(right, "zh-Hans-CN"));

  const segments = relativeProductDir.split("/").filter(Boolean);
  const productSegment = segments.at(-1);
  const code = extractTradeCode(productSegment);
  const displayName = extractTradeDisplayName(productSegment);

  if (!code || !displayName) {
    throw new Error(`Cannot parse product code/name from ${relativeProductDir}`);
  }

  const size = pickSize(segments);
  const thickness = pickThickness(segments);
  const process = pickProcess(segments);
  const { faceCount, facePatternNote } = extractTradeFaceMetadata(productSegment);
  const colorGroup = inferTradeColorGroup(displayName);
  const seriesTypes = inferSeriesTypes(displayName, process, facePatternNote);

  const variant = {
    code,
    size,
    thickness,
    process,
    colorGroup,
    faceCount,
    facePatternNote,
    elementImages: [],
    spaceImages: [],
    realImages: [],
    videos: [],
  };

  for (let index = 0; index < mediaFiles.length; index += 1) {
    const fileName = mediaFiles[index];
    const kind = mediaKindFor(fileName);

    if (!kind) {
      continue;
    }

    const sourcePath = normalizePathForUrl(
      path.join(MATERIAL_ROOT_NAME, relativeProductDir, fileName)
    );
    const mediaTitle = extractTradeDisplayName(fileName) || displayName;

    if (kind === "videos") {
      variant.videos.push(buildVideoRecord(sourcePath, mediaTitle, index));
    } else {
      variant[kind].push(buildImageRecord(sourcePath, mediaTitle, index));
    }
  }

  const imageCount =
    variant.elementImages.length +
    variant.spaceImages.length +
    variant.realImages.length;

  if (imageCount === 0 && variant.videos.length === 0) {
    throw new Error(`No supported media in ${relativeProductDir}`);
  }

  return {
    sourcePath: relativeProductDir,
    categoryTitle: segments[0] || "4.22素材",
    title: displayName,
    normalizedName: `${MATERIAL_ROOT_NAME}:${displayName}`,
    slug: buildSlug(code, displayName),
    seriesTypes,
    coverImageUrl:
      variant.spaceImages[0]?.publicUrl ||
      variant.elementImages[0]?.publicUrl ||
      variant.realImages[0]?.publicUrl,
    variant,
  };
}

async function findBySlug(payload, collection, slug) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    locale: "all",
    depth: 0,
    overrideAccess: true,
  });

  return docs[0] ?? null;
}

async function upsertCategory(payload, title, apply) {
  const slug = chineseSlugify(`4.22 ${title}`);
  const existing = await findBySlug(payload, "categories", slug);
  const data = {
    title: localized(title),
    slug,
    sortOrder: 4220,
  };

  if (!apply) {
    return existing?.id ?? null;
  }

  if (existing) {
    const updated = await payload.update({
      collection: "categories",
      id: existing.id,
      data,
      locale: "all",
      overrideAccess: true,
    });
    return updated.id;
  }

  const created = await payload.create({
    collection: "categories",
    data,
    locale: "all",
    overrideAccess: true,
  });

  return created.id;
}

async function findProductByNormalizedName(payload, normalizedName) {
  const { docs } = await payload.find({
    collection: "products",
    where: { normalizedName: { equals: normalizedName } },
    limit: 1,
    locale: "all",
    depth: 0,
    overrideAccess: true,
  });

  return docs[0] ?? null;
}

async function upsertProduct(payload, product, categoryId, apply) {
  const existing = await findProductByNormalizedName(
    payload,
    product.normalizedName
  );
  const data = {
    title: localized(product.title),
    slug: product.slug,
    normalizedName: product.normalizedName,
    published: true,
    category: categoryId || undefined,
    seriesTypes: product.seriesTypes,
    catalogMode: "standard",
    coverImageUrl: product.coverImageUrl,
    sortOrder: 4220,
  };

  if (!apply) {
    return existing?.id ?? null;
  }

  if (existing) {
    const updated = await payload.update({
      collection: "products",
      id: existing.id,
      data,
      locale: "all",
      overrideAccess: true,
    });
    return updated.id;
  }

  const created = await payload.create({
    collection: "products",
    data,
    locale: "all",
    overrideAccess: true,
  });

  return created.id;
}

async function findVariant(payload, productId, code) {
  const { docs } = await payload.find({
    collection: "productVariants",
    where: {
      and: [
        { productRef: { equals: productId } },
        { code: { equals: code } },
      ],
    },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  });

  return docs[0] ?? null;
}

async function upsertVariant(payload, productId, variant, index, apply) {
  if (!productId) {
    return null;
  }

  const existing = await findVariant(payload, productId, variant.code);
  const data = {
    productRef: productId,
    code: variant.code,
    size: variant.size || undefined,
    thickness: variant.thickness || undefined,
    process: variant.process || undefined,
    colorGroup: variant.colorGroup || undefined,
    faceCount: variant.faceCount || undefined,
    facePatternNote: variant.facePatternNote || undefined,
    sortOrder: index,
    elementImages: mergeMedia(existing?.elementImages, variant.elementImages),
    spaceImages: mergeMedia(existing?.spaceImages, variant.spaceImages),
    realImages: mergeMedia(existing?.realImages, variant.realImages),
    videos: mergeMedia(existing?.videos, variant.videos),
  };

  if (!apply) {
    return existing?.id ?? null;
  }

  if (existing) {
    const updated = await payload.update({
      collection: "productVariants",
      id: existing.id,
      data,
      overrideAccess: true,
    });
    return updated.id;
  }

  const created = await payload.create({
    collection: "productVariants",
    data,
    overrideAccess: true,
  });

  return created.id;
}

async function writeReport(report) {
  await fs.writeFile(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  await loadLocalEnv();
  await ensureTradeMediaAlias();

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });
  const products = [];

  for (const productDir of args.productDirs) {
    products.push(await readProductDirectory(productDir));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    apply: args.apply,
    products: [],
  };

  for (let index = 0; index < products.length; index += 1) {
    const product = products[index];
    const categoryId = await upsertCategory(
      payload,
      product.categoryTitle,
      args.apply
    );
    const productId = await upsertProduct(payload, product, categoryId, args.apply);
    const variantId = await upsertVariant(
      payload,
      productId,
      product.variant,
      index,
      args.apply
    );

    report.products.push({
      title: product.title,
      slug: product.slug,
      normalizedName: product.normalizedName,
      sourcePath: product.sourcePath,
      categoryTitle: product.categoryTitle,
      productId,
      variantId,
      variantCode: product.variant.code,
      size: product.variant.size,
      thickness: product.variant.thickness,
      process: product.variant.process,
      colorGroup: product.variant.colorGroup,
      seriesTypes: product.seriesTypes,
      media: {
        elementImages: product.variant.elementImages.length,
        spaceImages: product.variant.spaceImages.length,
        realImages: product.variant.realImages.length,
        videos: product.variant.videos.length,
      },
      coverImageUrl: product.coverImageUrl,
      detailUrl: `/zh/products/${product.slug}`,
    });
  }

  await writeReport(report);

  console.log(
    JSON.stringify(
      {
        apply: args.apply,
        reportPath: REPORT_PATH,
        imported: report.products.length,
        products: report.products.map((product) => ({
          title: product.title,
          slug: product.slug,
          detailUrl: product.detailUrl,
          media: product.media,
        })),
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
