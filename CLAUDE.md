# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Next.js 16.2.4 multilingual corporate website** for a stone/building materials company (ZYL Sintered Stone), backed by **Payload CMS 3.83** with a Postgres database and Cloudflare R2 for media storage. The site has 4 locales (en, zh, es, ar) and features a product catalog, news section, and contact forms.

**Production**: Deployed via **Zeabur** on a self-hosted server. Production domain: `zylsinteredstone.com`. This is **not** Vercel — there are no Serverless function size limits, no Edge Network behavior to assume, and `vercel.json` does not apply.

## Common Commands

```bash
# Start development server (http://localhost:3000)
# Rule: If port 3000 is occupied, stop the process first (e.g., kill -9 $(lsof -t -i:3000)) and run again.
npm run dev
npm run build      # Production build
npm run start      # Start production server
npm run lint       # ESLint
npm run typecheck  # next typegen + tsc --noEmit
npm test           # Vitest unit tests
npm run test:watch
npm run test:e2e   # Playwright (needs dev server on :3000)

# Payload CMS
npm run payload                   # Payload CLI passthrough
npm run generate:types            # Regenerate src/payload-types.ts
npm run generate:importmap        # Regenerate Payload admin import map

# One-shot maintenance scripts live in scripts/ (see "Migration Scripts" below).
# DB-writing scripts default to dry-run; pass `-- --apply` only after reviewing the target DB and expected writes.
```

`docs/4.22` product identity rule: **one product code equals one product**. Chinese display names are not identity keys. Same Chinese name with different codes must remain separate products, and import scripts must never merge by display name.

**Tests** are Vitest, co-located next to the code they cover (`*.test.ts` and `*.test.tsx` under `src/`). Run a single file with `npx vitest run path/to/file.test.ts`. Tests run in the Node environment with no jsdom setup. Prefer pure-function tests where possible; component/page tests are allowed when they can run without a browser DOM by directly calling components or mocking Next/i18n dependencies.

**Payload Admin** is embedded at `/admin` (requires running dev server + valid `DATABASE_URL`).

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── [locale]/                    # Locale-segmented public routes (zh, en, es, ar)
│   │   ├── page.tsx                 # Home (static site copy/assets; no CMS queries)
│   │   ├── about/, products/, solution/, news/, news/[slug]/,
│   │   ├── cases/, contact/, download/, privacy/, terms/
│   ├── (payload)/                   # Payload CMS routes (route group, not localized)
│   │   ├── admin/[[...segments]]/   # Embedded admin UI
│   │   ├── api/[...slug]/           # Payload REST endpoints
│   │   └── layout.tsx
│   ├── api/trade-media/             # Disk-backed media proxy (legacy fallback)
│   └── actions/                     # Server Actions (inquiry.ts)
├── components/                      # Shared UI (layout/, landing/, products/)
├── features/                        # Feature modules (home, products, news, shared)
│   └── {feature}/{model,lib,components}/
├── payload/
│   ├── collections/                 # Payload collection schemas
│   │   ├── Users.ts, Media.ts, CustomCapabilities.ts,
│   │   ├── Products.ts, News.ts, Inquiries.ts
│   └── hooks/                       # slug auto-generation, etc.
├── data/                            # Server-side data fetchers (products.ts, news.ts, _payload.ts)
├── i18n/                            # next-intl routing + request config
├── lib/                             # env validation (env.ts, server-env.ts), payload-config.ts
├── messages/                        # Translation JSON per locale
├── payload.config.ts                # Payload root config
└── payload-types.ts                 # Generated types (do not hand-edit)
```

### Key Architecture Decisions

- **Server Components by default** — use `'use client'` only when needed
- **Two route groups in `src/app/`**:
  - `[locale]/` — public-facing, locale-segmented, indexed
  - `(payload)/` — admin + REST, not localized, never indexed
- **Homepage is static site copy/assets** — `src/app/[locale]/page.tsx` + `src/features/home/` run zero CMS queries and render code-owned copy plus `/public/assets/...`. Payload news/products/categories do NOT affect the homepage; CMS news is shown on `/news` routes only
- **Server Actions** for form submissions (inquiry → Resend email + Payload `inquiries` collection)
- **RTL support** — Arabic (`ar`) uses `dir="rtl"`; no separate component variants needed
- **`src/app/[locale]/loading.tsx`** — shared skeleton shown while any locale page segment suspends; edit this for global loading UX
- **`src/app/not-found.tsx`** (root, no locale context) — inline styles only, Tailwind classes do not apply at this level; `src/app/[locale]/not-found.tsx` handles the locale-aware 404
- **GraphQL is disabled** in `payload.config.ts` (`graphQL: { disable: true }`) because Payload's auto-generated GraphQL enum names choke on Chinese characters in collection slugs/labels

### UI Layout Stability

Any frontend, CSS, typography, image, animation, or responsive-layout change must keep the affected pages free of visible overlap, collision, clipping, or unintended misalignment across browsers, operating systems, font rendering differences, zoom levels, and responsive breakpoints.

- Do not rely on a single desktop viewport. Check mobile, tablet, regular desktop, ultrawide, and short-height desktop layouts when the changed area can affect page structure.
- Treat browser differences, OS font metrics, fallback fonts, translated text length, and 100%/125% browser zoom as real constraints. Layout must still wrap, shrink, space, or reposition cleanly.
- Use defensive CSS for fixed headers, hero sections, navigation, cards, media, controls, and text blocks: stable dimensions, `min`/`max` bounds, safe padding, wrapping rules, overflow handling, and breakpoint-specific sizing.
- Before finishing frontend work, verify the affected page in representative viewports such as `390x844`, `768x1024`, `1440x900`, and `1920x768`. Include Chromium, WebKit, and Firefox when the change touches layout-sensitive areas.
- If any supported browser, system, or responsive layout can show overlapping or misaligned UI, fix it before considering the task complete.

### Payload CMS

- **Database**: Postgres (`@payloadcms/db-postgres`) via `DATABASE_URL`. UUID primary keys
- **Media storage**: Cloudflare R2 (`@payloadcms/storage-s3` plugin, S3-compatible). All uploaded media lands in the `media` collection, file URLs built as `${R2_PUBLIC_URL}/${prefix}/${filename}`
- **Image processing**: Payload uses `sharp` for upload-time resizing
- **Localization**: built-in field-level localization for `zh`, `en`, `es`, `ar` (default `zh`, fallback enabled)
- **Collections**: `Users`, `Media`, `CustomCapabilities`, `Products`, `News`, `Inquiries`
- **Generated types**: `src/payload-types.ts` is auto-generated by `npm run generate:types`. Run after schema changes, never edit by hand
- **News drafts**: the `news` collection enables `versions: { drafts: true }`. The public read access rule filters on `_status: { equals: "published" }`. To save a draft, use the "Save Draft" button in admin; to publish, click "Publish". The `publishedAt` field is only for display ordering — it does not gate visibility

#### Media collection — `category` field

Every Media row carries a `category` enum (sidebar field). Values:

| value | meaning | filename pattern (when bulk-uploaded) |
|---|---|---|
| `product` | Product / variant photo | (kept from import: `category/spec/...`) |
| `license` | Business license, certificates | `license-NNN.jpg` |
| `showroom` | Showroom photos | `showroom-NNN.jpg` |
| `factory` | Factory tour stills + videos | `factory-NNN.{jpg,mp4}` |
| `case-sales` | Sales-channel project photos | `case-sales-NNN.jpg` |
| `case-factory` | Factory-built project photos | `case-factory-NNN.jpg` |
| `other` | Anything else | — |

Migration `20260427_233442` adds the column and backfills all pre-existing rows to `product`. New uploads through admin or scripts must pick the appropriate value.

#### Migrations workflow

Migration files live in `src/migrations/` (sequential `YYYYMMDD_HHMMSS.ts` + an `index.ts` registry).

- Payload CLI must be run through the npm scripts (`npm run migrate`, `npm run generate:types`, `npm run generate:importmap`). The scripts pass `--disable-transpile`; direct `npx payload ...` can fail on Node 24+ because the default tsx loader cannot synchronously require Lexical's ESM graph with top-level await.
- **Apply** migrations with `npm run migrate`. Do not run migrations from `npm start`; the web container start path should only start Next.
- The `DATABASE_URL` in `.env.local` points at the **production** Postgres on Zeabur. Treat any `migrate` invocation as a production change — review the SQL, take a snapshot first, no dev push from the local toolchain

### Product Title & Pinyin

Product titles follow a bilingual convention:
- **zh locale**: raw Chinese title, often prefixed with a product code (`LV826Y053JD 意大利灰洞`)
- **EN / ES / AR locales**: uppercase pinyin of the Chinese portion, with the product code prefix stripped (`YI DA LI HUI DONG`)

Shared utilities live in **`src/data/productTitle.ts`**:
- `hasChineseText(value)` — detects Chinese characters
- `stripLeadingProductCode(value)` — removes leading product code prefix
- `toUppercasePinyin(value)` — converts Chinese to uppercase pinyin via `pinyin-pro`
- `getLocalizedProductTitleDisplay(title, locale)` — main consumer-facing resolver; always call this instead of reading `title[locale]` directly

**`src/payload/hooks/autoPinyin.ts`** is an `afterChange` hook registered on the `Products` collection. When zh locale is saved, it automatically updates EN/ES/AR titles to the correct pinyin value. It fires only on `req.locale === "zh"` to avoid update loops.

**`src/payload/hooks/slug.ts`** (`slugifyBeforeValidate`): returns early when `data.slug === undefined` — locale-only updates don't submit the slug field, and without this guard the hook would regenerate the slug from the locale title.

**Product variants** — variant attributes and media (size, thickness, process, color, element/space/real images, videos) now live **directly on the `Products` collection**, merged from the former `ProductVariants` table on 2026-05-20. There is no separate variants collection; read variant data straight off the product record. Shared field definitions live in `src/payload/lib/variantFields.ts`.

### Trade Media (legacy disk-backed proxy)

`/api/trade-media/[...path]/route.ts` serves files from `docs/` on the running server's disk. It exists for backward compatibility — older `productVariant` documents may still hold `/api/trade-media/...` URLs, and `migrateExistingMediaToR2.mjs` walks them and uploads to R2.

- The route is **strict**: extension whitelist enforced (`.jpg .jpeg .png .webp .gif .heic .mp4 .mov`) before any `stat()` call. Hidden files and unrelated formats 404
- `Cache-Control: public, max-age=31536000, immutable` — the file at a given path is treated as immutable. If you replace a file in-place at the same path, browsers and any CDN in front of Zeabur will keep serving the stale version. Either change the path or rename the file
- Active source directories on disk are `docs/4.22/` and `docs/海盛/`. The historical `docs/外贸出口资料/产品/众岩联标准素材集合/` no longer exists.

### `docs/` directory layout

```
docs/
├── 4.22/             # Active product catalog source (≈1.2 GB compressed)
└── 海盛/              # Company assets — factory/showroom/license/cases (≈0.5 GB compressed)
                      # Once uploadCompanyAssets.mjs has uploaded these to R2,
                      # 海盛/ can be deleted from the deploy.
```

`docs/` is **gitignored** — these files do not live in version control. They are deployed to the Zeabur server alongside the Node runtime so `/api/trade-media/*` can read them. Treat the directory as production data: do not move/rename without coordinating with Payload's stored URLs.

The current `docs/` is the near-lossless compressed output of `scripts/compressMedia.mjs` (sharp + ffmpeg). The pre-compression originals live in `docs.original/` (also gitignored, kept on the dev machine only as a rollback safety net — do not deploy).

Earlier sub-directories (`docs/4.22_待补关键图/`, `docs/4.22_错误规格已移出/`, top-level `*.png` QA screenshots, `docs/plans/`, audit `*.json`) only exist in `docs.original/` and are not in scope for production.

### Migration Scripts (`scripts/*.mjs`)

One-shot scripts. Shared conventions:

- Loaded via `node --env-file=.env.local`
- Most DB-writing scripts default to **dry-run** and require `--apply` to write (for npm scripts, pass it after `--`, e.g. `npm run migrate:existing-media -- --apply`). Check each script header before running: some maintenance scripts default to apply mode with an optional `--dry-run`, and local file processors write files rather than database rows.
- Use `getPayload({ config })` to talk to Payload, never raw SQL
- Idempotent — re-runs of an already-migrated record are no-ops
- Batch sizes 50–100 for large-collection traversals

Active scripts:
- `compressMedia.mjs` — local pre-deploy compression. Reads `docs/4.22/` + `docs/海盛/`, writes mirror to `docs.compressed/` (mozjpeg q=85 / oxipng / sharp PNG max-effort / ffmpeg libx264 CRF 23). Idempotent. Already run; results were swapped in (originals preserved as `docs.original/`)
- `compressPublicAssets.mjs` — one-shot compression for committed `/public/assets/*` (JPEG resize+recompress; no-alpha PNG → WebP; deletes verified orphans). Originals backed up to gitignored `/.image-backups/`. Default dry-run; `--apply` to write.
- `uploadCompanyAssets.mjs` — one-shot uploader. Walks `docs/海盛/{营业执照, 展厅图片, 工厂图片, 合作案例(...)/{销售合作案例, 工厂合作案例}}` and uploads each file to Payload `media` (R2), renamed to `{prefix}-NNN.{ext}` and tagged with the matching `category`. Default dry-run; `--apply` to write. Run once after the migration that adds `media.category` is applied
- `verifyCopyCompleteness.mjs` — read-only check that every published product has non-empty descriptions across all 4 locales
- `seedSeoNewsDrafts.mjs` + `seoArticles/` — content pipeline for SEO long-form articles. `seoArticles/articles.{en,zh,es,ar}.mjs` carry the per-locale prose as `{type,text}` blocks; `seoArticles/lexical.mjs` converts them into Payload's Lexical SerializedEditorState (handles `**bold**`, `*italic*`, `[text](url)` for internal links, and `{type:"image", mediaId}` for upload nodes). The seeder is idempotent — looks up existing news by slug and updates all four locales. `--apply` to write
- `listMediaByCategory.mjs` / `verifySeoDrafts.mjs` — read-only helpers used alongside the SEO pipeline (pick covers from `media.category`, verify locale completeness)
- `wechatToNews.mjs` — fetch a WeChat MP article URL and turn it into a 4-locale News draft. Pipeline: cheerio-parses `#js_content` for ordered paragraphs + images, calls Gemini by default (`gemini-3.1-flash-lite`, reads `GEMINI_API_KEY`) or an OpenAI-compatible endpoint via `--provider openai` / `--model gpt-*` (reads `WECHAT_OPENAI_API_KEY` + `WECHAT_OPENAI_BASE_URL`, default model `gpt-5.5`) to rewrite zh + translate en/es/ar in structured JSON, downloads images with WeChat Referer, uploads to Payload media (category=`other`), interleaves upload nodes back into the original positions, creates a News doc with `draft: true`. Hard-fails when the article has zero images (cover is required). Default dry-run; `--apply` to write. Full flag list and failure modes in `scripts/wechatToNews.md`

The `4.22` trade-product import pipeline (one-shot, run during the 2026-06 catalog import; reads scrape data from the sibling repo `/Users/demon/vibecoding/miniprogram-scraper` on the dev machine — machine-specific paths, still present on disk, not portable):
- `match-scraped.mjs` — read-only: match scraped products against existing Payload products by extracted code (已上传 / 待上传 / 无法识别编码)
- `split-and-archive.mjs` — split scraped products into importable (coded + enum sizes) vs deferred (no code / non-enum sizes)
- `restore-importable.mjs` — move wrongly-archived (coded + enum-size) products back into the importable set
- `generate-import-manifest.mjs` — read-only: emit the full import manifest (local paths, codes, derived size/thickness/color/process/series)
- `import-trade-products.mjs` — the importer: upload images to `media` (R2, auto-compress + sized variants), create products, dedupe by slug
- `verify-imported.mjs` — read-only: re-fetch imported products by slug, print fields + HTTP-HEAD-verify the real image URLs
- `query-existing-products.mjs` — read-only: snapshot every existing Payload product (no secrets)
- `fillDescriptionsSQL.mjs` — direct-Postgres backfill of empty `description` locales, bypassing Payload's per-row hooks; idempotent (only fills `NULL`/`''`)
- `build-haiku-manifest.mjs` + `applyHaikuDrafts.mjs` — Haiku copy pipeline: build a "products still missing descriptions" manifest, feed it to the external Haiku workflow, then apply the resulting `/tmp/hb-out/out-*.json` drafts after 4-locale purity validation (idempotent — fills only still-empty products)

### Internationalization

- Configured via `src/i18n/routing.ts` using `next-intl`
- **Default locale: `zh`** (Chinese)
- **Frontend locales**: `["en", "zh", "es", "ar"]` (4)
- **Payload locales**: `["zh", "en", "es", "ar"]` (4)
- Navigation helpers: `Link`, `redirect`, `useRouter` from `src/i18n/routing.ts` (not `next/link`)
- **next-intl middleware lives at `src/proxy.ts`** (not the conventional `src/middleware.ts`) — edit `proxy.ts` for locale routing rules

#### Two static-content sources

| Source | When to use | Access pattern |
|--------|-------------|----------------|
| `src/messages/{locale}.json` | UI strings, labels, short copy — loaded per-request by next-intl | `useTranslations('Footer')` / `getTranslations` |
| `src/data/siteCopy.ts` | Longer structured copy (hero, about, cases, solution) that is locale-keyed inline | `getCommonCopy(locale)`, `getMetadataCopy(locale)` |

Do not mix them: next-intl strings belong in JSON files; structured page copy with multiple fields per locale belongs in `siteCopy.ts`. Adding a new translatable string: if it's a simple label, add to all four JSON files; if it's a structured block, extend `siteCopy.ts`.

### API Routes & Redirects

Legacy HTML URL redirects in `next.config.ts`:
```ts
/products/quartz       → /products?category=quartz
/page/about-us.html    → /about
/products/all.html     → /products
// ...and more
```

## Environment Policy

If the root cause of a problem is missing deployment or runtime environment variables, **directly state which env vars are missing and ask the user to supply them**. Do not add fallback code, empty implementations, silent degradation, or "skip for now" stubs. This applies to local dev, builds, Zeabur deployment, and all third-party services.

All non-public server env vars are validated at import time by `src/lib/server-env.ts` — missing values throw immediately. `NEXT_PUBLIC_SITE_URL` in `src/lib/env.ts` is soft-required (has a fallback).

Required env vars in `.env.local` (and on Zeabur):

```
# Payload CMS
PAYLOAD_SECRET=<long-random-string>
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cloudflare R2 (S3-compatible) — Payload media storage
R2_BUCKET=<bucket-name>
R2_ENDPOINT=https://<accountid>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://<public-r2-domain>
NEXT_PUBLIC_R2_PUBLIC_URL=https://<public-r2-domain>   # client-side media URLs (CSP + next/image)
R2_ACCESS_KEY_ID=<key-id>
R2_SECRET_ACCESS_KEY=<secret>

# Resend — inquiry email notifications (required at runtime when form submits)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@<verified-domain>
INQUIRY_NOTIFY_TO=sales@company.com         # comma-separated for multiple recipients

# Public deployment origin — used by sitemap.xml, robots.txt, Open Graph
# Optional: src/lib/env.ts falls back to the production domain
NEXT_PUBLIC_SITE_URL=https://zylsinteredstone.com

# AI product copy generation — used only by product-copy scripts
OPENAI_API_KEY=sk-...
OPENAI_PRODUCT_COPY_MODEL=gpt-5.4-mini
GEMINI_API_KEY=...
```

Sanity is **no longer used** — any reference to `SANITY_*` env vars, `@sanity/*` imports, or `src/sanity/` paths in older docs/scripts is historical. The previous Sanity → Payload migration is complete; do not reintroduce Sanity.

## Local Development

**Payload Admin**: `http://localhost:3000/admin`. Credentials are stored in `.env.local` as `ADMIN_EMAIL` and `ADMIN_PASSWORD` (gitignored — read the file directly before logging in).

## Production Deployment Safety

This is a **live production site**. Any change that could affect Zeabur startup, the build, the database, or the admin panel must be treated as a production risk.

- Do not put one-shot tasks into `npm start`, the Zeabur Start Command, or the web container boot path. This includes: `payload migrate`, data imports, type generation, import map generation, media migration, or any backfill script. The production web process should only run `next start`.
- Database migrations must run as a separate step. Use `npm run migrate`, not `npx payload migrate` — the direct invocation can fail on Node 24+ due to Lexical's ESM top-level `await`.
- Before modifying `package.json`'s `start`, `build`, `installCommand`, `postinstall`, or any Payload CLI script, check the Zeabur run logs and current deployment method.
- When adding a schema change + migration, keep them separate in the commit description: commit the code first, then explicitly tell the user which migration command to run in production and which tables/columns it will affect.
- When fixing a production incident, a minimal hotfix is acceptable first, but the root cause must be addressed afterward — remove unnecessary workarounds and restore a clean startup path.

## Next.js 16 Notes

This project uses **Next.js 16.2.4**, which has breaking changes from earlier versions. Before writing routing, server action, or caching code, read the relevant guide in `node_modules/next/dist/docs/`.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
