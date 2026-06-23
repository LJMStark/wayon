#!/usr/bin/env node
// 只读核对：按 slug 查刚导入的产品，打印字段 + 图片真实 URL，并 HTTP HEAD 验证图能打开。
// 用法: node --env-file=.env.local scripts/verify-imported.mjs slug1 slug2 ...
import { getPayload } from "payload";

const slugs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const config = (await import("../src/payload.config.ts")).default;
const payload = await getPayload({ config });

for (const slug of slugs) {
  const res = await payload.find({ collection: "products", where: { slug: { equals: slug } }, depth: 2, limit: 1 });
  const p = res.docs[0];
  if (!p) { console.log(`\n❌ ${slug} 未找到`); continue; }
  console.log(`\n=== ${p.slug} (${p.productCode}) | ${typeof p.title === "string" ? p.title : p.title?.zh} ===`);
  console.log(`  发布:${p.published} 分类:${p.catalogMode} 尺寸:${p.size} 厚度:${p.thickness} 工艺:${p.process} 颜色:${p.colorGroup} 系列:${JSON.stringify(p.seriesTypes)}`);
  const urlsOf = (arr) => (arr || []).map((x) => x.mediaRef?.url || x.publicUrl).filter(Boolean);
  for (const [label, key] of [["材质纹理", "elementImages"], ["实景应用", "spaceImages"], ["工地实拍", "realImages"]]) {
    const urls = urlsOf(p[key]);
    console.log(`  ${label}(${urls.length}):`);
    for (const u of urls) {
      try {
        const r = await fetch(u, { method: "HEAD" });
        console.log(`     ${r.ok ? "✅" : "❌ " + r.status} ${u}  (${r.headers.get("content-type")}, ${r.headers.get("content-length")}B)`);
      } catch (e) { console.log(`     ❌ fetch失败 ${u} — ${e.message}`); }
    }
  }
}
process.exit(0);
