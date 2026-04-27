#!/usr/bin/env node
// Seed 5 SEO industry-knowledge articles into the Payload `news` collection.
//
// Each article is created in 4 locales (zh/en/es/ar). publishedAt is set far
// in the future (2099-01-01) so anonymous traffic on /news cannot see them —
// admin editors can review, edit, and shift publishedAt to publish.
//
// Cover images are picked from existing R2 media (showroom / case-sales).
//
// Usage:
//   node --env-file=.env.local scripts/seedSeoNewsDrafts.mjs            # dry-run
//   node --env-file=.env.local scripts/seedSeoNewsDrafts.mjs --apply    # execute

import { getPayload } from "payload";

import { articles_en } from "./seoArticles/articles.en.mjs";
import { articles_zh } from "./seoArticles/articles.zh.mjs";
import { articles_es } from "./seoArticles/articles.es.mjs";
import { articles_ar } from "./seoArticles/articles.ar.mjs";
import { buildLexicalDoc } from "./seoArticles/lexical.mjs";

const DRY_RUN = !process.argv.includes("--apply");

// Per-article publish dates. Staggered across the past ~3 weeks so the news
// feed reads as a steady drumbeat rather than five articles dropped at once.
const PUBLISHED_AT = {
  "what-is-sintered-stone": "2026-04-10T09:30:00.000Z",
  "sintered-stone-vs-quartz-vs-marble": "2026-04-15T10:00:00.000Z",
  "sintered-slab-thickness-guide": "2026-04-19T09:45:00.000Z",
  "sourcing-sintered-slabs-from-china": "2026-04-23T10:15:00.000Z",
  "sintered-slab-architectural-applications": "2026-04-27T09:30:00.000Z",
};

// Article slug → cover image filename (from R2 / media collection)
const COVER_IMAGES = {
  "what-is-sintered-stone": "showroom-001.jpg",
  "sintered-stone-vs-quartz-vs-marble": "case-sales-002.jpg",
  "sintered-slab-thickness-guide": "showroom-005.jpg",
  "sourcing-sintered-slabs-from-china": "showroom-008.jpg",
  "sintered-slab-architectural-applications": "case-sales-006.jpg",
};

const SLUGS = [
  "what-is-sintered-stone",
  "sintered-stone-vs-quartz-vs-marble",
  "sintered-slab-thickness-guide",
  "sourcing-sintered-slabs-from-china",
  "sintered-slab-architectural-applications",
];

function localesFor(slug) {
  return {
    zh: articles_zh[slug],
    en: articles_en[slug],
    es: articles_es[slug],
    ar: articles_ar[slug],
  };
}

async function findCoverImageId(payload, filename) {
  const r = await payload.find({
    collection: "media",
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  });
  if (!r.docs[0]) throw new Error(`Cover image not found: ${filename}`);
  return r.docs[0].id;
}

async function findExistingNewsBySlug(payload, slug) {
  const r = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: "zh",
  });
  return r.docs[0] || null;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY-RUN" : "APPLY"}\n`);

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });

  process.on("uncaughtException", (err) => {
    console.error(`  WARN uncaughtException: ${err.message}`);
  });

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const slug of SLUGS) {
    console.log(`\n=== ${slug} ===`);
    const localized = localesFor(slug);
    const coverFilename = COVER_IMAGES[slug];

    if (!localized.zh || !localized.en || !localized.es || !localized.ar) {
      console.error(`  FAIL missing one or more language entries for ${slug}`);
      failed++;
      continue;
    }

    const coverId = await findCoverImageId(payload, coverFilename);
    console.log(`  cover: ${coverFilename}  (${coverId})`);

    // Build lexical bodies. ar uses RTL, others LTR.
    const bodyZh = buildLexicalDoc(localized.zh.blocks, { rtl: false });
    const bodyEn = buildLexicalDoc(localized.en.blocks, { rtl: false });
    const bodyEs = buildLexicalDoc(localized.es.blocks, { rtl: false });
    const bodyAr = buildLexicalDoc(localized.ar.blocks, { rtl: true });

    if (DRY_RUN) {
      console.log(`  PLAN create draft + 4 locales`);
      console.log(`    zh title: ${localized.zh.title}`);
      console.log(`    en title: ${localized.en.title}`);
      console.log(`    es title: ${localized.es.title}`);
      console.log(`    ar title: ${localized.ar.title}`);
      console.log(`    body blocks counts: zh=${localized.zh.blocks.length}, en=${localized.en.blocks.length}, es=${localized.es.blocks.length}, ar=${localized.ar.blocks.length}`);
      created++;
      continue;
    }

    try {
      const existing = await findExistingNewsBySlug(payload, slug);

      let docId;
      if (existing) {
        console.log(`  EXISTS id=${existing.id}, updating all locales`);
        docId = existing.id;
        // Update non-localized + zh fields first (zh = default locale).
        await payload.update({
          collection: "news",
          id: docId,
          locale: "zh",
          data: {
            slug,
            publishedAt: PUBLISHED_AT[slug],
            category: "industry",
            coverImage: coverId,
            title: localized.zh.title,
            excerpt: localized.zh.excerpt,
            body: bodyZh,
          },
        });
        updated++;
      } else {
        // Initial create writes default locale (zh) localized fields.
        const createdDoc = await payload.create({
          collection: "news",
          locale: "zh",
          data: {
            slug,
            publishedAt: PUBLISHED_AT[slug],
            category: "industry",
            coverImage: coverId,
            title: localized.zh.title,
            excerpt: localized.zh.excerpt,
            body: bodyZh,
          },
        });
        docId = createdDoc.id;
        console.log(`  CREATED id=${docId}`);
        created++;
      }

      // Add the other three locales.
      for (const loc of ["en", "es", "ar"]) {
        const data = localized[loc];
        const body = loc === "en" ? bodyEn : loc === "es" ? bodyEs : bodyAr;
        await payload.update({
          collection: "news",
          id: docId,
          locale: loc,
          data: {
            title: data.title,
            excerpt: data.excerpt,
            body,
          },
        });
        console.log(`    + locale ${loc}`);
      }
    } catch (err) {
      failed++;
      console.error(`  FAIL ${slug}: ${err.message}`);
      if (err.stack) console.error(err.stack.split("\n").slice(0, 4).join("\n"));
    }
  }

  console.log(`\n=== Summary (${DRY_RUN ? "dry-run" : "applied"}) ===`);
  console.log(`Created:  ${created}`);
  console.log(`Updated:  ${updated}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Failed:   ${failed}`);
  if (DRY_RUN) console.log(`\nRun with --apply to execute.`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
