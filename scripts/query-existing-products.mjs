#!/usr/bin/env node
// 只读：拉取 wayon Payload 里已有的全部产品，输出快照（不含任何密钥）。
// 用法: node --env-file=.env.local scripts/query-existing-products.mjs
import { getPayload } from "payload";
import { writeFileSync } from "node:fs";

const OUT = "/Users/demon/vibecoding/miniprogram-scraper/output/wayon-existing-products.json";

const config = (await import("../src/payload.config.ts")).default;
const payload = await getPayload({ config });

const all = [];
let page = 1;
for (;;) {
  const res = await payload.find({
    collection: "products",
    depth: 0,
    limit: 200,
    page,
    pagination: true,
  });
  for (const d of res.docs) {
    all.push({
      id: d.id,
      slug: d.slug,
      productCode: d.productCode,
      title: typeof d.title === "string" ? d.title : (d.title?.zh ?? d.title),
      published: d.published,
      catalogMode: d.catalogMode,
      size: d.size,
      thickness: d.thickness,
      process: d.process,
      seriesTypes: d.seriesTypes,
      hasImage: !!d.image,
      elementCount: (d.elementImages || []).length,
      spaceCount: (d.spaceImages || []).length,
      realCount: (d.realImages || []).length,
      videoCount: (d.videos || []).length,
    });
  }
  if (page >= res.totalPages) break;
  page++;
}

writeFileSync(OUT, JSON.stringify(all, null, 2));
console.log(`wayon 现有产品总数: ${all.length}`);
console.log(`已发布: ${all.filter((p) => p.published).length} | 未发布: ${all.filter((p) => !p.published).length}`);
console.log(`常规: ${all.filter((p) => p.catalogMode === "standard").length} | 定制: ${all.filter((p) => p.catalogMode === "custom").length}`);
console.log(`有封面图: ${all.filter((p) => p.hasImage).length}`);
console.log("快照已写入:", OUT);
console.log("\n样例(前8):");
all.slice(0, 8).forEach((p) => console.log(`  ${p.slug} | ${p.title} | 发布=${p.published} | 元素${p.elementCount}/空间${p.spaceCount}/实拍${p.realCount}`));
process.exit(0);
