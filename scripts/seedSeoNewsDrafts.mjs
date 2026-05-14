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
  "seo-luxury-sintered-stone-vs-tile": "2026-05-14T09:00:00.000Z",
  "seo-sintered-stone-marble-replication": "2026-05-15T09:00:00.000Z",
  "seo-wall-floor-application-sintered-stone": "2026-05-16T09:00:00.000Z",
  "seo-fireproof-sintered-stone-grade": "2026-05-17T09:00:00.000Z",
  "seo-marble-too-expensive-sintered-stone": "2026-05-18T09:00:00.000Z",
};

// Article slug → cover image filename (from R2 / media collection).
// Empty string means no cover assigned at seed time — admin to pick one later.
const COVER_IMAGES = {
  "what-is-sintered-stone": "showroom-001.jpg",
  "sintered-stone-vs-quartz-vs-marble": "case-sales-002.jpg",
  "sintered-slab-thickness-guide": "showroom-005.jpg",
  "sourcing-sintered-slabs-from-china": "showroom-008.jpg",
  "sintered-slab-architectural-applications": "case-sales-006.jpg",
  "seo-luxury-sintered-stone-vs-tile": "showroom-001.jpg",
  "seo-sintered-stone-marble-replication": "showroom-005.jpg",
  "seo-wall-floor-application-sintered-stone": "case-sales-006.jpg",
  "seo-fireproof-sintered-stone-grade": "showroom-008.jpg",
  "seo-marble-too-expensive-sintered-stone": "case-sales-002.jpg",
};

const SLUGS = [
  "what-is-sintered-stone",
  "sintered-stone-vs-quartz-vs-marble",
  "sintered-slab-thickness-guide",
  "sourcing-sintered-slabs-from-china",
  "sintered-slab-architectural-applications",
  "seo-luxury-sintered-stone-vs-tile",
  "seo-sintered-stone-marble-replication",
  "seo-wall-floor-application-sintered-stone",
  "seo-fireproof-sintered-stone-grade",
  "seo-marble-too-expensive-sintered-stone",
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

    // zh + en are mandatory; es/ar are optional (warn but allow --apply with 2 locales).
    if (!localized.zh || !localized.en) {
      console.error(`  FAIL missing zh and/or en entries for ${slug}`);
      failed++;
      continue;
    }
    const missingLocales = [];
    if (!localized.es) missingLocales.push("es");
    if (!localized.ar) missingLocales.push("ar");
    if (missingLocales.length > 0) {
      console.warn(`  WARN missing locales: ${missingLocales.join(", ")} — will seed zh+en only`);
    }

    let coverId = null;
    if (coverFilename) {
      coverId = await findCoverImageId(payload, coverFilename);
      console.log(`  cover: ${coverFilename}  (${coverId})`);
    } else {
      console.log(`  cover: (none — admin to pick)`);
    }

    // Build lexical bodies. ar uses RTL, others LTR.
    const bodyZh = buildLexicalDoc(localized.zh.blocks, { rtl: false });
    const bodyEn = buildLexicalDoc(localized.en.blocks, { rtl: false });
    const bodyEs = localized.es ? buildLexicalDoc(localized.es.blocks, { rtl: false }) : null;
    const bodyAr = localized.ar ? buildLexicalDoc(localized.ar.blocks, { rtl: true }) : null;

    if (DRY_RUN) {
      const locCount = 2 + (localized.es ? 1 : 0) + (localized.ar ? 1 : 0);
      console.log(`  PLAN create draft + ${locCount} locales`);
      console.log(`    zh title: ${localized.zh.title}`);
      console.log(`    en title: ${localized.en.title}`);
      if (localized.es) console.log(`    es title: ${localized.es.title}`);
      if (localized.ar) console.log(`    ar title: ${localized.ar.title}`);
      const counts = [`zh=${localized.zh.blocks.length}`, `en=${localized.en.blocks.length}`];
      if (localized.es) counts.push(`es=${localized.es.blocks.length}`);
      if (localized.ar) counts.push(`ar=${localized.ar.blocks.length}`);
      console.log(`    body blocks counts: ${counts.join(", ")}`);
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
        const updateData = {
          slug,
          publishedAt: PUBLISHED_AT[slug],
          category: "industry",
          title: localized.zh.title,
          excerpt: localized.zh.excerpt,
          body: bodyZh,
        };
        if (coverId) updateData.coverImage = coverId;
        await payload.update({
          collection: "news",
          id: docId,
          locale: "zh",
          data: updateData,
        });
        updated++;
      } else {
        // Initial create writes default locale (zh) localized fields.
        const createData = {
          slug,
          publishedAt: PUBLISHED_AT[slug],
          category: "industry",
          title: localized.zh.title,
          excerpt: localized.zh.excerpt,
          body: bodyZh,
        };
        if (coverId) createData.coverImage = coverId;
        const createdDoc = await payload.create({
          collection: "news",
          locale: "zh",
          data: createData,
        });
        docId = createdDoc.id;
        console.log(`  CREATED id=${docId}`);
        created++;
      }

      // Add the other locales that have content.
      for (const loc of ["en", "es", "ar"]) {
        const data = localized[loc];
        const body = loc === "en" ? bodyEn : loc === "es" ? bodyEs : bodyAr;
        if (!data || !body) continue;
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
