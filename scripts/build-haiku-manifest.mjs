import fs from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import { hasAnyLocalizedDescription } from "../src/features/products/lib/productCopyGeneration.mts";
const SC = "/Users/demon/vibecoding/miniprogram-scraper";
const org = await import(`${SC}/src/organize.mjs`);
const { sizeDir, thicknessDir, finishDir, prdDir } = org;
const myCode = (t) => { const m = String(t||"").match(/^[A-Za-z0-9][A-Za-z0-9‐‑-]*/); return m ? m[0].replace(/[‐‑]/g,"-").toLowerCase() : null; };
// 1) DB 中无描述的产品
const p = await getPayload({ config: (await import("../src/payload.config.ts")).default });
const all=[]; let pg=1; for(;;){const r=await p.find({collection:"products",locale:"all",depth:0,limit:300,page:pg});all.push(...r.docs);if(pg>=r.totalPages)break;pg++;}
const need = new Map();
for (const d of all) if (!hasAnyLocalizedDescription(d.description)) need.set((d.slug||"").toLowerCase(), {
  slug: d.slug, name: (typeof d.title==="string"?d.title:d.title?.zh)||d.slug,
  size: d.size||"", thickness: d.thickness||"", color: d.colorGroup||"", process: d.process||"",
  series: Array.isArray(d.seriesTypes)?d.seriesTypes.join("/"):"",
});
// 2) scraper 本地图: slug -> 图片路径
const IMG = path.join(SC, "output/images");
const slugImgs = new Map();
(function w(dir){ for(const e of fs.readdirSync(dir,{withFileTypes:true})){ const f=path.join(dir,e.name); if(e.isDirectory()){const sub=fs.readdirSync(f,{withFileTypes:true});const files=sub.filter(x=>x.isFile()&&/\.(jpg|jpeg|png)$/i.test(x.name)).map(x=>x.name);if(files.length){const s=myCode(e.name);if(s){const pick=["元素图1","空间图1","实拍图1","主图1"].map(t=>files.find(ff=>ff.includes("_"+t))).filter(Boolean).slice(0,2);slugImgs.set(s,pick.map(ff=>path.join(f,ff)));}}else w(f);} } })(IMG);
// 3) 合并
const manifest=[];
for (const [slug,info] of need) manifest.push({ ...info, images: slugImgs.get(slug)||[] });
fs.writeFileSync("/tmp/haiku-manifest.json", JSON.stringify(manifest));
const withImg = manifest.filter(m=>m.images.length).length;
console.log("待生成:", manifest.length, "| 有本地图:", withImg, "| 仅文本(无图):", manifest.length-withImg);
console.log("→ /tmp/haiku-manifest.json");
process.exit(0);
