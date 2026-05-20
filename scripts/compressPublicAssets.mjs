// One-shot: compress committed /public/assets raster images.
// - JPEG: resize + mozjpeg recompress in place (filename unchanged).
// - PNG photos (no alpha, referenced only via <Image> in JS/TS): convert to WebP.
// - PNG used in CSS backgrounds: recompress in place as PNG (filename unchanged).
// - Verified orphans: removed.
// Originals are backed up to /.image-backups/ (gitignored) BEFORE first write; idempotent.
// Dry-run by default. Pass --apply to write.
import sharp from "sharp";
import { execSync } from "node:child_process";
import { statSync, mkdirSync, copyFileSync, writeFileSync, existsSync, rmSync } from "node:fs";
import path from "node:path";

const APPLY = process.argv.includes("--apply");
const ROOT = process.cwd();
const BACKUP_ROOT = path.join(ROOT, ".image-backups");
const MAX_EDGE = 2560;
const FALLBACK_MAX_EDGE = 1280;
const JPEG_Q = 80;
const WEBP_Q = 80;
const MIN_BYTES = 250 * 1024; // skip already-small files unless oversized

// PNG photos (no alpha) referenced only through <Image> in JS/TS -> convert to WebP.
const CONVERT_TO_WEBP = new Set([
  "public/assets/cases/case-1-weihao-hotel.png",
  "public/assets/cases/case-2-guangzhou-yuehai-land.png",
  "public/assets/cases/case-3-qingyu-garden-hotel.png",
  "public/assets/cases/case-5-weihao-partyk.png",
  "public/assets/cases/case-6-yuehai-yungang-city.png",
  "public/assets/about/zyl-global-pavilion.png",
  "public/assets/about/zyl-fashion-pavilion.png",
  "public/assets/about/zyl-aesthetic-pavilion.png",
  "public/assets/about/zyl-global-opening-ribbon-cutting.png",
  "public/assets/hero/hero-zyl-global.png",
]);

// Verified unused (code uses the .jpg variant or nothing) -> delete.
const ORPHANS = new Set([
  "public/assets/cases/case-4-lincheng-shanshui-hotel.png",
  "public/assets/about/guangzhou.png",
  "public/assets/hero/hero-lifestyle-slab.png",
]);

const kb = (n) => `${Math.round(n / 1024)}KB`;

function backupOnce(rel) {
  const dest = path.join(BACKUP_ROOT, rel);
  if (existsSync(dest)) return; // never overwrite a pristine backup on re-run
  mkdirSync(path.dirname(dest), { recursive: true });
  copyFileSync(path.join(ROOT, rel), dest);
}

const files = execSync("git ls-files public/assets", { encoding: "utf8" })
  .split("\n")
  .filter((f) => /\.(jpe?g|png)$/i.test(f));

let before = 0;
let after = 0;
const rows = [];

for (const rel of files) {
  const abs = path.join(ROOT, rel);
  const size = statSync(abs).size;

  if (ORPHANS.has(rel)) {
    before += size;
    rows.push({ rel, from: kb(size), to: "DELETE (orphan)", note: "" });
    if (APPLY) {
      backupOnce(rel);
      rmSync(abs);
    }
    continue;
  }

  let meta;
  try {
    meta = await sharp(abs).metadata();
  } catch (e) {
    rows.push({ rel, from: kb(size), to: "SKIP", note: "unreadable by sharp" });
    continue;
  }
  const oversized = Math.max(meta.width, meta.height) > MAX_EDGE;
  if (size < MIN_BYTES && !oversized) continue; // leave small, correctly-sized files alone

  before += size;
  const maxEdge = rel.includes("/fallbacks/") ? FALLBACK_MAX_EDGE : MAX_EDGE;
  const pipeline = sharp(abs).rotate().resize(maxEdge, maxEdge, { fit: "inside", withoutEnlargement: true });

  if (CONVERT_TO_WEBP.has(rel)) {
    const out = rel.replace(/\.png$/i, ".webp");
    const buf = await pipeline.webp({ quality: WEBP_Q }).toBuffer();
    after += buf.length;
    rows.push({ rel, from: kb(size), to: `${kb(buf.length)} -> ${path.basename(out)}`, note: "WEBP (update refs)" });
    if (APPLY) {
      backupOnce(rel);
      writeFileSync(path.join(ROOT, out), buf);
      rmSync(abs); // remove old .png
    }
    continue;
  }

  const isPng = /\.png$/i.test(rel);
  const buf = isPng
    ? await pipeline.png({ quality: 80, effort: 9, palette: true }).toBuffer()
    : await pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true }).toBuffer();

  // Guard: only replace if we actually got smaller.
  if (buf.length >= size) {
    after += size;
    rows.push({ rel, from: kb(size), to: kb(size), note: "kept (no gain)" });
    continue;
  }
  after += buf.length;
  rows.push({ rel, from: kb(size), to: kb(buf.length), note: isPng ? "PNG in place" : "JPEG in place" });
  if (APPLY) {
    backupOnce(rel);
    writeFileSync(abs, buf);
  }
}

rows.sort((a, b) => parseInt(b.from) - parseInt(a.from));
for (const r of rows) {
  console.log(`${r.from.padStart(7)} -> ${r.to.padEnd(22)} ${r.note.padEnd(18)} ${r.rel}`);
}
console.log(`\n${APPLY ? "APPLIED" : "DRY-RUN"}: ${rows.length} files`);
console.log(`Total before: ${(before / 1024 / 1024).toFixed(1)} MB  ->  after: ${(after / 1024 / 1024).toFixed(1)} MB  (saved ${((before - after) / 1024 / 1024).toFixed(1)} MB)`);
if (!APPLY) console.log("Re-run with --apply to write (originals backed up to /.image-backups/).");
