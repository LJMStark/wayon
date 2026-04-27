#!/usr/bin/env node
// Read-only: list media samples per category, used to pick cover images for SEO articles.
import { getPayload } from "payload";

const config = (await import("../src/payload.config.ts")).default;
const payload = await getPayload({ config });

const cats = ["license", "showroom", "factory", "case-sales", "case-factory", "product"];
for (const c of cats) {
  const r = await payload.find({
    collection: "media",
    where: { category: { equals: c } },
    limit: 8,
    depth: 0,
    sort: "filename",
  });
  console.log(`\n[${c}] total=${r.totalDocs}`);
  for (const d of r.docs) console.log(`  ${d.id}  ${d.filename}`);
}
process.exit(0);
