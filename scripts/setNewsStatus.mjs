#!/usr/bin/env node
// Toggle a News doc between draft and published.
//
// Usage:
//   node --env-file=.env.local scripts/setNewsStatus.mjs --id <uuid> --status published
//   node --env-file=.env.local scripts/setNewsStatus.mjs --id <uuid> --status draft

import { getPayload } from "payload";

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--id") args.id = argv[++i];
    else if (a === "--status") args.status = argv[++i];
  }
  if (!args.id || !["draft", "published"].includes(args.status)) {
    console.error("Usage: --id <uuid> --status draft|published");
    process.exit(2);
  }
  return args;
}

async function main() {
  const { id, status } = parseArgs(process.argv);
  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  await payload.update({
    collection: "news",
    id,
    locale: "zh",
    data: { _status: status },
  });
  const doc = await payload.findByID({ collection: "news", id, depth: 0, locale: "zh" });
  console.log(`OK: news id=${id} → _status=${doc._status}, slug=${doc.slug}`);
  process.exit(0);
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
