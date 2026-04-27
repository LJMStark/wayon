/**
 * fixProductTitles.mjs
 *
 * One-shot fix: products imported by import422Catalog.mjs had their title
 * stored as a serialized JSON string (e.g. '{"zh":"花开富贵","en":"花开富贵"}')
 * instead of a plain string in each locale.
 *
 * This script finds all affected products, parses the real name out of the
 * stored JSON, and writes the correct value to each locale.
 *
 * Usage:
 *   node --env-file=.env.local scripts/fixProductTitles.mjs            # dry-run
 *   node --env-file=.env.local scripts/fixProductTitles.mjs --apply    # fix
 */

import { getPayload } from "payload";

const dryRun = !process.argv.includes("--apply");

async function main() {
  process.on("uncaughtException", (err) => {
    if (err.message?.includes("Connection terminated") || err.code === "ECONNRESET") {
      console.warn("[pool] connection dropped, next query will reconnect");
    } else {
      console.error("Fatal:", err);
      process.exit(1);
    }
  });

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  if (payload.db?.pool) {
    payload.db.pool.on("error", (err) => {
      if (err.message?.includes("Connection terminated") || err.code === "ECONNRESET") {
        console.warn("[pool] connection dropped, next query will reconnect");
      } else {
        console.error("[pool error]", err.message);
      }
    });
  }

  console.log(`Mode: ${dryRun ? "DRY-RUN (pass --apply to write)" : "APPLY"}`);

  // Fetch all products with their zh-locale title (default locale)
  const { docs } = await payload.find({
    collection: "products",
    locale: "all",
    where: { normalizedName: { exists: true } },
    limit: 5000,
    depth: 0,
    overrideAccess: true,
  });

  // Detect affected: zh title looks like a JSON object string
  const affected = docs.filter((doc) => {
    const zhTitle = doc.title?.zh;
    return typeof zhTitle === "string" && zhTitle.startsWith('{"zh":');
  });

  console.log(`Found ${affected.length} product(s) with malformed title (out of ${docs.length} total)`);
  if (affected.length === 0) {
    console.log("Nothing to fix.");
    process.exit(0);
  }

  let fixed = 0;
  let failed = 0;

  for (const doc of affected) {
    let realName;
    try {
      const parsed = JSON.parse(doc.title.zh);
      realName = parsed.zh ?? parsed.en ?? "";
    } catch {
      console.error(`  SKIP ${doc.id} — cannot parse title: ${doc.title?.zh}`);
      failed += 1;
      continue;
    }

    if (!realName) {
      console.error(`  SKIP ${doc.id} — parsed name is empty`);
      failed += 1;
      continue;
    }

    if (dryRun) {
      console.log(`  [dry] ${doc.id} (${doc.slug}) → "${realName}"`);
    } else {
      try {
        await payload.update({
          collection: "products",
          id: doc.id,
          locale: "zh",
          data: { title: realName },
          overrideAccess: true,
        });
        await payload.update({
          collection: "products",
          id: doc.id,
          locale: "en",
          data: { title: realName },
          overrideAccess: true,
        });
        fixed += 1;
        if (fixed % 25 === 0 || fixed === affected.length - failed) {
          console.log(`  fixed ${fixed}/${affected.length}`);
        }
      } catch (err) {
        console.error(`  ERROR ${doc.id}:`, err.message);
        failed += 1;
      }
    }
  }

  if (!dryRun) {
    console.log(`Done. fixed=${fixed} failed=${failed}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
