#!/usr/bin/env node
// 只读：用 wayon 的 extractTradeCode 把抓取的产品与 wayon 已有产品按编码比对，
// 分出「已上传」「待上传」「无法识别编码」。不写任何东西到 DB。
// 用法: node scripts/match-scraped.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { extractTradeCode } from "../src/features/products/lib/tradeCatalog.ts";

const SCRAPER = "/Users/demon/vibecoding/miniprogram-scraper/output";
const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");

const mine = JSON.parse(readFileSync(`${SCRAPER}/products.json`, "utf8"));
const wayon = JSON.parse(readFileSync(`${SCRAPER}/wayon-existing-products.json`, "utf8"));

// wayon 已有：归一化 productCode/slug → 产品
const wayonByCode = new Map();
for (const w of wayon) {
  for (const k of [w.productCode, w.slug]) {
    const n = norm(k);
    if (n) wayonByCode.set(n, w);
  }
}

const matched = [], toUpload = [], noCode = [];
for (const p of mine) {
  const code = extractTradeCode(p.title || "");
  const n = norm(code);
  if (!n) { noCode.push({ title: p.title, code }); continue; }
  const w = wayonByCode.get(n);
  if (w) matched.push({ code: n, myTitle: p.title, wayonSlug: w.slug, wayonTitle: w.title });
  else toUpload.push({ code: n, title: p.title });
}

// 反向：wayon 有但我没抓到的编码
const myCodes = new Set(mine.map((p) => norm(extractTradeCode(p.title || ""))).filter(Boolean));
const wayonOnly = wayon.filter((w) => !myCodes.has(norm(w.productCode)) && !myCodes.has(norm(w.slug)));

writeFileSync(`${SCRAPER}/match-已上传.json`, JSON.stringify(matched, null, 2));
writeFileSync(`${SCRAPER}/match-待上传.json`, JSON.stringify(toUpload, null, 2));
writeFileSync(`${SCRAPER}/match-无编码.json`, JSON.stringify(noCode, null, 2));

console.log("=== 抓取产品 vs wayon 已有 526 ===");
console.log(`我的产品总数: ${mine.length}`);
console.log(`  已在 wayon(跳过): ${matched.length}`);
console.log(`  待上传(新): ${toUpload.length}`);
console.log(`  无法识别编码(多为banner): ${noCode.length}`);
console.log(`\nwayon 有、我没抓到的编码: ${wayonOnly.length}`);
wayonOnly.slice(0, 15).forEach((w) => console.log(`  ${w.slug} | ${w.title}`));
console.log("\n已上传 匹配样例(前10):");
matched.slice(0, 10).forEach((m) => console.log(`  ${m.code}  我="${m.myTitle}"  ↔  wayon=${m.wayonSlug}"${m.wayonTitle}"`));
console.log("\n待上传 样例(前10):");
toUpload.slice(0, 10).forEach((m) => console.log(`  ${m.code}  ${m.title}`));
