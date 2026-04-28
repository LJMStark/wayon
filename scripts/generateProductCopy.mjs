#!/usr/bin/env node

import { access, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { getPayload } from "payload";

import {
  PRODUCT_COPY_LOCALES,
  hasAnyLocalizedDescription,
  validateProductCopyDraft,
} from "../src/features/products/lib/productCopyGeneration.mts";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_MODEL = process.env.OPENAI_PRODUCT_COPY_MODEL || "gpt-5.4-mini";
const DEFAULT_REPORT_PATH = path.join(
  process.cwd(),
  "docs/product-copy-drafts.json"
);
const DEFAULT_LIMIT = 1000;
const DEFAULT_MAX_IMAGES = 3;
const TRADE_MEDIA_PREFIX = "/api/trade-media/";
const IMAGE_MIME_TYPES = new Map([
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
]);

function printHelp() {
  console.log(`
Generate product-level localized copy with OpenAI Responses API.

Usage:
  npm run generate:product-copy -- [options]

Options:
  --apply              Write generated description to Payload.
  --overwrite          Process products that already have any description.
  --slug=<slug>        Only process one product. Can be passed more than once.
  --limit=<number>     Max published products to read. Default: ${DEFAULT_LIMIT}.
  --max-images=<n>     Max representative product images. Default: ${DEFAULT_MAX_IMAGES}.
  --model=<model>      OpenAI model. Default: ${DEFAULT_MODEL}.
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
    if (arg === "--apply") {
      args.apply = true;
      continue;
    }

    if (arg === "--overwrite") {
      args.overwrite = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      args.help = true;
      continue;
    }

    if (arg.startsWith("--slug=")) {
      const slug = arg.slice("--slug=".length).trim();
      if (slug) args.slugs.push(slug);
      continue;
    }

    if (arg.startsWith("--limit=")) {
      args.limit = parsePositiveInteger(arg, "--limit");
      continue;
    }

    if (arg.startsWith("--max-images=")) {
      args.maxImages = parsePositiveInteger(arg, "--max-images");
      continue;
    }

    if (arg.startsWith("--model=")) {
      const model = arg.slice("--model=".length).trim();
      if (model) args.model = model;
      continue;
    }

    if (arg.startsWith("--out=")) {
      const out = arg.slice("--out=".length).trim();
      if (out) args.out = path.resolve(out);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function parsePositiveInteger(arg, name) {
  const raw = arg.slice(`${name}=`.length);
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return value;
}

function assertOpenAIKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing environment variable: OPENAI_API_KEY");
  }
  return apiKey;
}

function localizedText(value, preferred = ["zh", "en", "es", "ar"]) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (!value || typeof value !== "object") {
    return "";
  }

  for (const locale of preferred) {
    const raw = value[locale];
    if (typeof raw === "string" && raw.trim()) {
      return raw.trim();
    }
  }

  return "";
}

function mediaUrl(value) {
  if (!value || typeof value !== "object") {
    return "";
  }

  return typeof value.url === "string" ? value.url : "";
}

function productRefId(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (value && typeof value === "object" && value.id != null) {
    return String(value.id);
  }

  return "";
}

async function fetchProducts(payload, args) {
  const where =
    args.slugs.length > 0
      ? {
          and: [
            { published: { equals: true } },
            { slug: { in: args.slugs } },
          ],
        }
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
  if (productIds.length === 0) {
    return new Map();
  }

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
    const variants = map.get(id) ?? [];
    variants.push(variant);
    map.set(id, variants);
  }

  for (const variants of map.values()) {
    variants.sort((left, right) => {
      const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return String(left.code ?? "").localeCompare(String(right.code ?? ""));
    });
  }

  return map;
}

function uniqueValues(values) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
    )
  );
}

function buildProductContext(product, variants) {
  const title = localizedText(product.title);
  const category = product.category && typeof product.category === "object"
    ? localizedText(product.category.title)
    : "";

  return {
    id: product.id,
    slug: product.slug,
    title,
    normalizedName: product.normalizedName ?? "",
    variantCodes: uniqueValues(variants.map((variant) => variant.code)),
    sizes: uniqueValues(variants.map((variant) => variant.size)),
    thicknesses: uniqueValues(variants.map((variant) => variant.thickness)),
    processes: uniqueValues(variants.map((variant) => variant.process)),
    colorGroups: uniqueValues(variants.map((variant) => variant.colorGroup)),
    forbiddenTerms: uniqueValues([
      category,
      ...(Array.isArray(product.seriesTypes) ? product.seriesTypes : []),
    ]),
  };
}

function addImageCandidate(candidates, seen, candidate) {
  const key = candidate.url || candidate.sourcePath;
  if (!key || seen.has(key)) return;
  seen.add(key);
  candidates.push(candidate);
}

function imageUrlFromItem(item) {
  if (!item || typeof item !== "object") {
    return "";
  }

  return mediaUrl(item.mediaRef) || item.publicUrl || "";
}

function sortedMediaItems(items) {
  return [...(Array.isArray(items) ? items : [])].sort((left, right) => {
    const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
}

function selectImageCandidates(product, variants, maxImages) {
  const candidates = [];
  const seen = new Set();

  addImageCandidate(candidates, seen, {
    role: "cover",
    url: product.coverImageUrl || mediaUrl(product.image),
    sourcePath: "",
  });

  for (const variant of variants) {
    for (const mediaField of ["elementImages", "spaceImages", "realImages"]) {
      for (const item of sortedMediaItems(variant[mediaField]).slice(0, 2)) {
        addImageCandidate(candidates, seen, {
          role: mediaField,
          url: imageUrlFromItem(item),
          sourcePath: item.sourcePath || "",
        });
      }
    }

    if (candidates.length >= maxImages) {
      break;
    }
  }

  return candidates.slice(0, maxImages);
}

function isRemoteImageUrl(url) {
  if (!/^https?:\/\//iu.test(url)) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return !["localhost", "127.0.0.1", "::1"].includes(parsed.hostname);
  } catch {
    return false;
  }
}

function candidateLocalPaths(candidate) {
  const paths = [];

  if (candidate.sourcePath) {
    paths.push(path.resolve(candidate.sourcePath));
    paths.push(path.join(process.cwd(), candidate.sourcePath));
    paths.push(path.join(process.cwd(), "docs", candidate.sourcePath));
    paths.push(
      path.join(process.cwd(), "docs", "外贸出口资料", candidate.sourcePath)
    );
  }

  const url = candidate.url || "";
  if (url.startsWith(TRADE_MEDIA_PREFIX)) {
    const parts = url
      .slice(TRADE_MEDIA_PREFIX.length)
      .split("/")
      .map((part) => {
        try {
          return decodeURIComponent(part);
        } catch {
          return "";
        }
      })
      .filter(Boolean);

    paths.push(path.join(process.cwd(), "docs", ...parts));
    paths.push(path.join(process.cwd(), ...parts));
  }

  return Array.from(new Set(paths));
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function firstExistingPath(paths) {
  for (const filePath of paths) {
    if (await fileExists(filePath)) {
      return filePath;
    }
  }

  return null;
}

async function localImageToDataUrl(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = IMAGE_MIME_TYPES.get(extension);
  if (!mimeType) {
    return null;
  }

  const fileStat = await stat(filePath);
  if (!fileStat.isFile() || fileStat.size > 10 * 1024 * 1024) {
    return null;
  }

  const bytes = await readFile(filePath);
  return `data:${mimeType};base64,${bytes.toString("base64")}`;
}

async function buildImageInputs(candidates) {
  const inputImages = [];
  const warnings = [];

  for (const candidate of candidates) {
    if (candidate.url && isRemoteImageUrl(candidate.url)) {
      inputImages.push({
        type: "input_image",
        image_url: candidate.url,
        detail: "low",
      });
      continue;
    }

    const localPath = await firstExistingPath(candidateLocalPaths(candidate));
    if (!localPath) {
      warnings.push(
        `No readable local image for ${candidate.role}: ${candidate.url || candidate.sourcePath}`
      );
      continue;
    }

    let dataUrl = null;
    try {
      dataUrl = await localImageToDataUrl(localPath);
    } catch (error) {
      warnings.push(`Unable to read image ${localPath}: ${error.message}`);
      continue;
    }

    if (!dataUrl) {
      warnings.push(`Unsupported or oversized image skipped: ${localPath}`);
      continue;
    }

    inputImages.push({
      type: "input_image",
      image_url: dataUrl,
      detail: "low",
    });
  }

  if (inputImages.length === 0) {
    warnings.push("No usable product image was supplied to the model.");
  }

  return { inputImages, warnings };
}

function buildPrompt(context, imageWarningCount) {
  return `
Write product-specific marketing copy for a stone surface product.

Use the product name, variant data, product imagery, and web search findings. Search the web for the product name, normalized name, variant codes, and ZYL/Wayon context when useful.

Do not mention product categories, collection names, or any forbidden term listed below. Do not claim certifications, origin, price, inventory, test reports, delivery time, or exclusive performance unless the provided data or search results directly support it.

Focus on visible texture, color movement, spatial mood, fabrication fit, and project usage. Write naturally for each locale instead of translating word-for-word.

Return strict JSON with:
- description.zh
- description.en
- description.es
- description.ar
- sources: web sources used, with title and url
- warnings: short review notes for anything uncertain

Each description should be one paragraph or two short paragraphs separated by a newline. Keep each locale concise.

Product context:
${JSON.stringify({ ...context, imageWarningCount }, null, 2)}
`.trim();
}

function responseOutputText(response) {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  for (const item of response.output ?? []) {
    if (item?.type !== "message" || !Array.isArray(item.content)) {
      continue;
    }

    for (const content of item.content) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        return content.text;
      }
    }
  }

  return "";
}

function extractSources(value, sources = []) {
  if (!value || typeof value !== "object") {
    return sources;
  }

  if (Array.isArray(value)) {
    for (const item of value) extractSources(item, sources);
    return sources;
  }

  const record = value;
  const url = record.url;
  const title = record.title || record.name || record.source;
  if (typeof url === "string" && /^https?:\/\//iu.test(url)) {
    sources.push({
      title: typeof title === "string" && title.trim() ? title.trim() : url,
      url,
    });
  }

  for (const nested of Object.values(record)) {
    extractSources(nested, sources);
  }

  return sources;
}

function mergeSources(...sourceLists) {
  const merged = [];
  const seen = new Set();

  for (const sources of sourceLists) {
    for (const source of sources) {
      if (!source.url || seen.has(source.url)) continue;
      seen.add(source.url);
      merged.push(source);
    }
  }

  return merged;
}

async function callOpenAI({
  apiKey,
  model,
  context,
  inputImages,
  imageWarningCount,
}) {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      tools: [{ type: "web_search" }],
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: buildPrompt(context, imageWarningCount),
            },
            ...inputImages,
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "product_copy_draft",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["description", "sources", "warnings"],
            properties: {
              description: {
                type: "object",
                additionalProperties: false,
                required: ["zh", "en", "es", "ar"],
                properties: {
                  zh: { type: "string" },
                  en: { type: "string" },
                  es: { type: "string" },
                  ar: { type: "string" },
                },
              },
              sources: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  required: ["title", "url"],
                  properties: {
                    title: { type: "string" },
                    url: { type: "string" },
                  },
                },
              },
              warnings: {
                type: "array",
                items: { type: "string" },
              },
            },
          },
        },
      },
      max_output_tokens: 2400,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `OpenAI request failed (${response.status}): ${await response.text()}`
    );
  }

  const body = await response.json();
  const outputText = responseOutputText(body);
  if (!outputText) {
    throw new Error("OpenAI response did not include output text.");
  }

  let parsed;
  try {
    parsed = JSON.parse(outputText);
  } catch (error) {
    throw new Error(`Generated JSON is invalid: ${error.message}`);
  }

  const validation = validateProductCopyDraft(parsed);
  if (!validation.ok) {
    throw new Error(`Generated JSON shape is invalid: ${validation.errors.join(" ")}`);
  }

  const responseSources = extractSources(body);
  const sources = mergeSources(validation.draft.sources, responseSources);
  const warnings = [...validation.draft.warnings];
  if (sources.length === 0) {
    warnings.push("No web source URL was returned by the model.");
  }

  return {
    description: validation.draft.description,
    sources,
    warnings,
  };
}

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

function buildSummary(items) {
  return items.reduce(
    (summary, item) => {
      summary.total += 1;
      summary[item.status] = (summary[item.status] ?? 0) + 1;
      return summary;
    },
    { total: 0 }
  );
}

async function writeReport(filePath, report) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(report, null, 2), "utf8");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const apiKey = assertOpenAIKey();
  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  const products = await fetchProducts(payload, args);
  const variantMap = await fetchVariantsByProductIds(
    payload,
    products.map((product) => product.id)
  );

  const items = [];
  console.log(
    `Mode: ${args.apply ? "APPLY" : "DRY-RUN"}; products=${products.length}; model=${args.model}`
  );

  for (const product of products) {
    const variants = variantMap.get(product.id) ?? [];
    const context = buildProductContext(product, variants);
    const title = context.title || context.normalizedName || product.slug;

    if (!args.overwrite && hasAnyLocalizedDescription(product.description)) {
      console.log(`  SKIP existing copy: ${product.slug}`);
      items.push({
        productId: product.id,
        slug: product.slug,
        title,
        status: "skipped_existing_description",
        existingLocales: PRODUCT_COPY_LOCALES.filter((locale) => {
          const value = product.description?.[locale];
          return typeof value === "string" && value.trim().length > 0;
        }),
      });
      continue;
    }

    const imageCandidates = selectImageCandidates(product, variants, args.maxImages);
    const { inputImages, warnings: imageWarnings } =
      await buildImageInputs(imageCandidates);

    try {
      const draft = await callOpenAI({
        apiKey,
        model: args.model,
        context,
        inputImages,
        imageWarningCount: imageWarnings.length,
      });

      if (args.apply) {
        await updateProductDescription(payload, product, draft.description);
      }

      console.log(
        `  ${args.apply ? "UPDATED" : "DRAFT"} ${product.slug} (${inputImages.length} image)`
      );
      items.push({
        productId: product.id,
        slug: product.slug,
        title,
        status: args.apply ? "updated" : "drafted",
        imageCandidates,
        imageWarnings,
        description: draft.description,
        sources: draft.sources,
        warnings: [...imageWarnings, ...draft.warnings],
      });
    } catch (error) {
      console.error(`  FAIL ${product.slug}: ${error.message}`);
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
  console.log(`Report written: ${args.out}`);
}

const entryUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : "";
if (import.meta.url === entryUrl) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
