#!/usr/bin/env node
// Mirror-mode media compressor. Reads from SOURCE_DIRS, writes to docs.compressed/.
// Skips files whose output already exists (idempotent — safe to re-run).
// If compressed file is not at least 5% smaller than original, the original is
// copied through unchanged so downstream paths still resolve.

import {execFile} from "node:child_process";
import {createHash} from "node:crypto";
import fs from "node:fs/promises";
import {createReadStream, createWriteStream} from "node:fs";
import os from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {promisify} from "node:util";

import sharp from "sharp";

const execFileP = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

const SOURCE_DIRS = [
  path.join(REPO_ROOT, "docs/4.22"),
  path.join(REPO_ROOT, "docs/海盛"),
];
const DEST_ROOT = path.join(REPO_ROOT, "docs.compressed");

const IMAGE_PARALLELISM = Math.min(8, Math.max(2, os.cpus().length - 1));
const VIDEO_PARALLELISM = 1; // ffmpeg gets all cores per file via -threads 0
const KEEP_THRESHOLD = 0.95; // discard compressed output if >= 95% of original

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".heic", ".gif", ".webp"]);
const VIDEO_EXTS = new Set([".mp4", ".mov"]);

const stats = {
  imagesProcessed: 0,
  imagesSkipped: 0,
  imagesKeptOriginal: 0,
  videosProcessed: 0,
  videosSkipped: 0,
  videosKeptOriginal: 0,
  bytesIn: 0,
  bytesOut: 0,
  failed: [],
};

async function walk(dir) {
  const entries = await fs.readdir(dir, {withFileTypes: true});
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && !entry.name.startsWith(".")) {
      files.push(fullPath);
    }
  }
  return files;
}

function destFor(srcPath, newExt) {
  const rel = path.relative(REPO_ROOT, srcPath);
  const stripped = rel.replace(/^docs\//, "");
  const out = path.join(DEST_ROOT, stripped);
  if (!newExt) return out;
  return out.slice(0, out.length - path.extname(out).length) + newExt;
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), {recursive: true});
}

async function copyFile(src, dest) {
  await ensureDir(dest);
  await fs.copyFile(src, dest);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function compressImage(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  let outExt = ext;
  if (ext === ".heic") outExt = ".jpg";
  if (ext === ".jpeg") outExt = ".jpg";

  const destPath = destFor(srcPath, outExt);
  if (await fileExists(destPath)) {
    stats.imagesSkipped += 1;
    return;
  }
  await ensureDir(destPath);

  const tmpPath = destPath + ".tmp";
  const srcStat = await fs.stat(srcPath);
  stats.bytesIn += srcStat.size;

  try {
    const pipeline = sharp(srcPath, {failOn: "none"}).rotate(); // honor EXIF orientation

    if (outExt === ".jpg") {
      pipeline.jpeg({quality: 85, mozjpeg: true, progressive: true});
    } else if (outExt === ".png") {
      pipeline.png({compressionLevel: 9, palette: true, effort: 10});
    } else if (outExt === ".webp") {
      pipeline.webp({quality: 85, effort: 6});
    } else if (outExt === ".gif") {
      // sharp can't recompress animated GIF well; just copy through.
      await copyFile(srcPath, destPath);
      stats.imagesKeptOriginal += 1;
      stats.bytesOut += srcStat.size;
      return;
    }

    await pipeline.toFile(tmpPath);

    const outStat = await fs.stat(tmpPath);
    if (outStat.size >= srcStat.size * KEEP_THRESHOLD) {
      // Compression didn't help enough — keep original (under new extension if heic)
      await fs.unlink(tmpPath);
      if (outExt !== ext) {
        // Need to convert anyway for browser support (HEIC). Keep the encoded file.
        await ensureDir(destPath);
        await sharp(srcPath, {failOn: "none"})
          .rotate()
          .jpeg({quality: 90, mozjpeg: true})
          .toFile(destPath);
        const finalStat = await fs.stat(destPath);
        stats.bytesOut += finalStat.size;
      } else {
        await copyFile(srcPath, destPath);
        stats.bytesOut += srcStat.size;
        stats.imagesKeptOriginal += 1;
      }
    } else {
      await fs.rename(tmpPath, destPath);
      stats.bytesOut += outStat.size;
    }
    stats.imagesProcessed += 1;
  } catch (err) {
    stats.failed.push({file: srcPath, error: String(err)});
    try {
      await fs.unlink(tmpPath);
    } catch {}
  }
}

async function compressVideo(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  const outExt = ".mp4"; // unify .mov → .mp4
  const destPath = destFor(srcPath, outExt);
  if (await fileExists(destPath)) {
    stats.videosSkipped += 1;
    return;
  }
  await ensureDir(destPath);

  const tmpPath = destPath + ".tmp.mp4";
  const srcStat = await fs.stat(srcPath);
  stats.bytesIn += srcStat.size;

  try {
    await execFileP(
      "ffmpeg",
      [
        "-y",
        "-loglevel", "error",
        "-i", srcPath,
        "-c:v", "libx264",
        "-crf", "23",
        "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", // ensure even dims for yuv420p
        "-movflags", "+faststart",
        "-c:a", "aac",
        "-b:a", "128k",
        "-threads", "0",
        tmpPath,
      ],
      {maxBuffer: 1024 * 1024 * 16}
    );

    const outStat = await fs.stat(tmpPath);
    if (outStat.size >= srcStat.size * KEEP_THRESHOLD) {
      await fs.unlink(tmpPath);
      // Even if not smaller, .mov gets re-muxed for browser compat; keep tx anyway
      // for .mov, but for .mp4 just copy original.
      if (ext === ".mp4") {
        await copyFile(srcPath, destPath);
        stats.bytesOut += srcStat.size;
        stats.videosKeptOriginal += 1;
      } else {
        // .mov → .mp4 with copy codecs as fallback
        await execFileP("ffmpeg", [
          "-y", "-loglevel", "error",
          "-i", srcPath,
          "-c", "copy",
          "-movflags", "+faststart",
          destPath,
        ]);
        const finalStat = await fs.stat(destPath);
        stats.bytesOut += finalStat.size;
        stats.videosKeptOriginal += 1;
      }
    } else {
      await fs.rename(tmpPath, destPath);
      stats.bytesOut += outStat.size;
    }
    stats.videosProcessed += 1;
  } catch (err) {
    stats.failed.push({file: srcPath, error: String(err)});
    try {
      await fs.unlink(tmpPath);
    } catch {}
  }
}

async function runQueue(items, worker, parallelism, label) {
  let cursor = 0;
  let done = 0;
  const total = items.length;
  const startedAt = Date.now();

  async function next() {
    while (cursor < total) {
      const idx = cursor++;
      const item = items[idx];
      try {
        await worker(item);
      } catch (err) {
        stats.failed.push({file: item, error: String(err)});
      }
      done++;
      if (done % 25 === 0 || done === total) {
        const elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
        const rate = (done / Math.max(1, parseInt(elapsed))).toFixed(1);
        console.log(
          `[${label}] ${done}/${total} (${rate}/s, ${elapsed}s elapsed)`
        );
      }
    }
  }

  const workers = Array.from({length: parallelism}, () => next());
  await Promise.all(workers);
}

async function main() {
  console.log("Scanning source directories...");
  const allFiles = [];
  for (const dir of SOURCE_DIRS) {
    if (await fileExists(dir)) {
      allFiles.push(...(await walk(dir)));
    }
  }

  const images = allFiles.filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()));
  const videos = allFiles.filter((f) => VIDEO_EXTS.has(path.extname(f).toLowerCase()));

  console.log(
    `Found ${allFiles.length} files: ${images.length} images, ${videos.length} videos`
  );
  console.log(`Output: ${DEST_ROOT}`);
  console.log(`Image parallelism: ${IMAGE_PARALLELISM}, video parallelism: ${VIDEO_PARALLELISM}\n`);

  console.log("=== Phase 1: Images ===");
  await runQueue(images, compressImage, IMAGE_PARALLELISM, "img");

  console.log("\n=== Phase 2: Videos ===");
  await runQueue(videos, compressVideo, VIDEO_PARALLELISM, "vid");

  const mb = (b) => (b / 1024 / 1024).toFixed(1);
  const ratio =
    stats.bytesIn > 0
      ? ((1 - stats.bytesOut / stats.bytesIn) * 100).toFixed(1)
      : "0";

  console.log("\n=== Summary ===");
  console.log(`Images: processed ${stats.imagesProcessed}, skipped ${stats.imagesSkipped}, kept-original ${stats.imagesKeptOriginal}`);
  console.log(`Videos: processed ${stats.videosProcessed}, skipped ${stats.videosSkipped}, kept-original ${stats.videosKeptOriginal}`);
  console.log(`Bytes in:  ${mb(stats.bytesIn)} MB`);
  console.log(`Bytes out: ${mb(stats.bytesOut)} MB`);
  console.log(`Reduction: ${ratio}%`);
  if (stats.failed.length) {
    console.log(`\nFailed (${stats.failed.length}):`);
    for (const {file, error} of stats.failed.slice(0, 20)) {
      console.log(`  - ${path.relative(REPO_ROOT, file)}: ${error}`);
    }
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
