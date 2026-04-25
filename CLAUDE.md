# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 16.2.4 multilingual corporate website** for a stone/building materials company (ZYL Stone), backed by **Sanity CMS 5**. The site has 5 locales (en, zh, es, ar, ru) and features a product catalog, news section, and contact forms.

## Common Commands

```bash
# Start development server (http://localhost:3000)
# Rule: If port 3000 is occupied, stop the process first (e.g., kill -9 $(lsof -t -i:3000)) and run again.
npm run dev
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type-check (tsc --noEmit)
npm test           # Run unit tests (Vitest)
npm run test:watch # Vitest in watch mode
npm run test:e2e   # Playwright E2E tests (needs dev server on :3000)
npm run import:trade-catalog  # Import trade catalog data into Sanity
```

**Tests** are Vitest, co-located next to the code they cover (`*.test.ts(x)` under `src/`). Run a single file with `npx vitest run path/to/file.test.ts`. There is no jsdom setup — tests assume pure-function models; do not import `.tsx` components.

**Sanity Studio** is embedded at `/studio` (requires running dev server).

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── [locale]/           # Locale-segmented routes (zh, en, es, ar, ru)
│   │   ├── page.tsx        # Home
│   │   ├── about/
│   │   ├── products/       # Listing + [slug] detail pages
│   │   ├── solution/
│   │   ├── news/           # Listing + [slug] detail pages
│   │   ├── contact/
│   │   └── download/
│   ├── studio/             # Embedded Sanity Studio
│   ├── api/trade-media/    # Trade media file proxy
│   └── actions/            # Server Actions (inquiry.ts)
├── components/             # Shared UI (layout/, landing/, products/)
├── features/               # Feature-based modules (home, products, news, shared)
│   └── {feature}/
│       ├── model/           # Data models, types, business logic
│       ├── lib/             # Feature utilities and data fetching
│       └── components/      # Feature-specific UI (if not shared)
├── sanity/                 # Sanity config, schemas, client, queries
│   ├── schemaTypes/         # CMS document schemas
│   └── lib/                 # Sanity client, GROQ queries, image utils
├── i18n/                    # next-intl routing and request config
├── data/                   # Static JSON data (products, categories, siteCopy)
└── messages/               # Translation JSON files per locale
```

### Key Architecture Decisions

- **Server Components by default** — use `'use client'` only when needed
- **Feature-based modules** in `src/features/` — each feature has its own model/lib/components
- **Sanity as content backend** — product / news / category / capability content comes from Sanity via GROQ
- **Homepage is 100% static** — `src/app/[locale]/page.tsx` + `src/features/home/` run zero GROQ queries and render only `/public/assets/...`. Do NOT assume Sanity changes affect the homepage; they don't.
- **Trade media proxy** at `/api/trade-media/*` — serves files from `docs/外贸出口资料/` on disk (see "Trade Media Catalog" below)
- **Server Actions** — form submissions (inquiry) use Next.js Server Actions
- **RTL support** — Arabic (`ar`) locale uses `dir="rtl"`; no separate component variants needed

### Sanity CMS

- **Project ID/Dataset**: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`
- **Sanity client**: `src/sanity/lib/client.ts` — `useCdn: false` (always fetches fresh)
- **Schemas**: `src/sanity/schemaTypes/` — `product`, `productVariant`, `category`, `customCapability`, `news`, `inquiry`, plus inline `externalImageMedia` / `externalVideoMedia` (embedded as array items in productVariant)
- **Image URLs**: use `@sanity/image-url` builder for Sanity-hosted assets, never hand-build CDN URLs
- **API token**: `SANITY_API_TOKEN` in `.env.local` for write operations

### Trade Media Catalog

Product photos live on disk under `docs/外贸出口资料/` and are served via the `/api/trade-media/*` route (`src/app/api/trade-media/[...path]/route.ts`). The authoritative catalog subtree is `产品/众岩联标准素材集合/` — any file outside this prefix has been retired.

Critical encoding contract:
- `productVariant.{elementImages,spaceImages,realImages,videos}[].sourcePath` stores the **decoded** relative path (`产品/众岩联标准素材集合/...`).
- `product.coverImageUrl` / `product.coverVideoPosterUrl` store the **percent-encoded** URL built by `buildTradeMediaPublicUrl()` in `src/features/products/lib/tradeMedia.ts`. When writing GROQ filters against cover URLs, match the percent-encoded prefix (`/api/trade-media/%E4%BA%A7%E5%93%81/%E4%BC%97%E5%B2%A9%E8%81%94%E6%A0%87%E5%87%86%E7%B4%A0%E6%9D%90%E9%9B%86%E5%90%88/`). Mixing decoded and encoded prefixes is the #1 source of audit miscounts.
- URL-extension whitelist is enforced in the route before any filesystem access — unsupported types always 404.

### Data Migration Scripts (`scripts/*.mjs`)

One-shot scripts run against the production Sanity dataset. Shared pattern (follow for any new migration):

- Load `.env.local` via `dotenv.config({ path: ".env.local" })`
- Use `@sanity/client` with `useCdn: false` + `SANITY_API_TOKEN`
- Accept `--dry-run` that reports counts + sample IDs without writing
- **Idempotent by construction**: GROQ query should pre-filter to documents that still need work (`count(staleField[...]) > 0`), so re-runs return 0 targets
- Apply via `client.transaction()` in batches of 100 with `visibility: "async"`

Reference implementations: `scripts/pruneStaleTradeMedia.mjs` (patch/unset pattern), `scripts/backfillProductPublished.mjs` (simpler backfill). The `importTradeCatalog.mjs` script (exposed as `npm run import:trade-catalog`) is the primary creator of variant media references.

### Internationalization

- **Configured via `src/i18n/routing.ts`** using `next-intl`
- **Default locale: `zh`** (Chinese) — this is the current development priority
- **Supported locales**: `["en", "zh", "es", "ar", "ru"]`
- **Navigation helpers**: `Link`, `redirect`, `useRouter` from `src/i18n/routing.ts` (not next/link)
- **Messages**: `src/messages/{locale}.json`
- **Static site copy**: `src/data/siteCopy.ts`

### API Routes & Redirects

Legacy HTML URL redirects are defined in `next.config.ts`:
```ts
/products/quartz → /products?category=quartz
/page/about-us.html → /about
/products/all.html → /products
// ...and more
```

## Environment Policy

**If the root cause of a problem is missing deployment or runtime environment variables, directly state which environment variables are missing and ask the user to supply them.** Do not add fallback code, empty implementations, silent degradation, or "skip for now" solutions to work around missing environment variables. This applies to local development, builds, Vercel deployment, and all third-party service configurations — especially Sanity-related environment variables.

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=ma3m9qb1
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2026-04-03
SANITY_API_TOKEN=<token>

# Resend — inquiry email notifications (required at runtime when form submits)
RESEND_API_KEY=<re_...>
RESEND_FROM_EMAIL=<noreply@verified-domain>
INQUIRY_NOTIFY_TO=<sales@company.com>     # comma-separated for multiple recipients

# Public deployment origin — used by sitemap.xml, robots.txt, Open Graph
# Optional: falls back to the production domain in src/lib/env.ts
NEXT_PUBLIC_SITE_URL=https://www.zylstone.com
```

All non-public server env vars (`SANITY_API_TOKEN`, `RESEND_*`, `INQUIRY_NOTIFY_TO`) are validated at import time by `src/lib/env.ts` — missing values throw immediately. `NEXT_PUBLIC_SITE_URL` is soft-required (has a fallback).

Missing env vars throw at build/runtime — no fallback or stub values exist.

## Next.js 16 Notes

This project uses **Next.js 16.2.1**. It has breaking changes from earlier versions. Before writing routing, server action, or caching code, read the relevant guide in `node_modules/next/dist/docs/`.
