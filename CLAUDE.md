# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **Next.js 16.2.4 multilingual corporate website** for a stone/building materials company (ZYL Stone), backed by **Payload CMS 3.83** with a Postgres database and Cloudflare R2 for media storage. The site has 5 locales (en, zh, es, ar, ru — note Payload localization only covers 4: zh, en, es, ar) and features a product catalog, news section, and contact forms.

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

# Data migrations (one-shot scripts, see "Migration Scripts" below)
npm run import:422-catalog        # Import current product catalog from docs/4.22/
npm run migrate:existing-media    # Move /api/trade-media/* references → R2 via Payload
npm run import:trade-catalog      # LEGACY: targets docs/外贸出口资料/ which no longer exists
```

**Tests** are Vitest, co-located next to the code they cover (`*.test.ts(x)` under `src/`). Run a single file with `npx vitest run path/to/file.test.ts`. There is no jsdom setup — tests assume pure-function models; do not import `.tsx` components.

**Payload Admin** is embedded at `/admin` (requires running dev server + valid `DATABASE_URL`).

## Architecture

### Directory Structure

```
src/
├── app/
│   ├── [locale]/                    # Locale-segmented public routes (zh, en, es, ar, ru)
│   │   ├── page.tsx                 # Home (100% static)
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
│   │   ├── Users.ts, Media.ts, Categories.ts, CustomCapabilities.ts,
│   │   ├── Products.ts, ProductVariants.ts, News.ts, Inquiries.ts
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
- **Homepage is 100% static** — `src/app/[locale]/page.tsx` + `src/features/home/` run zero CMS queries and only render `/public/assets/...`. Payload changes do NOT affect the homepage
- **Server Actions** for form submissions (inquiry → Resend email + Payload `inquiries` collection)
- **RTL support** — Arabic (`ar`) uses `dir="rtl"`; no separate component variants needed
- **GraphQL is disabled** in `payload.config.ts` (`graphQL: { disable: true }`) because Payload's auto-generated GraphQL enum names choke on Chinese characters in collection slugs/labels

### Payload CMS

- **Database**: Postgres (`@payloadcms/db-postgres`) via `DATABASE_URL`. UUID primary keys
- **Media storage**: Cloudflare R2 (`@payloadcms/storage-s3` plugin, S3-compatible). All uploaded media lands in the `media` collection, file URLs built as `${R2_PUBLIC_URL}/${prefix}/${filename}`
- **Image processing**: Payload uses `sharp` for upload-time resizing
- **Localization**: built-in field-level localization for `zh`, `en`, `es`, `ar` (default `zh`, fallback enabled). Note this is one fewer than the next-intl frontend (which adds `ru`) — `ru` content falls back per Payload's fallback chain
- **Collections**: `Users`, `Media`, `Categories`, `CustomCapabilities`, `Products`, `ProductVariants`, `News`, `Inquiries`
- **Generated types**: `src/payload-types.ts` is auto-generated by `npm run generate:types`. Run after schema changes, never edit by hand
- **News drafts via future `publishedAt`**: the `news` collection does **not** enable `versions: { drafts: true }`. The public read access rule only returns news with `publishedAt <= now`, so the convention for "draft" is to set `publishedAt` to a far-future date (or any future date for scheduled publish). To publish, edit the doc in `/admin` and set `publishedAt` to the desired past/current date

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

- **Auto-generation is broken on Node 25**: `npx payload migrate:create` errors with `ERR_REQUIRE_ASYNC_MODULE`. Until Payload supports Node 25 ESM, write migrations by hand using existing files as templates and append to `src/migrations/index.ts`
- **Apply** with `npx payload migrate` (works fine even though generate doesn't)
- The `DATABASE_URL` in `.env.local` points at the **production** Postgres on Zeabur. Treat any `migrate` invocation as a production change — review the SQL, take a snapshot first, no dev push from the local toolchain

### Trade Media (legacy disk-backed proxy)

`/api/trade-media/[...path]/route.ts` serves files from `docs/` on the running server's disk. It exists for backward compatibility — older `productVariant` documents may still hold `/api/trade-media/...` URLs, and `migrateExistingMediaToR2.mjs` walks them and uploads to R2.

- The route is **strict**: extension whitelist enforced (`.jpg .jpeg .png .webp .gif .heic .mp4 .mov`) before any `stat()` call. Hidden files and unrelated formats 404
- `Cache-Control: public, max-age=31536000, immutable` — the file at a given path is treated as immutable. If you replace a file in-place at the same path, browsers and any CDN in front of Zeabur will keep serving the stale version. Either change the path or rename the file
- Active source directories on disk are `docs/4.22/` and `docs/海盛/`. The historical `docs/外贸出口资料/产品/众岩联标准素材集合/` no longer exists, but `scripts/importTradeCatalog.mjs` and parts of CLAUDE.md history may reference it — treat any such reference as legacy

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
- Default to **dry-run**, require `--apply` to write (e.g., `migrate:existing-media`)
- Use `getPayload({ config })` to talk to Payload, never raw SQL
- Idempotent — re-runs of an already-migrated record are no-ops
- Batch sizes 50–100 for large-collection traversals

Active scripts:
- `import422Catalog.mjs` — read `docs/4.22/{category}/{spec}/{product}/...`, create products + variants in Payload (uses `/api/trade-media/` URLs initially)
- `migrateExistingMediaToR2.mjs` — sweep variants whose media still references `/api/trade-media/`, upload source bytes to R2 via Payload `media` collection, patch `mediaRef` + `publicUrl`. Also covers product cover images
- `pruneStaleTradeMedia.mjs` — remove broken/stale variant media references
- `compressMedia.mjs` — local pre-deploy compression. Reads `docs/4.22/` + `docs/海盛/`, writes mirror to `docs.compressed/` (mozjpeg q=85 / oxipng / sharp PNG max-effort / ffmpeg libx264 CRF 23). Idempotent. Already run; results were swapped in (originals preserved as `docs.original/`)
- `uploadCompanyAssets.mjs` — one-shot uploader. Walks `docs/海盛/{营业执照, 展厅图片, 工厂图片, 合作案例(...)/{销售合作案例, 工厂合作案例}}` and uploads each file to Payload `media` (R2), renamed to `{prefix}-NNN.{ext}` and tagged with the matching `category`. Default dry-run; `--apply` to write. Run once after the migration that adds `media.category` is applied
- `scanLegacyMediaReferences.mjs` — read-only sanity check. Greps Payload records (products, productVariants, media, news) for any leftover `.mov` / `.heic` URLs; expected to return 0 after the compression swap
- `seedSeoNewsDrafts.mjs` + `seoArticles/` — content pipeline for SEO long-form articles. `seoArticles/articles.{en,zh,es,ar}.mjs` carry the per-locale prose as `{type,text}` blocks; `seoArticles/lexical.mjs` converts them into Payload's Lexical SerializedEditorState (handles `**bold**`, `*italic*`, and `[text](url)` for internal links). The seeder is idempotent — looks up existing news by slug and updates all four locales. `--apply` to write
- `listMediaByCategory.mjs` / `verifySeoDrafts.mjs` — read-only helpers used alongside the SEO pipeline (pick covers from `media.category`, verify locale completeness)

Dead/legacy:
- `importTradeCatalog.mjs` — references the no-longer-existing `docs/外贸出口资料/`. The npm script `import:trade-catalog` still points at it; do not run

### Internationalization

- Configured via `src/i18n/routing.ts` using `next-intl`
- **Default locale: `zh`** (Chinese)
- **Frontend locales**: `["en", "zh", "es", "ar", "ru"]` (5)
- **Payload locales**: `["zh", "en", "es", "ar"]` (4 — no `ru`)
- Navigation helpers: `Link`, `redirect`, `useRouter` from `src/i18n/routing.ts` (not `next/link`)
- Static frontend strings: `src/messages/{locale}.json` + `src/data/siteCopy.ts`

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
R2_ACCESS_KEY_ID=<key-id>
R2_SECRET_ACCESS_KEY=<secret>

# Resend — inquiry email notifications (required at runtime when form submits)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@<verified-domain>
INQUIRY_NOTIFY_TO=sales@company.com         # comma-separated for multiple recipients

# Public deployment origin — used by sitemap.xml, robots.txt, Open Graph
# Optional: src/lib/env.ts falls back to the production domain
NEXT_PUBLIC_SITE_URL=https://zylsinteredstone.com

# AI product copy generation — used only by npm run generate:product-copy
OPENAI_API_KEY=sk-...
OPENAI_PRODUCT_COPY_MODEL=gpt-5.4-mini
```

Sanity is **no longer used** — any reference to `SANITY_*` env vars, `@sanity/*` imports, or `src/sanity/` paths in older docs/scripts is historical. The previous Sanity → Payload migration is complete; do not reintroduce Sanity.

## Next.js 16 Notes

This project uses **Next.js 16.2.4**, which has breaking changes from earlier versions. Before writing routing, server action, or caching code, read the relevant guide in `node_modules/next/dist/docs/`.
