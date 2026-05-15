#!/usr/bin/env node
/**
 * Convert certificate PDFs to JPG previews for web display.
 * Uses pdftoppm (poppler-utils) to extract each page as a JPEG.
 *
 * Usage:
 *   node --env-file=.env.local scripts/convertCertificatePdfs.mjs
 *   node --env-file=.env.local scripts/convertCertificatePdfs.mjs --apply
 *
 * Reads:  docs/专利证书/
 * Writes: public/assets/certificates/  (--apply only)
 */

import { spawnSync } from "child_process";
import { readdirSync, copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";

const DRY_RUN = !process.argv.includes("--apply");
const SRC_DIR = path.resolve("docs/专利证书");
const OUT_DIR = path.resolve("public/assets/certificates");

const FILE_MAP = {
  "广东众岩联实用新型专利证书 一种能够较好压紧板材的岩板加工设备202422240073.X.pdf":
    "patent-press-plate",
  "广东众岩联实用新型专利证书 一种岩板加工打磨用固定角码结构202422416690.0.pdf":
    "patent-corner-bracket",
  "广东众岩联多功能岩板倒角机专利证书 62383.pdf": "patent-beveling-machine",
  "两张关于网商协会的证书.pdf": "association-cert",
  "微信图片_20260514101152_67_137.jpg": "cert-misc-1.jpg",
};

if (DRY_RUN) {
  console.log("DRY RUN — pass --apply to write files\n");
}

if (!existsSync(SRC_DIR)) {
  console.error(`Source directory not found: ${SRC_DIR}`);
  process.exit(1);
}

if (!DRY_RUN) {
  mkdirSync(OUT_DIR, { recursive: true });
}

const produced = [];

for (const [filename, slug] of Object.entries(FILE_MAP)) {
  const srcPath = path.join(SRC_DIR, filename);

  if (!existsSync(srcPath)) {
    console.warn(`SKIP (not found): ${filename}`);
    continue;
  }

  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
    const destPath = path.join(OUT_DIR, slug);
    console.log(`JPG  ${filename} → /assets/certificates/${slug}`);
    if (!DRY_RUN) copyFileSync(srcPath, destPath);
    produced.push({ slug: path.basename(slug, path.extname(slug)), file: slug });
    continue;
  }

  // PDF → JPG via pdftoppm
  const prefix = path.join(OUT_DIR, slug);
  const previewArgs = [
    "-jpeg",
    "-r", "200",
    srcPath,
    prefix,
  ];

  console.log(`PDF  ${filename} → /assets/certificates/${slug}-*.jpg`);

  if (!DRY_RUN) {
    const result = spawnSync("pdftoppm", previewArgs, { encoding: "utf8" });
    if (result.status !== 0) {
      console.error(`  ERROR: pdftoppm failed for ${filename}`);
      console.error(result.stderr);
      continue;
    }

    // pdftoppm pads page numbers: slug-1.jpg or slug-01.jpg etc.
    // Find what it produced
    const allFiles = readdirSync(OUT_DIR).filter(
      (f) => f.startsWith(slug + "-") && f.endsWith(".jpg")
    );
    allFiles.sort();
    allFiles.forEach((f) => {
      const pageNum = f.replace(slug + "-", "").replace(".jpg", "").replace(/^0+/, "") || "1";
      produced.push({ slug: `${slug}-${pageNum}`, file: f });
      console.log(`  → ${f}`);
    });

    // Also copy original PDF for download link
    const pdfDest = path.join(OUT_DIR, `${slug}.pdf`);
    copyFileSync(srcPath, pdfDest);
    console.log(`  → ${slug}.pdf (original)`);
  } else {
    produced.push({ slug: `${slug}-1`, file: `${slug}-1.jpg` });
  }
}

console.log("\n--- siteCopy.ts data stub ---");
console.log("Copy the entries below into aboutPage.certifications in siteCopy.ts:\n");
for (const { slug, file } of produced) {
  console.log(`  {
    previewSrc: "/assets/certificates/${file}",
    downloadUrl: "/assets/certificates/${slug.replace(/-\d+$/, "")}.pdf",
    // fill in title, issuer, number, year below
  },`);
}
