// Delete Media records that are NOT referenced anywhere.
//
// A media record is considered SAFE TO DELETE only if it passes ALL three checks:
//   (1) Not referenced by any upload-relation field across collections
//       (Categories.coverImage, Products.image, ProductVariants.{element,
//        space,real}Images.mediaRef, ProductVariants.videos.mediaRef,
//        CustomCapabilities.coverImage, News.coverImage, News.body lexical
//        upload nodes — all locales)
//   (2) Its filename does NOT appear as a substring in JSON.stringify of
//       any doc across the same collections (catches hardcoded R2 URLs
//       stored as text in publicUrl / posterUrl / coverImageUrl / etc.)
//   (3) Its filename does NOT appear in src/, public/, messages/, scripts/
//       (catches hardcoded references in code or static assets)
//
// Default mode: dry-run (prints plan + writes plan to disk).
// Pass `--apply` to actually delete via Payload (the S3 storage plugin
// removes the R2 object + image size variants atomically).
//
// Usage:
//   node --env-file=.env.local scripts/cleanUnusedMedia.mjs
//   node --env-file=.env.local scripts/cleanUnusedMedia.mjs --apply

import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { getPayload } from "payload";

import config from "../src/payload.config.ts";

const APPLY = process.argv.includes("--apply");
const PAGE = 200;

const COLLECTIONS_TO_SCAN = [
  "categories",
  "products",
  "productVariants",
  "customCapabilities",
  "news",
];

async function* iterateCollection(payload, slug) {
  let page = 1;
  while (true) {
    const res = await payload.find({
      collection: slug,
      limit: PAGE,
      page,
      depth: 0,
      pagination: true,
      locale: "all",
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
  if (node.root) collectLexicalUploadIds(node.root, sink);
  if (node.children) collectLexicalUploadIds(node.children, sink);
}

function grepCodebaseForFilenames(filenames) {
  if (filenames.length === 0) return new Set();
  const dir = mkdtempSync(join(tmpdir(), "wayon-media-grep-"));
  const listFile = join(dir, "filenames.txt");
  writeFileSync(listFile, filenames.join("\n"), "utf8");
  // -F: fixed strings, -h: no filename prefix, -o: only matched part,
  //  -r: recursive, -f: pattern file. `|| true` so non-zero exit (no
  //  matches) doesn't blow us up.
  const cmd = `grep -rFho -f "${listFile}" src public messages scripts 2>/dev/null | sort -u || true`;
  const out = execSync(cmd, {
    cwd: process.cwd(),
    maxBuffer: 64 * 1024 * 1024,
  })
    .toString()
    .trim();
  if (!out) return new Set();
  return new Set(out.split("\n").filter(Boolean));
}

async function main() {
  const payload = await getPayload({ config });

  // ── Pass 1: collect relation-referenced IDs and text-blob corpus ──────
  const referencedIds = new Set();
  const textBlobs = []; // { collection, id, blob }

  for (const slug of COLLECTIONS_TO_SCAN) {
    for await (const doc of iterateCollection(payload, slug)) {
      // Per-collection relation fields
      if (slug === "categories") collectIdsFromValue(doc.coverImage, referencedIds);
      if (slug === "products") collectIdsFromValue(doc.image, referencedIds);
      if (slug === "customCapabilities") collectIdsFromValue(doc.coverImage, referencedIds);
      if (slug === "news") {
        collectIdsFromValue(doc.coverImage, referencedIds);
        const body = doc.body;
        if (body && typeof body === "object") {
          if (body.root || Array.isArray(body)) {
            collectLexicalUploadIds(body, referencedIds);
          } else {
            for (const localeKey of Object.keys(body)) {
              collectLexicalUploadIds(body[localeKey], referencedIds);
            }
          }
        }
      }
      if (slug === "productVariants") {
        for (const key of ["elementImages", "spaceImages", "realImages", "videos"]) {
          const arr = doc[key];
          if (Array.isArray(arr)) {
            for (const item of arr) collectIdsFromValue(item?.mediaRef, referencedIds);
          }
        }
      }

      // Whole-doc text blob (every locale, every field) for filename substring search
      try {
        textBlobs.push({ collection: slug, id: doc.id, blob: JSON.stringify(doc) });
      } catch {
        // unserializable — extremely unlikely; skip
      }
    }
  }

  console.log(`Collected ${referencedIds.size} referenced media IDs.`);
  console.log(`Collected ${textBlobs.length} doc text blobs for substring search.`);

  // ── Pass 2: enumerate media, partition into used / candidates ─────────
  const allMedia = [];
  for await (const m of iterateCollection(payload, "media")) {
    allMedia.push(m);
  }

  const candidates = allMedia.filter((m) => !referencedIds.has(String(m.id)));
  const usedByRelation = allMedia.length - candidates.length;
  console.log(
    `Media total: ${allMedia.length}, used by relation: ${usedByRelation}, candidates: ${candidates.length}`,
  );

  // ── Pass 3: filename substring check across all doc text blobs ────────
  const savedByText = []; // { media, hits: [{collection,id}] }
  const stillCandidate = [];
  for (const m of candidates) {
    if (!m.filename) {
      // No filename — keep it, can't verify safely
      savedByText.push({ media: m, hits: [{ collection: "n/a", id: "n/a" }] });
      continue;
    }
    const needle = m.filename;
    const hits = [];
    for (const tb of textBlobs) {
      if (tb.blob.includes(needle)) {
        hits.push({ collection: tb.collection, id: tb.id });
        if (hits.length >= 5) break;
      }
    }
    if (hits.length > 0) savedByText.push({ media: m, hits });
    else stillCandidate.push(m);
  }
  console.log(`Saved by text-blob substring match: ${savedByText.length}`);
  console.log(`Remaining candidates after text check: ${stillCandidate.length}`);

  // ── Pass 4: codebase grep for any remaining filenames ─────────────────
  const remainingFilenames = stillCandidate.map((m) => m.filename).filter(Boolean);
  const codeHits = grepCodebaseForFilenames(remainingFilenames);
  const savedByCode = [];
  const finalUnused = [];
  for (const m of stillCandidate) {
    if (codeHits.has(m.filename)) savedByCode.push(m);
    else finalUnused.push(m);
  }
  console.log(`Saved by codebase grep: ${savedByCode.length}`);
  console.log(`Final unused (will delete with --apply): ${finalUnused.length}`);

  // ── Persist plan to disk for audit ────────────────────────────────────
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const planPath = join(process.cwd(), `unused-media-plan-${stamp}.json`);
  let totalBytes = 0;
  const planRecords = finalUnused.map((m) => {
    if (typeof m.filesize === "number") totalBytes += m.filesize;
    return {
      id: m.id,
      filename: m.filename,
      mimeType: m.mimeType,
      filesize: m.filesize,
      category: m.category,
      url: m.url,
      createdAt: m.createdAt,
    };
  });
  writeFileSync(
    planPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        apply: APPLY,
        totals: {
          mediaTotal: allMedia.length,
          referencedByRelation: usedByRelation,
          savedByTextSubstring: savedByText.length,
          savedByCodeGrep: savedByCode.length,
          toDelete: finalUnused.length,
          toDeleteBytes: totalBytes,
        },
        savedByText: savedByText.slice(0, 50).map(({ media, hits }) => ({
          id: media.id,
          filename: media.filename,
          hits,
        })),
        savedByCode: savedByCode.map((m) => ({ id: m.id, filename: m.filename })),
        toDelete: planRecords,
      },
      null,
      2,
    ),
    "utf8",
  );
  console.log(`Plan written to: ${planPath}`);
  console.log(`Bytes to free: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

  if (!APPLY) {
    console.log("");
    console.log("Dry-run only. Re-run with --apply to actually delete.");
    process.exit(0);
  }

  // ── Pass 5: delete via Payload (storage plugin removes R2 + variants) ─
  console.log("");
  console.log(`Applying deletes for ${finalUnused.length} media records…`);

  const isTransient = (err) => {
    const msg = String(err?.message || err);
    return (
      msg.includes("Connection terminated") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT") ||
      msg.includes("EAI_AGAIN") ||
      msg.includes("read ECONNREFUSED") ||
      msg.includes("Client has encountered a connection error") ||
      msg.includes("terminating connection")
    );
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let ok = 0;
  let fail = 0;
  for (let i = 0; i < finalUnused.length; i++) {
    const m = finalUnused[i];
    let lastErr;
    let succeeded = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await payload.delete({ collection: "media", id: m.id });
        succeeded = true;
        break;
      } catch (err) {
        lastErr = err;
        if (!isTransient(err)) break;
        const backoff = 500 * Math.pow(2, attempt);
        console.warn(
          `  ⚠ transient error on #${m.id} (attempt ${attempt + 1}/5): ${String(err?.message || err).slice(0, 120)} — sleeping ${backoff}ms`,
        );
        await sleep(backoff);
      }
    }
    if (succeeded) {
      ok += 1;
      if (ok % 10 === 0) console.log(`  …deleted ${ok}/${finalUnused.length}`);
    } else {
      fail += 1;
      console.error(
        `  ✗ delete failed for #${m.id} (${m.filename}):`,
        lastErr?.message || lastErr,
      );
    }
    // Gentle throttle to avoid overloading the remote pool / R2
    if ((i + 1) % 20 === 0) await sleep(250);
  }
  console.log("");
  console.log(`Done. Deleted: ${ok}, Failed: ${fail}.`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
