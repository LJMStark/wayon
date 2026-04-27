#!/usr/bin/env node
// One-shot scan: which Payload records still reference .mov / .heic / .MOV / .HEIC
// in publicUrl or sourcePath fields. Read-only — does not modify anything.
//
// Usage:
//   node --env-file=.env.local scripts/scanLegacyMediaReferences.mjs

import {getPayload} from "payload";

const SUSPECT_PATTERN = /\.(mov|heic)(\?|$|"|')/i;

const config = (await import("../src/payload.config.ts")).default;
const payload = await getPayload({config});

const collections = ["products", "productVariants", "media", "news"];
const findings = [];

for (const slug of collections) {
  let page = 1;
  while (true) {
    const res = await payload.find({
      collection: slug,
      limit: 100,
      page,
      depth: 0,
    });
    for (const doc of res.docs) {
      const json = JSON.stringify(doc);
      if (SUSPECT_PATTERN.test(json)) {
        const matches = [...json.matchAll(/"[^"]*\.(?:mov|heic)[^"]*"/gi)].map((m) => m[0]);
        findings.push({collection: slug, id: doc.id, matches: [...new Set(matches)]});
      }
    }
    if (page >= res.totalPages) break;
    page += 1;
  }
}

console.log(`Found ${findings.length} record(s) with .mov / .heic references.\n`);
for (const f of findings.slice(0, 30)) {
  console.log(`[${f.collection}] ${f.id}`);
  for (const m of f.matches.slice(0, 4)) {
    console.log(`    ${m}`);
  }
}
if (findings.length > 30) {
  console.log(`\n…and ${findings.length - 30} more.`);
}

process.exit(0);
