#!/usr/bin/env node
// 生成导入清单文档：现有(已上传) + 待上传 产品的完整目录，含本地路径、编码、
// 以及用 wayon 推导函数算出的将分到的 尺寸/厚度/颜色/工艺/系列。只读，不碰 DB。
// 用法: node scripts/generate-import-manifest.mjs
import fs from "node:fs";
import path from "node:path";
import {
  extractTradeCode,
  extractTradeDisplayName,
  inferTradeColorGroup,
  normalizeTradeProcess,
  extractTradeFaceMetadata,
  TRADE_SIZES,
  TRADE_THICKNESSES,
} from "../src/features/products/lib/tradeCatalog.ts";
import { inferTradeSeriesTypes } from "../src/features/products/content/tradeSeriesMappings.ts";

// 用「我的审计过的分类」驱动 wayon 字段（比 wayon 对原始串的严格 infer 更可靠）
const SIZE_SET = new Set(TRADE_SIZES);
const THICK_SET = new Set(TRADE_THICKNESSES);
function mySizeToWayon(myDir) {
  const m = String(myDir).match(/(\d{3,4})[×x](\d{3,4})/);
  if (!m) return "";
  const v = `${m[1]}X${m[2]}mm`;
  return SIZE_SET.has(v) ? v : `${v}(非wayon枚举)`;
}
function myThickToWayon(t) {
  if (THICK_SET.has(t)) return t;
  if (/^\d{1,2}mm$/.test(t)) return `${t}(自定义)`;
  return "";
}
const FINISH_TO_PROCESS = { 亮面: "亮光", 哑面: "哑光", 精雕釉: "精雕" };
function myProcessToWayon(finish, serieText) {
  if (FINISH_TO_PROCESS[finish]) return FINISH_TO_PROCESS[finish];
  return normalizeTradeProcess(`${serieText}`) || ""; // 透光石/火烧面/定位彩晶等从系列名识别
}

const SC = "/Users/demon/vibecoding/miniprogram-scraper";
const org = await import(`${SC}/src/organize.mjs`);
const { sizeDir, thicknessDir, finishDir, prdDir } = org;

const ps = JSON.parse(fs.readFileSync(`${SC}/output/products.json`, "utf8"));
const wayon = JSON.parse(fs.readFileSync(`${SC}/output/wayon-existing-products.json`, "utf8"));
const norm = (s) => String(s || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const wayonByCode = new Map();
for (const w of wayon) for (const k of [w.productCode, w.slug]) { const n = norm(k); if (n) wayonByCode.set(n, w); }

const OUTDIR = `${SC}/output/导入清单`;
fs.mkdirSync(OUTDIR, { recursive: true });

function locate(p) {
  const rel = `${sizeDir(p)}/${thicknessDir(p)}/${finishDir(p)}/${prdDir(p)}`;
  for (const [root, label] of [["output/images", "待上传"], ["output/已上传归档/images", "已上传"]]) {
    const abs = path.join(SC, root, rel);
    if (fs.existsSync(abs)) {
      const files = fs.readdirSync(abs).filter((f) => /\.(jpg|jpeg|png|mp4)$/i.test(f));
      return { rel, root, label, files };
    }
  }
  // banner?
  const banAbs = path.join(SC, "output/汇总banner", prdDir(p));
  if (fs.existsSync(banAbs)) return { rel: prdDir(p), root: "output/汇总banner", label: "banner", files: fs.readdirSync(banAbs).filter((f) => /\.(jpg|jpeg|png)$/i.test(f)) };
  return { rel, root: "(无)", label: "无目录", files: [] };
}

const cnt = (files, t) => files.filter((f) => new RegExp(`_${t}\\d`).test(f)).length;

const rows = ps.map((p) => {
  const code = extractTradeCode(p.title || "");
  const display = extractTradeDisplayName(p.title || "") || p.title;
  const loc = locate(p);
  const face = extractTradeFaceMetadata(`${p.title} ${(p.imgsPrd || []).map((i) => i.title).join(" ")}`);
  const wSize = mySizeToWayon(sizeDir(p));
  const wThick = myThickToWayon(thicknessDir(p));
  const wProcess = myProcessToWayon(finishDir(p), p.serieText);
  const wColor = inferTradeColorGroup(display || p.title || "");
  const wSeries = inferTradeSeriesTypes({ displayName: display || "", process: wProcess, facePatternNote: face.facePatternNote });
  const codeNorm = norm(code);
  const w = codeNorm ? wayonByCode.get(codeNorm) : null;
  let status = loc.label === "banner" ? "banner(不导入)" : w ? "已上传" : codeNorm ? "待上传" : "待上传(无编码,需兜底)";
  return {
    status, code: code || "", display, myTitle: p.title,
    myDir: `${sizeDir(p)}/${thicknessDir(p)}/${finishDir(p)}`,
    localPath: `${loc.root}/${loc.rel}`,
    wSize: wSize || "", wThick: wThick || "", wColor: wColor || "", wProcess: wProcess || "",
    wSeries: (wSeries || []).join("|"),
    元素: cnt(loc.files, "元素图"), 空间: cnt(loc.files, "空间图"), 实拍: cnt(loc.files, "实拍图"), 主图: cnt(loc.files, "主图"),
    wayonSlug: w ? w.slug : "",
  };
});

const esc = (v) => { const s = String(v ?? ""); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
function csv(file, list, cols) {
  const head = cols.map((c) => c[0]).join(",");
  const body = list.map((r) => cols.map((c) => esc(r[c[1]])).join(",")).join("\n");
  fs.writeFileSync(`${OUTDIR}/${file}`, "﻿" + head + "\n" + body);
}

const toUpload = rows.filter((r) => r.status.startsWith("待上传"));
const uploaded = rows.filter((r) => r.status === "已上传");
const banners = rows.filter((r) => r.status.startsWith("banner"));
const myCodes = new Set(ps.map((p) => norm(extractTradeCode(p.title || ""))).filter(Boolean));
const wayonOnly = wayon.filter((w) => !myCodes.has(norm(w.productCode)) && !myCodes.has(norm(w.slug)));

const upCols = [["编码", "code"], ["产品名", "display"], ["原始标题", "myTitle"], ["本地路径", "localPath"],
  ["wayon尺寸", "wSize"], ["wayon厚度", "wThick"], ["wayon颜色", "wColor"], ["wayon工艺", "wProcess"], ["wayon系列", "wSeries"],
  ["元素图", "元素"], ["空间图", "空间"], ["实拍图", "实拍"], ["主图归档", "主图"], ["状态", "status"]];
const upCols2 = [["编码", "code"], ["产品名", "display"], ["wayon_slug", "wayonSlug"], ["原始标题", "myTitle"], ["本地归档路径", "localPath"]];

csv("待上传清单.csv", toUpload, upCols);
csv("已上传清单.csv", uploaded, upCols2);
csv("banner清单.csv", banners, [["产品名", "display"], ["原始标题", "myTitle"], ["本地路径", "localPath"]]);
csv("wayon独有清单.csv", wayonOnly.map((w) => ({ slug: w.slug, title: w.title })), [["wayon_slug", "slug"], ["产品名", "title"]]);

// Markdown 总览
const bySize = {};
for (const r of toUpload) { const k = r.wSize || "(未识别)"; bySize[k] = (bySize[k] || 0) + 1; }
const noCodeUp = toUpload.filter((r) => !r.code).length;
const N = toUpload.length;
const fill = (key) => { const e = toUpload.filter((r) => !r[key]).length; return `${(((N - e) / N) * 100).toFixed(0)}%（空 ${e}）`; };
const nonEnumSize = toUpload.filter((r) => /非wayon/.test(r.wSize)).length;
const md = `# 岩板产品导入清单（生成于本地比对）

> 用途：记录 wayon 现有产品 与 本次待上传产品 的完整目录，便于导入出错时追溯定位。
> 数据来源：小程序「全球岩板仓」抓取（${SC}/output）+ wayon 现有产品快照。

## 总览

| 类别 | 数量 | 明细文件 |
|------|------|---------|
| wayon 现有产品 | ${wayon.length} | output/wayon-existing-products.json |
| ├ 与抓取匹配（已上传，已归档） | ${uploaded.length} | 已上传清单.csv |
| └ wayon 独有（我未抓到，疑下架） | ${wayonOnly.length} | wayon独有清单.csv |
| **待上传（新产品）** | **${toUpload.length}** | **待上传清单.csv** |
| ├ 其中无法识别编码（需兜底） | ${noCodeUp} | （见清单内编码空者） |
| banner（不导入） | ${banners.length} | banner清单.csv |

抓取产品总计 ${ps.length} = 已上传 ${uploaded.length} + 待上传 ${toUpload.length} + banner ${banners.length}

## 待上传按 wayon 尺寸分布

| wayon 尺寸 | 数量 |
|-----------|------|
${Object.entries(bySize).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${k} | ${v} |`).join("\n")}

## 目录结构对照

- 本地图片根：\`output/images/{尺寸}/{厚度}/{工艺}/{产品名}/\`（待上传）
- 已上传归档：\`output/已上传归档/images/{...}\`（与 wayon 重复，不再上传）
- 产品卡归档：\`output/主图归档/{...}\`（营销卡，导入作封面兜底）
- banner：\`output/汇总banner/\`（不导入）

## 字段映射（本地图片类型 → wayon）

| 本地 | wayon 字段 |
|------|-----------|
| 元素图 | elementImages 材质纹理图 |
| 空间图 | spaceImages 实景应用图 |
| 实拍图 | realImages 工地实拍图 |
| 主图(归档) | 产品封面 image（或留空自动兜底） |

## wayon 字段填充率（待上传 ${N}，空白=wayon 推导覆盖不到，非错误）

| 字段 | 填充率 | 说明 |
|------|--------|------|
| 尺寸 | ${fill("wSize")} | 其中 ${nonEnumSize} 个为「非wayon枚举」(1200×1200/1200×3000) |
| 厚度 | ${fill("wThick")} | 取自本地审计分类，可靠 |
| 颜色 | ${fill("wColor")} | wayon 从产品名推导；名字无明确单一颜色词的留空 |
| 工艺 | ${fill("wProcess")} | 空者多为 Y系列「其他工艺」(源数据无工艺关键词) |
| 系列 | ${fill("wSeries")} | wayon 系列只认 洞石/木纹/质感 等特定石种，其余归默认岩板入口 |

> 尺寸/厚度 来自本地审计分类（可靠）；颜色/工艺/系列 来自 wayon 推导函数。
> 空白格导入时该字段留空即可，不影响产品上传；如需补全可增强推导或人工补。

## 判重与导入注意

1. 判重用 wayon 的 \`extractTradeCode\` 抽编码 → 归一化(去横线/大写)比对，与 wayon 导入逻辑一致。
2. **无编码 ${noCodeUp} 个**：前缀 MT/L9/OIR/MSS/JS/HY 不在 wayon extractTradeCode 名单 → 导入需扩展正则或用产品名兜底生成 slug。
3. wayon 尺寸枚举无 1200×1200 / 1200×3000；厚度枚举无 11mm（→自定义）。出现这些的产品上面 wayon尺寸/厚度 列会为空。
4. 正式导入每个产品 create 前再按 slug 查一次 wayon，双保险防重。

_本文档与 4 个 CSV 同目录：output/导入清单/_
`;
fs.writeFileSync(`${OUTDIR}/README.md`, md);

console.log("已生成 output/导入清单/：README.md + 4 个 CSV");
console.log(`待上传 ${toUpload.length}（无编码 ${noCodeUp}）| 已上传 ${uploaded.length} | banner ${banners.length} | wayon独有 ${wayonOnly.length}`);
