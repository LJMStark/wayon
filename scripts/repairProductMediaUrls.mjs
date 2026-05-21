#!/usr/bin/env node
// Repair stale product media URLs left from the old Payload local file route.
//
// Usage:
//   node --env-file=.env.local scripts/repairProductMediaUrls.mjs
//   node --env-file=.env.local scripts/repairProductMediaUrls.mjs --apply

import { getPayload } from "payload";

const APPLY = process.argv.includes("--apply");
const RETIRED_PAYLOAD_MEDIA_FILE_PREFIX = "/api/media/file/";
const IMAGE_FIELDS = ["elementImages", "spaceImages", "realImages"];
const MEDIA_FIELDS = [...IMAGE_FIELDS, "videos"];

function isRetiredPayloadMediaFileUrl(value) {
  if (typeof value !== "string") return false;
  if (value.startsWith(RETIRED_PAYLOAD_MEDIA_FILE_PREFIX)) return true;
  if (!value.startsWith("http://") && !value.startsWith("https://")) {
    return false;
  }

  try {
    return new URL(value).pathname.startsWith(RETIRED_PAYLOAD_MEDIA_FILE_PREFIX);
  } catch {
    return false;
  }
}

function readUploadId(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.id === "string") {
    return value.id;
  }
  return value ?? null;
}

function readMediaOriginalUrl(value) {
  if (value && typeof value === "object" && typeof value.url === "string") {
    return value.url;
  }
  return null;
}

function readMediaCardUrl(value) {
  if (!value || typeof value !== "object") return null;

  const cardUrl = value.sizes?.card?.url;
  if (typeof cardUrl === "string" && cardUrl.length > 0) {
    return cardUrl;
  }

  return readMediaOriginalUrl(value);
}

function copyExistingFields(item, fields) {
  const next = {};
  for (const field of fields) {
    if (Object.hasOwn(item, field)) {
      next[field] = item[field];
    }
  }
  return next;
}

function titleForLog(doc) {
  if (typeof doc.title === "string") return doc.title;
  if (doc.title && typeof doc.title === "object") {
    return doc.title.zh || doc.title.en || Object.values(doc.title).find(Boolean) || "";
  }
  return "";
}

function pickReplacementCoverImageUrl(doc) {
  const directImageUrl = readMediaCardUrl(doc.image);
  if (directImageUrl) return directImageUrl;

  for (const field of IMAGE_FIELDS) {
    for (const item of doc[field] ?? []) {
      const url = readMediaCardUrl(item.mediaRef);
      if (url) return url;
    }
  }

  return null;
}

function repairImageItem(item) {
  const next = copyExistingFields(item, [
    "id",
    "mediaRef",
    "sourcePath",
    "publicUrl",
    "altZh",
    "sortOrder",
  ]);
  if (Object.hasOwn(item, "mediaRef")) {
    next.mediaRef = readUploadId(item.mediaRef);
  }

  if (isRetiredPayloadMediaFileUrl(item.publicUrl)) {
    const replacement = readMediaOriginalUrl(item.mediaRef);
    if (replacement) {
      next.publicUrl = replacement;
      return { item: next, changed: true, unresolved: false };
    }
    return { item: next, changed: false, unresolved: true };
  }

  return { item: next, changed: false, unresolved: false };
}

function repairVideoItem(item) {
  const next = copyExistingFields(item, [
    "id",
    "mediaRef",
    "sourcePath",
    "publicUrl",
    "posterUrl",
    "titleZh",
    "sortOrder",
  ]);
  if (Object.hasOwn(item, "mediaRef")) {
    next.mediaRef = readUploadId(item.mediaRef);
  }

  let changed = false;
  let unresolved = false;

  if (isRetiredPayloadMediaFileUrl(item.publicUrl)) {
    const replacement = readMediaOriginalUrl(item.mediaRef);
    if (replacement) {
      next.publicUrl = replacement;
      changed = true;
    } else {
      unresolved = true;
    }
  }

  if (isRetiredPayloadMediaFileUrl(item.posterUrl)) {
    next.posterUrl = null;
    changed = true;
  }

  return { item: next, changed, unresolved };
}

function repairMediaArray(doc, field) {
  let changed = false;
  let unresolved = 0;
  const items = (doc[field] ?? []).map((item) => {
    const result = field === "videos" ? repairVideoItem(item) : repairImageItem(item);
    changed = changed || result.changed;
    unresolved += result.unresolved ? 1 : 0;
    return result.item;
  });

  return { items, changed, unresolved };
}

function buildRepair(doc) {
  const data = {};
  const changes = [];
  let unresolved = 0;

  if (isRetiredPayloadMediaFileUrl(doc.coverImageUrl)) {
    const replacement = pickReplacementCoverImageUrl(doc);
    if (replacement) {
      data.coverImageUrl = replacement;
      changes.push("coverImageUrl");
    } else {
      unresolved++;
    }
  }

  if (isRetiredPayloadMediaFileUrl(doc.coverVideoPosterUrl)) {
    data.coverVideoPosterUrl = null;
    changes.push("coverVideoPosterUrl");
  }

  for (const field of MEDIA_FIELDS) {
    const result = repairMediaArray(doc, field);
    if (result.changed) {
      data[field] = result.items;
      changes.push(field);
    }
    unresolved += result.unresolved;
  }

  return {
    data,
    changes,
    unresolved,
    changed: changes.length > 0,
  };
}

async function findAllProducts(payload) {
  const docs = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await payload.find({
      collection: "products",
      limit: 100,
      page,
      depth: 2,
      locale: "all",
    });
    docs.push(...result.docs);
    totalPages = result.totalPages;
    page += 1;
  } while (page <= totalPages);

  return docs;
}

function incrementCounts(counts, changes) {
  for (const change of changes) {
    counts[change] = (counts[change] ?? 0) + 1;
  }
}

async function main() {
  console.log(`Mode: ${APPLY ? "APPLY" : "DRY-RUN"}\n`);

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });
  const docs = await findAllProducts(payload);

  const counts = {};
  let changedDocs = 0;
  let unresolvedItems = 0;
  let failed = 0;

  for (const doc of docs) {
    const repair = buildRepair(doc);
    unresolvedItems += repair.unresolved;

    if (!repair.changed) {
      continue;
    }

    changedDocs++;
    incrementCounts(counts, repair.changes);
    console.log(
      `${APPLY ? "UPDATE" : "PLAN"} ${doc.slug} ${titleForLog(doc)}: ${repair.changes.join(", ")}`
    );

    if (!APPLY) {
      continue;
    }

    try {
      await payload.update({
        collection: "products",
        id: doc.id,
        data: repair.data,
      });
    } catch (err) {
      failed++;
      console.error(`  FAIL ${doc.slug}: ${err.message}`);
    }
  }

  console.log(`\n=== Summary (${APPLY ? "applied" : "dry-run"}) ===`);
  console.log(`Products scanned:      ${docs.length}`);
  console.log(`Products with changes: ${changedDocs}`);
  for (const field of [
    "coverImageUrl",
    "coverVideoPosterUrl",
    ...MEDIA_FIELDS,
  ]) {
    console.log(`${field.padEnd(22)} ${counts[field] ?? 0}`);
  }
  console.log(`Unresolved stale URLs: ${unresolvedItems}`);
  console.log(`Failed updates:        ${failed}`);

  if (!APPLY) {
    console.log("\nRun with --apply to update the database.");
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
