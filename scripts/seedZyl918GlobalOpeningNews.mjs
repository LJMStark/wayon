#!/usr/bin/env node
// Seed the ZYL 918 / Global Hall opening article into Payload news.
//
// Usage:
//   node --env-file=.env.local scripts/seedZyl918GlobalOpeningNews.mjs
//   node --env-file=.env.local scripts/seedZyl918GlobalOpeningNews.mjs --apply

import { getPayload } from "payload";

import { zyl918GlobalOpening } from "./newsArticles/zyl918GlobalOpening.mjs";
import { buildLexicalDoc } from "./seoArticles/lexical.mjs";

const DRY_RUN = !process.argv.includes("--apply");
const LOCALES = ["zh", "en", "es", "ar"];

async function findExistingNewsBySlug(payload, slug) {
  const result = await payload.find({
    collection: "news",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale: "zh",
  });
  return result.docs[0] || null;
}

async function main() {
  console.log(`Mode: ${DRY_RUN ? "DRY-RUN" : "APPLY"}`);
  console.log(`Slug: ${zyl918GlobalOpening.slug}`);

  const config = (await import("../src/payload.config.ts")).default;
  const payload = await getPayload({ config });
  const existing = await findExistingNewsBySlug(
    payload,
    zyl918GlobalOpening.slug
  );
  const body = buildLexicalDoc(zyl918GlobalOpening.blocks, { rtl: false });

  if (DRY_RUN) {
    console.log(existing ? `PLAN update ${existing.id}` : "PLAN create");
    console.log(`Title: ${zyl918GlobalOpening.title}`);
    console.log(`Published: ${zyl918GlobalOpening.publishedAt}`);
    console.log(`Body blocks: ${zyl918GlobalOpening.blocks.length}`);
    console.log("Run with --apply to execute.");
    return;
  }

  let docId;
  if (existing) {
    docId = existing.id;
    await payload.update({
      collection: "news",
      id: docId,
      locale: "zh",
      data: {
        slug: zyl918GlobalOpening.slug,
        publishedAt: zyl918GlobalOpening.publishedAt,
        category: zyl918GlobalOpening.category,
        title: zyl918GlobalOpening.title,
        excerpt: zyl918GlobalOpening.excerpt,
        body,
      },
    });
    console.log(`Updated ${docId}`);
  } else {
    const created = await payload.create({
      collection: "news",
      locale: "zh",
      data: {
        slug: zyl918GlobalOpening.slug,
        publishedAt: zyl918GlobalOpening.publishedAt,
        category: zyl918GlobalOpening.category,
        title: zyl918GlobalOpening.title,
        excerpt: zyl918GlobalOpening.excerpt,
        body,
      },
    });
    docId = created.id;
    console.log(`Created ${docId}`);
  }

  for (const locale of LOCALES.filter((locale) => locale !== "zh")) {
    await payload.update({
      collection: "news",
      id: docId,
      locale,
      data: {
        title: zyl918GlobalOpening.title,
        excerpt: zyl918GlobalOpening.excerpt,
        body,
      },
    });
    console.log(`Updated locale ${locale}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Fatal:", err);
    process.exit(1);
  });
