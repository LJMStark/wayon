#!/usr/bin/env node
// Read-only: verify the 5 SEO news drafts were created with all 4 locales.
import { getPayload } from "payload";

const config = (await import("../src/payload.config.ts")).default;
const payload = await getPayload({ config });

const SLUGS = [
  "what-is-sintered-stone",
  "sintered-stone-vs-quartz-vs-marble",
  "sintered-slab-thickness-guide",
  "sourcing-sintered-slabs-from-china",
  "sintered-slab-architectural-applications",
];

for (const slug of SLUGS) {
  const r = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: "all",
  });
  const doc = r.docs[0];
  if (!doc) {
    console.log(`MISSING ${slug}`);
    continue;
  }
  const titles = doc.title || {};
  const bodyLocales = Object.keys(doc.body || {}).filter((k) => doc.body[k]?.root);
  console.log(`OK ${slug}`);
  console.log(`   id=${doc.id}  publishedAt=${doc.publishedAt}  category=${doc.category}`);
  console.log(`   titles: zh="${titles.zh ? "✓" : "✗"}" en="${titles.en ? "✓" : "✗"}" es="${titles.es ? "✓" : "✗"}" ar="${titles.ar ? "✓" : "✗"}"`);
  console.log(`   body locales with content: [${bodyLocales.join(", ")}]`);
}
process.exit(0);
