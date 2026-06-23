// 把 待确定暂不导入/ 里"有码+枚举尺寸"的产品移回 output/images(本属规范,被旧提取器误判归档)。
// 非枚举尺寸(1200×1200/1200×3000/未分类)与无码(乘风破浪)保持归档。
// 用法: node scripts/restore-importable.mjs [--apply]
import fs from "node:fs";
import path from "node:path";
import { TRADE_SIZES } from "../src/features/products/lib/tradeCatalog.ts";
const APPLY = process.argv.includes("--apply");
const SC = "/Users/demon/vibecoding/miniprogram-scraper";
const org = await import(`${SC}/src/organize.mjs`);
const { sizeDir, prdDir } = org;
const ps = JSON.parse(fs.readFileSync(`${SC}/output/products.json`,"utf8"));
const byName = new Map(); for(const p of ps){const k=prdDir(p);(byName.get(k)||byName.set(k,[]).get(k)).push(p);}
const SIZE_SET = new Set(TRADE_SIZES);
const myCode = (t)=>{const m=String(t||"").match(/^[A-Za-z0-9][A-Za-z0-9‐‑-]*/);return m?m[0]:null;};
const wSizeOk = (p)=>{const m=String(sizeDir(p)).match(/(\d{3,4})[×x](\d{3,4})/);return m&&SIZE_SET.has(`${m[1]}X${m[2]}mm`);};
const ARCH = `${SC}/output/待确定暂不导入`;
const leaves=[];(function w(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d,{withFileTypes:true})){const f=path.join(d,e.name);if(e.isDirectory()){const sub=fs.readdirSync(f,{withFileTypes:true});if(sub.some(x=>x.isFile()&&/\.(jpg|jpeg|png|mp4)$/i.test(x.name)))leaves.push(f);else w(f);}}})(`${ARCH}/images`);
const move=[], keep=[];
for(const abs of leaves){
  const rel=path.relative(`${ARCH}/images`,abs), name=path.basename(rel);
  const cands=byName.get(name)||[]; const p=cands[0];
  const code = p?myCode(p.title):null;
  const ok = p && code && wSizeOk(p);
  if(ok) move.push({rel,p}); else keep.push({rel,reason: !code?"无码":"非枚举尺寸"});
}
console.log(`待确定 ${leaves.length} | 移回(有码+枚举尺寸): ${move.length} | 保持归档: ${keep.length}`);
console.log("\n将移回:");
move.forEach(m=>console.log(`  ${m.rel}  [码=${myCode(m.p.title)} 尺寸=${sizeDir(m.p)}]`));
console.log("\n保持归档(原因):");
const byR={};keep.forEach(k=>byR[k.reason]=(byR[k.reason]||0)+1);console.log("  "+JSON.stringify(byR));
if(!APPLY){console.log("\n(dry-run，加 --apply 执行)");process.exit(0);}
let n=0;
for(const m of move){
  for(const sub of ["images","主图归档"]){
    const from=path.join(ARCH,sub,m.rel), to=`${SC}/output/${sub}/${m.rel}`;
    if(fs.existsSync(from)){fs.mkdirSync(path.dirname(to),{recursive:true});fs.renameSync(from,to);n++;}
  }
}
// 清空残留空目录
(function rm(d){if(!fs.existsSync(d))return;for(const e of fs.readdirSync(d)){const f=path.join(d,e);if(fs.statSync(f).isDirectory())rm(f);}const left=fs.readdirSync(d).filter(x=>x!==".DS_Store");if(left.length===0&&d!==ARCH){for(const x of fs.readdirSync(d))fs.unlinkSync(path.join(d,x));fs.rmdirSync(d);}})(ARCH);
console.log(`\n✅ 移回 ${n} 个目录(images+归档)`);
