#!/usr/bin/env node
// 把 output/images 里待上传的产品分成「规范(可导入)」与「待确定(无编码/非枚举尺寸)」，
// 待确定的移到 output/待确定暂不导入/（images + 主图归档同步），先不导入。
// 用法: node scripts/split-and-archive.mjs        干跑
//      node scripts/split-and-archive.mjs --apply 执行
import fs from "node:fs";
import path from "node:path";
import { extractTradeCode, TRADE_SIZES } from "../src/features/products/lib/tradeCatalog.ts";

const SC = "/Users/demon/vibecoding/miniprogram-scraper";
const org = await import(`${SC}/src/organize.mjs`);
const { sizeDir, thicknessDir, finishDir, prdDir } = org;
const APPLY = process.argv.includes("--apply");

const ps = JSON.parse(fs.readFileSync(`${SC}/output/products.json`, "utf8"));
const SIZE_SET = new Set(TRADE_SIZES);
const byName = new Map();
for (const p of ps) { const k = prdDir(p); (byName.get(k) || byName.set(k, []).get(k)).push(p); }

const wayonSize = (p) => {
  const m = String(sizeDir(p)).match(/(\d{3,4})[×x](\d{3,4})/);
  return m ? `${m[1]}X${m[2]}mm` : "";
};

// 枚举 output/images 下的末级产品目录
const IMG = path.join(SC, "output/images");
const leaves = [];
(function w(d) {
  const es = fs.readdirSync(d, { withFileTypes: true });
  const su = es.filter((e) => e.isDirectory());
  const fl = es.filter((e) => e.isFile() && /\.(jpg|jpeg|png|mp4)$/i.test(e.name));
  if (fl.length && !su.length) leaves.push(d);
  for (const s of su) w(path.join(d, s.name));
})(IMG);

const ok = [], pending = [];
for (const abs of leaves) {
  const rel = path.relative(IMG, abs);
  const name = path.basename(rel);
  const cands = byName.get(name) || [];
  const p = cands.find((c) => `${sizeDir(c)}/${thicknessDir(c)}/${finishDir(c)}/${prdDir(c)}` === rel) || cands[0];
  if (!p) { pending.push({ rel, reason: "无法匹配产品" }); continue; }
  const code = extractTradeCode(p.title || "");
  const sz = wayonSize(p);
  const reasons = [];
  if (!code) reasons.push("无可识别编码");
  if (!SIZE_SET.has(sz)) reasons.push(`非枚举尺寸(${sz || "?"})`);
  if (reasons.length) pending.push({ rel, reason: reasons.join("+") });
  else ok.push(rel);
}

console.log(`output/images 待上传产品: ${leaves.length}`);
console.log(`  ✅ 规范(可导入): ${ok.length}`);
console.log(`  ⏸️  待确定(归档不导入): ${pending.length}`);
const byReason = {};
pending.forEach((x) => { byReason[x.reason] = (byReason[x.reason] || 0) + 1; });
console.log("  待确定原因分布:", JSON.stringify(byReason, null, 0));
console.log("\n待确定样例:");
pending.slice(0, 12).forEach((x) => console.log(`   [${x.reason}] ${x.rel}`));

if (!APPLY) { console.log("\n(干跑，未移动。加 --apply 执行)"); process.exit(0); }

const DEST = path.join(SC, "output/待确定暂不导入");
let moved = 0;
for (const x of pending) {
  for (const [root, sub] of [["output/images", "images"], ["output/主图归档", "主图归档"]]) {
    const from = path.join(SC, root, x.rel);
    if (fs.existsSync(from)) {
      const to = path.join(DEST, sub, x.rel);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(from, to);
      moved++;
    }
  }
}
// 清空目录
for (const root of ["output/images", "output/主图归档"]) {
  (function rm(d) {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d)) { const f = path.join(d, e); if (fs.statSync(f).isDirectory()) rm(f); }
    const left = fs.readdirSync(d).filter((f) => f !== ".DS_Store");
    if (left.length === 0 && d !== path.join(SC, root)) { for (const f of fs.readdirSync(d)) fs.unlinkSync(path.join(d, f)); fs.rmdirSync(d); }
  })(path.join(SC, root));
}
// 写待确定清单
fs.writeFileSync(`${SC}/output/待确定暂不导入/清单.json`, JSON.stringify(pending, null, 2));
console.log(`\n✅ 已归档 ${moved} 个目录到 output/待确定暂不导入/  | 规范保留在 images: ${ok.length}`);
