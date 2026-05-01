#!/usr/bin/env node
/**
 * Generate product marketing copy for remaining products using Gemini API.
 * Uses first-wave hand-written copy as few-shot style examples.
 *
 * Requires:  GEMINI_API_KEY in .env.local
 *
 * Usage:
 *   node --env-file=.env.local scripts/generateProductCopyGemini.mjs          # dry-run
 *   node --env-file=.env.local scripts/generateProductCopyGemini.mjs --apply  # write to DB
 *   node --env-file=.env.local scripts/generateProductCopyGemini.mjs --apply --overwrite
 *   node --env-file=.env.local scripts/generateProductCopyGemini.mjs --slug=some-product-slug
 *   node --env-file=.env.local scripts/generateProductCopyGemini.mjs --limit=10
 *   node --env-file=.env.local scripts/generateProductCopyGemini.mjs --model=gemini-2.5-pro
 */

import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getPayload } from "payload";

import {
  PRODUCT_COPY_LOCALES,
  hasAnyLocalizedDescription,
  validateProductCopyDraft,
} from "../src/features/products/lib/productCopyGeneration.mts";

const GEMINI_BASE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  "docs/copywriting/gemini-drafts.json"
);
const FIRST_WAVE_PATH = path.join(
  process.cwd(),
  "docs/copywriting/first-wave-drafts.json"
);
const DEFAULT_LIMIT = 1000;
const DEFAULT_MAX_IMAGES = 2;
const TRADE_MEDIA_PREFIX = "/api/trade-media/";
const IMAGE_MIME_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
]);

// ── Few-shot examples loaded once at startup ──────────────────────────────

let _fewShotExamples = null;

async function loadFewShotExamples() {
  if (_fewShotExamples) return _fewShotExamples;

  try {
    const raw = await readFile(FIRST_WAVE_PATH, "utf8");
    const data = JSON.parse(raw);
    _fewShotExamples = Array.isArray(data.items) ? data.items.slice(0, 4) : [];
  } catch {
    _fewShotExamples = [];
  }

  return _fewShotExamples;
}

async function loadFirstWaveSlugs() {
  try {
    const raw = await readFile(FIRST_WAVE_PATH, "utf8");
    const data = JSON.parse(raw);
    return new Set(Array.isArray(data.items) ? data.items.map((i) => i.slug) : []);
  } catch {
    return new Set();
  }
}

// ── Argument parsing ──────────────────────────────────────────────────────

function printHelp() {
  console.log(`
Generate product-level localized copy with Gemini API.

Usage:
  node --env-file=.env.local scripts/generateProductCopyGemini.mjs [options]

Options:
  --apply              Write generated description to Payload.
  --overwrite          Process products that already have any description.
  --slug=<slug>        Only process one product (repeatable).
  --limit=<n>          Max published products to read. Default: ${DEFAULT_LIMIT}.
  --max-images=<n>     Max representative product images. Default: ${DEFAULT_MAX_IMAGES}.
  --model=<model>      Gemini model. Default: ${DEFAULT_MODEL}.
  --out=<path>         Report path. Default: ${DEFAULT_REPORT_PATH}.
  --help               Show this help.
`.trim());
}

function parseArgs(argv) {
  const args = {
    apply: false,
    overwrite: false,
    help: false,
    slugs: [],
    limit: DEFAULT_LIMIT,
    maxImages: DEFAULT_MAX_IMAGES,
    model: DEFAULT_MODEL,
    out: DEFAULT_REPORT_PATH,
  };

  for (const arg of argv) {
    if (arg === "--apply") { args.apply = true; continue; }
    if (arg === "--overwrite") { args.overwrite = true; continue; }
    if (arg === "--help" || arg === "-h") { args.help = true; continue; }

    if (arg.startsWith("--slug=")) {
      const slug = arg.slice("--slug=".length).trim();
      if (slug) args.slugs.push(slug);
      continue;
    }
    if (arg.startsWith("--limit=")) {
      args.limit = parsePositiveInt(arg, "--limit");
      continue;
    }
    if (arg.startsWith("--max-images=")) {
      args.maxImages = parsePositiveInt(arg, "--max-images");
      continue;
    }
    if (arg.startsWith("--model=")) {
      const m = arg.slice("--model=".length).trim();
      if (m) args.model = m;
      continue;
    }
    if (arg.startsWith("--out=")) {
      const o = arg.slice("--out=".length).trim();
      if (o) args.out = path.resolve(o);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function parsePositiveInt(arg, name) {
  const raw = arg.slice(`${name}=`.length);
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function assertGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Missing environment variable: GEMINI_API_KEY");
  return key;
}

// ── Payload helpers ───────────────────────────────────────────────────────

function localizedText(value, preferred = ["zh", "en", "es", "ar"]) {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  for (const locale of preferred) {
    const raw = value[locale];
    if (typeof raw === "string" && raw.trim()) return raw.trim();
  }
  return "";
}

function mediaUrl(value) {
  if (!value || typeof value !== "object") return "";
  return typeof value.url === "string" ? value.url : "";
}

function productRefId(value) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && value.id != null) return String(value.id);
  return "";
}

function uniqueValues(values) {
  return Array.from(
    new Set(
      values
        .map((v) => (typeof v === "string" ? v.trim() : ""))
        .filter(Boolean)
    )
  );
}

async function fetchProducts(payload, args) {
  const where =
    args.slugs.length > 0
      ? { and: [{ published: { equals: true } }, { slug: { in: args.slugs } }] }
      : { published: { equals: true } };

  const { docs } = await payload.find({
    collection: "products",
    where,
    locale: "all",
    depth: 2,
    limit: args.limit,
    sort: "sortOrder",
    overrideAccess: true,
  });

  return docs;
}

async function fetchVariantsByProductIds(payload, productIds) {
  if (productIds.length === 0) return new Map();

  const { docs } = await payload.find({
    collection: "productVariants",
    where: { productRef: { in: productIds } },
    limit: 5000,
    sort: "sortOrder",
    depth: 1,
    overrideAccess: true,
  });

  const map = new Map();
  for (const variant of docs) {
    const id = productRefId(variant.productRef);
    if (!id) continue;
    const list = map.get(id) ?? [];
    list.push(variant);
    map.set(id, list);
  }

  for (const list of map.values()) {
    list.sort((a, b) => {
      const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return ao !== bo ? ao - bo : String(a.code ?? "").localeCompare(String(b.code ?? ""));
    });
  }

  return map;
}

function buildProductContext(product, variants) {
  const title = localizedText(product.title);
  const category =
    product.category && typeof product.category === "object"
      ? localizedText(product.category.title)
      : "";

  return {
    id: product.id,
    slug: product.slug,
    title,
    normalizedName: product.normalizedName ?? "",
    variantCodes: uniqueValues(variants.map((v) => v.code)),
    sizes: uniqueValues(variants.map((v) => v.size)),
    thicknesses: uniqueValues(variants.map((v) => v.thickness)),
    processes: uniqueValues(variants.map((v) => v.process)),
    colorGroups: uniqueValues(variants.map((v) => v.colorGroup)),
    forbiddenTerms: uniqueValues([
      category,
      ...(Array.isArray(product.seriesTypes) ? product.seriesTypes : []),
    ]),
  };
}

function imageUrlFromItem(item) {
  if (!item || typeof item !== "object") return "";
  return mediaUrl(item.mediaRef) || item.publicUrl || "";
}

function sortedMediaItems(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const ao = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const bo = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return ao - bo;
  });
}

function selectImageCandidates(product, variants, maxImages) {
  const candidates = [];
  const seen = new Set();

  function add(candidate) {
    const key = candidate.url || candidate.sourcePath;
    if (!key || seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  }

  add({
    role: "cover",
    url: product.coverImageUrl || mediaUrl(product.image),
    sourcePath: "",
  });

  for (const variant of variants) {
    for (const field of ["elementImages", "spaceImages", "realImages"]) {
      for (const item of sortedMediaItems(variant[field]).slice(0, 2)) {
        add({ role: field, url: imageUrlFromItem(item), sourcePath: item.sourcePath || "" });
      }
    }
    if (candidates.length >= maxImages) break;
  }

  return candidates.slice(0, maxImages);
}

// ── Image loading ─────────────────────────────────────────────────────────

function candidateLocalPaths(candidate) {
  const paths = [];

  if (candidate.sourcePath) {
    paths.push(path.resolve(candidate.sourcePath));
    paths.push(path.join(process.cwd(), candidate.sourcePath));
    paths.push(path.join(process.cwd(), "docs", candidate.sourcePath));
  }

  const url = candidate.url || "";
  if (url.startsWith(TRADE_MEDIA_PREFIX)) {
    const parts = url
      .slice(TRADE_MEDIA_PREFIX.length)
      .split("/")
      .map((p) => { try { return decodeURIComponent(p); } catch { return ""; } })
      .filter(Boolean);
    paths.push(path.join(process.cwd(), "docs", ...parts));
  }

  return Array.from(new Set(paths));
}

async function fileExists(filePath) {
  try { await access(filePath); return true; } catch { return false; }
}

async function firstExistingPath(paths) {
  for (const p of paths) { if (await fileExists(p)) return p; }
  return null;
}

async function localImageToInlineData(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = IMAGE_MIME_TYPES.get(ext);
  if (!mimeType) return null;

  const fileStat = await stat(filePath);
  if (!fileStat.isFile() || fileStat.size > 8 * 1024 * 1024) return null;

  const bytes = await readFile(filePath);
  return { mimeType, data: bytes.toString("base64") };
}

async function buildGeminiImageParts(candidates) {
  const parts = [];
  const remoteUrls = [];
  const warnings = [];

  for (const candidate of candidates) {
    const localPath = await firstExistingPath(candidateLocalPaths(candidate));

    if (localPath) {
      let inlineData = null;
      try { inlineData = await localImageToInlineData(localPath); } catch { /* skip */ }
      if (inlineData) {
        parts.push({ inlineData });
        continue;
      }
    }

    const url = candidate.url || "";
    if (/^https?:\/\//iu.test(url)) {
      remoteUrls.push(url);
    } else {
      warnings.push(`No readable image for ${candidate.role}: ${url || candidate.sourcePath}`);
    }
  }

  if (parts.length === 0 && remoteUrls.length === 0) {
    warnings.push("No usable product image was available.");
  }

  return { parts, remoteUrls, warnings };
}

// ── Prompt building ───────────────────────────────────────────────────────

function buildFewShotSection(examples) {
  if (examples.length === 0) return "";

  const lines = [
    "STYLE EXAMPLES (use these as tone and length reference — do NOT copy content):",
  ];

  for (const ex of examples) {
    lines.push(`\nProduct: ${ex.title_zh_existing} (${ex.slug})`);
    lines.push(`zh: ${ex.description.zh}`);
    lines.push(`en: ${ex.description.en}`);
  }

  return lines.join("\n");
}

function buildPrompt(context, remoteUrls, imageWarnings, fewShotExamples) {
  const fewShot = buildFewShotSection(fewShotExamples);

  const imageNote =
    remoteUrls.length > 0
      ? `\nProduct image URLs for visual reference:\n${remoteUrls.map((u) => `  - ${u}`).join("\n")}`
      : "";

  return `
Write product-specific marketing copy for a stone surface product.

RULES:
- Do NOT mention product categories, collection names, or any forbidden term below.
- Do NOT claim certifications, origin, price, or inventory.
- Focus on visible texture, color movement, spatial mood, and project usage.
- Each locale is one continuous paragraph (NO \\n within a paragraph).
- zh: 95–130 Chinese characters, single paragraph, last line ≥7 chars (no orphan words).
- en: 60–85 words, single paragraph, literary but clear.
- es: 65–90 words, single paragraph, natural Spanish (not word-for-word translation).
- ar: 50–70 words, single paragraph, natural Arabic.
- Write naturally for each locale instead of translating.

OUTPUT FORMAT — return only valid JSON, no markdown, no extra text:
{
  "description": {
    "zh": "...",
    "en": "...",
    "es": "...",
    "ar": "..."
  },
  "warnings": []
}

${fewShot}

${imageNote}

Product context:
${JSON.stringify(context, null, 2)}
`.trim();
}

// ── Gemini API call ───────────────────────────────────────────────────────

function extractJsonFromText(text) {
  const trimmed = text.trim();

  // Try direct parse first
  try { return JSON.parse(trimmed); } catch { /* fall through */ }

  // Extract from ```json ... ``` code fence
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) {
    try { return JSON.parse(fenced[1].trim()); } catch { /* fall through */ }
  }

  // Extract first {...} block
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(trimmed.slice(start, end + 1)); } catch { /* fall through */ }
  }

  throw new Error("Could not extract valid JSON from Gemini response.");
}

async function callGemini({ apiKey, model, context, imageParts, remoteUrls, imageWarnings, fewShotExamples }) {
  const textPart = {
    text: buildPrompt(context, remoteUrls, imageWarnings, fewShotExamples),
  };

  const url = `${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [textPart, ...imageParts],
        },
      ],
      generationConfig: {
        // Do NOT use responseSchema — it conflicts with multi-script Unicode content
        // and causes truncated JSON for Arabic/Chinese strings.
        responseMimeType: "application/json",
        maxOutputTokens: 8192,
        temperature: 0.9,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Gemini request failed (${response.status}): ${await response.text()}`
    );
  }

  const body = await response.json();
  const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    const finishReason = body?.candidates?.[0]?.finishReason;
    throw new Error(
      `Gemini response did not include text output. finishReason=${finishReason ?? "unknown"}`
    );
  }

  let parsed;
  try {
    parsed = extractJsonFromText(text);
  } catch (error) {
    throw new Error(`Generated JSON is invalid: ${error.message}\nRaw (first 300 chars): ${text.slice(0, 300)}`);
  }

  const draftWithSources = { ...parsed, sources: [] };
  const validation = validateProductCopyDraft(draftWithSources);
  if (!validation.ok) {
    throw new Error(`Generated JSON shape is invalid: ${validation.errors.join(" ")}`);
  }

  return {
    description: validation.draft.description,
    warnings: parsed.warnings ?? [],
  };
}

// ── Payload write ─────────────────────────────────────────────────────────

function productTitleForLocale(product, locale) {
  return localizedText(product.title, [locale, "en", "zh", "es", "ar"]) || product.slug;
}

async function updateProductDescription(payload, product, description) {
  for (const locale of PRODUCT_COPY_LOCALES) {
    await payload.update({
      collection: "products",
      id: product.id,
      locale,
      data: {
        title: productTitleForLocale(product, locale),
        description: description[locale],
      },
      overrideAccess: true,
    });
  }
}

// ── Report ────────────────────────────────────────────────────────────────

function buildSummary(items) {
  return items.reduce(
    (acc, item) => {
      acc.total += 1;
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    { total: 0 }
  );
}

async function writeReport(filePath, report) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) { printHelp(); return; }

  const apiKey = assertGeminiKey();

  const [firstWaveSlugs, fewShotExamples] = await Promise.all([
    loadFirstWaveSlugs(),
    loadFewShotExamples(),
  ]);

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const allProducts = await fetchProducts(payload, args);

  // Exclude first-wave products (already handled by applyFirstWaveCopy.mjs)
  const products =
    args.slugs.length > 0
      ? allProducts
      : allProducts.filter((p) => !firstWaveSlugs.has(p.slug));

  const variantMap = await fetchVariantsByProductIds(
    payload,
    products.map((p) => p.id)
  );

  const items = [];
  console.log(
    `Mode: ${args.apply ? "APPLY" : "DRY-RUN"}  |  products=${products.length}  |  model=${args.model}`
  );

  for (const product of products) {
    const variants = variantMap.get(product.id) ?? [];
    const context = buildProductContext(product, variants);
    const title = context.title || context.normalizedName || product.slug;

    if (!args.overwrite && hasAnyLocalizedDescription(product.description)) {
      console.log(`  SKIP existing  ${product.slug}`);
      items.push({
        productId: product.id,
        slug: product.slug,
        title,
        status: "skipped_existing_description",
        existingLocales: PRODUCT_COPY_LOCALES.filter((locale) => {
          const v = product.description?.[locale];
          return typeof v === "string" && v.trim().length > 0;
        }),
      });
      continue;
    }

    const imageCandidates = selectImageCandidates(product, variants, args.maxImages);
    const { parts: imageParts, remoteUrls, warnings: imageWarnings } =
      await buildGeminiImageParts(imageCandidates);

    try {
      const draft = await callGemini({
        apiKey,
        model: args.model,
        context,
        imageParts,
        remoteUrls,
        imageWarnings,
        fewShotExamples,
      });

      if (args.apply) {
        await updateProductDescription(payload, product, draft.description);
      }

      const tag = args.apply ? "UPDATED" : "DRAFT";
      console.log(`  ${tag}  ${product.slug} (images: local=${imageParts.length} remote=${remoteUrls.length})`);

      items.push({
        productId: product.id,
        slug: product.slug,
        title,
        status: args.apply ? "updated" : "drafted",
        imageCandidates,
        imageWarnings,
        description: draft.description,
        warnings: [...imageWarnings, ...draft.warnings],
      });
    } catch (error) {
      console.error(`  FAIL  ${product.slug}: ${error.message}`);
      items.push({
        productId: product.id,
        slug: product.slug,
        title,
        status: "failed_generation",
        imageCandidates,
        imageWarnings,
        error: error.message,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    mode: args.apply ? "apply" : "dry-run",
    overwrite: args.overwrite,
    model: args.model,
    locales: PRODUCT_COPY_LOCALES,
    summary: buildSummary(items),
    items,
  };

  await writeReport(args.out, report);
  console.log(`\nReport written: ${args.out}`);

  const summary = report.summary;
  console.log(
    `Summary — total:${summary.total}  drafted:${summary.drafted ?? 0}  updated:${summary.updated ?? 0}  skipped:${summary.skipped_existing_description ?? 0}  failed:${summary.failed_generation ?? 0}`
  );
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryUrl) {
  // pg-pool emits an unhandled 'error' event when the server closes an idle
  // connection. In dry-run mode the pool is never used after the initial
  // product fetch, so this is safe to ignore.
  process.on("uncaughtException", (err) => {
    if (err.message === "Connection terminated unexpectedly") return;
    console.error(err.message);
    process.exit(1);
  });

  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    });
}
