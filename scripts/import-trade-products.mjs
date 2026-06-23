#!/usr/bin/env node
// 把抓取的「规范」岩板产品(output/images)导入 wayon：图片走 Media(自动压缩+生成尺寸+传R2)，
// 再建 products。按 slug 查重，绝不重复。封面留空(自动兜底)，主图卡不上传。
// 用法:
//   node scripts/import-trade-products.mjs                  干跑(不连库,只打印计划)
//   node --env-file=.env.local scripts/import-trade-products.mjs --apply --limit 3   小批测试
//   node --env-file=.env.local scripts/import-trade-products.mjs --apply             全量
//   ...additional flag: --draft  导入为未发布(默认发布)
import fs from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import {
  inferTradeColorGroup,
  normalizeTradeProcess, extractTradeFaceMetadata,
  TRADE_SIZES, TRADE_THICKNESSES,
} from "../src/features/products/lib/tradeCatalog.ts";
import { inferTradeSeriesTypes } from "../src/features/products/content/tradeSeriesMappings.ts";

// 自有编码提取：中文名前的连续字母数字 = 完整 SKU（不依赖 wayon 不全的前缀白名单，
// 避免 HL/MS/JD/QSJD 等被退化抓成序列号导致 slug 撞车）。无前导码(纯中文名)返回 null。
const FACE_RE = /(ABCD四面上下左右连|ABCD四面|上下左右无限连纹|无限连纹|一石多面|一石面|单面|左右连)/g;
function extractTradeCode(t) { const m = String(t || "").match(/^[A-Za-z0-9][A-Za-z0-9‐‑-]*/); return m ? m[0].replace(/[‐‑]/g, "-") : null; }
function extractTradeDisplayName(t) {
  const code = String(t || "").match(/^[A-Za-z0-9][A-Za-z0-9‐‑-]*/)?.[0] || "";
  let s = String(t || "").slice(code.length).replace(FACE_RE, "").replace(/[()（）\[\]_-]/g, " ").replace(/\s+/g, " ").trim();
  return s || String(t || "");
}

const APPLY = process.argv.includes("--apply");
const PUBLISH = !process.argv.includes("--draft");
const li = process.argv.indexOf("--limit");
const LIMIT = li >= 0 ? parseInt(process.argv[li + 1]) : Infinity;

const SC = "/Users/demon/vibecoding/miniprogram-scraper";
const IMG = path.join(SC, "output/images");
const org = await import(`${SC}/src/organize.mjs`);
const { sizeDir, thicknessDir, finishDir, prdDir } = org;
const ps = JSON.parse(fs.readFileSync(`${SC}/output/products.json`, "utf8"));
const byName = new Map();
for (const p of ps) { const k = prdDir(p); (byName.get(k) || byName.set(k, []).get(k)).push(p); }

const SIZE_SET = new Set(TRADE_SIZES), THICK_SET = new Set(TRADE_THICKNESSES);
const FINISH_TO_PROCESS = { 亮面: "亮光", 哑面: "哑光", 精雕釉: "精雕" };
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime" };

const wSize = (p) => { const m = String(sizeDir(p)).match(/(\d{3,4})[×x](\d{3,4})/); const v = m ? `${m[1]}X${m[2]}mm` : ""; return SIZE_SET.has(v) ? v : null; };
const wThick = (p) => { const t = thicknessDir(p); return THICK_SET.has(t) ? t : null; };
const wProc = (p) => FINISH_TO_PROCESS[finishDir(p)] || normalizeTradeProcess(`${p.serieText}`) || null;

// 枚举 output/images 末级产品目录 + 其图片文件
const leaves = [];
(function w(d) {
  const es = fs.readdirSync(d, { withFileTypes: true });
  const su = es.filter((e) => e.isDirectory());
  const fl = es.filter((e) => e.isFile() && /\.(jpg|jpeg|png|mp4)$/i.test(e.name)).map((e) => e.name);
  if (fl.length && !su.length) leaves.push({ abs: d, rel: path.relative(IMG, d), files: fl });
  for (const s of su) w(path.join(d, s.name));
})(IMG);

function planFor(leaf) {
  const name = path.basename(leaf.rel);
  const cands = byName.get(name) || [];
  const p = cands.find((c) => `${sizeDir(c)}/${thicknessDir(c)}/${finishDir(c)}/${prdDir(c)}` === leaf.rel) || cands[0];
  if (!p) return null;
  const code = extractTradeCode(p.title || "");
  if (!code) return null;
  const slug = code.toLowerCase();
  const display = extractTradeDisplayName(p.title || "") || p.title;
  const face = extractTradeFaceMetadata(`${p.title} ${(p.imgsPrd || []).map((i) => i.title).join(" ")}`);
  const process = wProc(p);
  const pick = (t) => leaf.files.filter((f) => new RegExp(`_${t}\\d`).test(f)).sort();
  const groups = { element: pick("元素图"), space: pick("空间图"), real: pick("实拍图"), video: leaf.files.filter((f) => /\.mp4$/i.test(f)), main: pick("主图") };
  return {
    p, slug, display, leaf,
    data: {
      size: wSize(p), thickness: wThick(p), process,
      colorGroup: inferTradeColorGroup(display || ""),
      seriesTypes: inferTradeSeriesTypes({ displayName: display || "", process, facePatternNote: face.facePatternNote }),
      facePatternNote: face.facePatternNote || undefined,
    },
    groups,
  };
}

const plans = leaves.map(planFor).filter(Boolean).slice(0, LIMIT);

if (!APPLY) {
  console.log(`[DRY-RUN] 规范产品 ${leaves.length}，本次计划 ${plans.length}（发布=${PUBLISH}）`);
  let imgs = 0;
  for (const pl of plans.slice(0, 12)) {
    const g = pl.groups;
    imgs += g.element.length + g.space.length + g.real.length + g.video.length;
    console.log(`  ${pl.slug} | ${pl.display} | ${pl.data.size}/${pl.data.thickness || "-"}/${pl.data.process || "-"}/${pl.data.colorGroup || "-"}/[${(pl.data.seriesTypes || []).join(",") || "-"}] | 元${g.element.length}空${g.space.length}拍${g.real.length}视${g.video.length}`);
  }
  const totalImgs = plans.reduce((s, pl) => s + pl.groups.element.length + pl.groups.space.length + pl.groups.real.length + pl.groups.video.length, 0);
  console.log(`  …共 ${plans.length} 产品 / ${totalImgs} 图片待上传`);
  console.log("\n(加 --apply 执行；建议先 --apply --limit 3 测试)");
  process.exit(0);
}

const config = (await import("../src/payload.config.ts")).default;
const payload = await getPayload({ config });
process.on("uncaughtException", (e) => console.error("WARN uncaught:", e.message));

// 单操作超时：网络/SSL 抖动后套接字会无限挂起，超时即抛错→被产品级 try/catch 接住→继续(幂等重跑可补)
const withTimeout = (promise, ms, label) =>
  Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error(`超时(${ms}ms) ${label}`)), ms))]);

async function uploadMedia(absFile, alt) {
  const ext = path.extname(absFile).toLowerCase();
  const data = fs.readFileSync(absFile);
  const created = await withTimeout(payload.create({
    collection: "media",
    data: { alt, category: "product" },
    file: { data, mimetype: MIME[ext], name: path.basename(absFile), size: data.length },
  }), 90000, `上传 ${path.basename(absFile)}`);
  return created.id;
}

const stats = { created: 0, skipped: 0, failed: 0, media: 0, variant: 0 };
const usedThisRun = new Set();
for (const [i, pl] of plans.entries()) {
  try {
    // 解析 slug：同名(同产品)→跳过；同码不同产品→追加后缀保留(不丢数据)
    let slug = null;
    for (let n = 1; n <= 9; n++) {
      const trySlug = n === 1 ? pl.slug : `${pl.slug}-${n}`;
      if (usedThisRun.has(trySlug)) continue;
      const ex = await withTimeout(payload.find({ collection: "products", where: { slug: { equals: trySlug } }, limit: 1, depth: 0 }), 30000, `查slug ${trySlug}`);
      if (!ex.docs.length) { slug = trySlug; if (n > 1) stats.variant++; break; }
      const exTitle = typeof ex.docs[0].title === "string" ? ex.docs[0].title : ex.docs[0].title?.zh;
      if (exTitle === pl.display) { slug = null; break; } // 同产品已存在 → 跳过
    }
    if (slug === null) { stats.skipped++; continue; }
    usedThisRun.add(slug);

    const mkArr = async (files, type) => {
      const arr = [];
      for (const f of files) {
        const id = await uploadMedia(path.join(pl.leaf.abs, f), `${pl.display}${type}`);
        arr.push({ mediaRef: id, altZh: `${pl.display}${type}`, sourcePath: path.join("output/images", pl.leaf.rel, f) });
        stats.media++;
      }
      return arr;
    };
    const elementImages = await mkArr(pl.groups.element, "材质纹理图");
    const spaceImages = await mkArr(pl.groups.space, "实景应用图");
    const realImages = await mkArr(pl.groups.real, "工地实拍图");
    const videos = [];
    for (const f of pl.groups.video) { const id = await uploadMedia(path.join(pl.leaf.abs, f), `${pl.display}视频`); videos.push({ mediaRef: id, titleZh: pl.display }); stats.media++; }
    // 仅有主图卡的产品(如纯色满版)：把主图当封面，避免无图
    let image;
    if (!elementImages.length && !spaceImages.length && !realImages.length && pl.groups.main.length) {
      image = await uploadMedia(path.join(pl.leaf.abs, pl.groups.main[0]), `${pl.display}封面`);
      stats.media++;
    }

    const data = {
      slug,
      title: pl.display,
      published: PUBLISH,
      catalogMode: "standard",
      elementImages, spaceImages, realImages, videos,
    };
    if (pl.data.size) data.size = pl.data.size;
    if (pl.data.thickness) data.thickness = pl.data.thickness;
    if (pl.data.process) data.process = pl.data.process;
    if (pl.data.colorGroup) data.colorGroup = pl.data.colorGroup;
    if (pl.data.seriesTypes?.length) data.seriesTypes = pl.data.seriesTypes;
    if (pl.data.facePatternNote) data.facePatternNote = pl.data.facePatternNote;
    if (image) data.image = image;

    await withTimeout(payload.create({ collection: "products", data }), 60000, `建产品 ${slug}`);
    stats.created++;
    if ((i + 1) % 20 === 0 || i + 1 === plans.length) console.log(`  进度 ${i + 1}/${plans.length} | 建${stats.created} 跳${stats.skipped} 变体${stats.variant} 失${stats.failed} 图${stats.media}`);
  } catch (e) {
    stats.failed++;
    console.error(`  ✗ ${pl.slug} ${pl.display}: ${e.message}`);
  }
}
console.log(`\n✅ 完成：新建 ${stats.created}，跳过 ${stats.skipped}，变体 ${stats.variant}，失败 ${stats.failed}，上传图片 ${stats.media}`);
process.exit(0);
