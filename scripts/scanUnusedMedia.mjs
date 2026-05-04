// One-shot read-only audit: list Media records not referenced by any
// Categories.coverImage, Products.image, ProductVariants.{elementImages,
// spaceImages, realImages, videos}.mediaRef, CustomCapabilities.coverImage,
// or News.coverImage / News.body (lexical upload nodes).
//
// Usage:
//   node --env-file=.env.local scripts/scanUnusedMedia.mjs
//   node --env-file=.env.local scripts/scanUnusedMedia.mjs --json > unused-media.json

import { getPayload } from "payload";
import config from "../src/payload.config.ts";

const wantJson = process.argv.includes("--json");

const PAGE = 200;

async function* iterateCollection(payload, slug, options = {}) {
  let page = 1;
  while (true) {
    const res = await payload.find({
      collection: slug,
      limit: PAGE,
      page,
      depth: 0,
      pagination: true,
      locale: "all",
      ...options,
    });
    for (const doc of res.docs) yield doc;
    if (page >= res.totalPages) break;
    page += 1;
  }
}

function collectIdsFromValue(value, sink) {
  if (value == null) return;
  if (typeof value === "number" || typeof value === "string") {
    sink.add(String(value));
    return;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectIdsFromValue(v, sink);
    return;
  }
  if (typeof value === "object") {
    if ("id" in value && (typeof value.id === "string" || typeof value.id === "number")) {
      sink.add(String(value.id));
    }
  }
}

// Walk a lexical SerializedEditorState looking for upload nodes referencing media.
function collectLexicalUploadIds(node, sink) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    for (const child of node) collectLexicalUploadIds(child, sink);
    return;
  }
  if (node.type === "upload" && node.relationTo === "media") {
    const v = node.value;
    if (v != null) {
      if (typeof v === "object" && "id" in v) sink.add(String(v.id));
      else sink.add(String(v));
    }
  }
  // Recurse common containers.
  if (node.root) collectLexicalUploadIds(node.root, sink);
  if (node.children) collectLexicalUploadIds(node.children, sink);
}

async function main() {
  const payload = await getPayload({ config });

  const used = new Set();

  // Categories.coverImage
  for await (const doc of iterateCollection(payload, "categories")) {
    collectIdsFromValue(doc.coverImage, used);
  }

  // Products.image
  for await (const doc of iterateCollection(payload, "products")) {
    collectIdsFromValue(doc.image, used);
  }

  // ProductVariants — 4 arrays of mediaRef
  for await (const doc of iterateCollection(payload, "productVariants")) {
    for (const key of ["elementImages", "spaceImages", "realImages", "videos"]) {
      const arr = doc[key];
      if (Array.isArray(arr)) {
        for (const item of arr) collectIdsFromValue(item?.mediaRef, used);
      }
    }
  }

  // CustomCapabilities.coverImage
  for await (const doc of iterateCollection(payload, "customCapabilities")) {
    collectIdsFromValue(doc.coverImage, used);
  }

  // News.coverImage + News.body (lexical, all locales)
  for await (const doc of iterateCollection(payload, "news")) {
    collectIdsFromValue(doc.coverImage, used);
    const body = doc.body;
    if (body && typeof body === "object") {
      // depth=0 + locale=all returns localized fields as { zh, en, es, ar }
      if (body.root || Array.isArray(body)) {
        collectLexicalUploadIds(body, used);
      } else {
        for (const localeKey of Object.keys(body)) {
          collectLexicalUploadIds(body[localeKey], used);
        }
      }
    }
  }

  // Now scan all media and bucket unused.
  const unused = [];
  let total = 0;
  for await (const m of iterateCollection(payload, "media")) {
    total += 1;
    if (!used.has(String(m.id))) {
      unused.push({
        id: m.id,
        filename: m.filename,
        mimeType: m.mimeType,
        filesize: m.filesize,
        category: m.category,
        createdAt: m.createdAt,
      });
    }
  }

  if (wantJson) {
    console.log(
      JSON.stringify(
        { totalMedia: total, usedCount: used.size, unusedCount: unused.length, unused },
        null,
        2,
      ),
    );
  } else {
    console.log("");
    console.log(`Total media records:  ${total}`);
    console.log(`Referenced (in use):  ${used.size}`);
    console.log(`Unreferenced:         ${unused.length}`);
    console.log("");

    const byCategory = new Map();
    let unusedBytes = 0;
    for (const m of unused) {
      const cat = m.category || "(none)";
      byCategory.set(cat, (byCategory.get(cat) || 0) + 1);
      if (typeof m.filesize === "number") unusedBytes += m.filesize;
    }

    console.log("Unused by category:");
    for (const [cat, n] of [...byCategory.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat.padEnd(14)} ${n}`);
    }
    console.log("");
    console.log(`Unused total size:    ${(unusedBytes / 1024 / 1024).toFixed(1)} MB`);
    console.log("");

    const sample = unused.slice(0, 30);
    console.log(`Sample (first ${sample.length}):`);
    for (const m of sample) {
      const sizeMb =
        typeof m.filesize === "number" ? (m.filesize / 1024 / 1024).toFixed(2) : "?";
      console.log(
        `  #${String(m.id).padEnd(4)} [${(m.category || "?").padEnd(12)}] ${sizeMb.padStart(7)} MB  ${m.filename}`,
      );
    }
    if (unused.length > sample.length) {
      console.log(`  ... and ${unused.length - sample.length} more`);
    }
    console.log("");
    console.log("Re-run with --json to dump the full list.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
