# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 16.2.1 multilingual corporate website** for a stone/building materials company (ZYL Stone), backed by **Sanity CMS 5**. The site has 5 locales (en, zh, es, ar, ru) and features a product catalog, news section, and contact forms.

## Common Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run import:trade-catalog  # Import trade catalog data into Sanity
```

**Test files** (Vitest, co-located in `src/features/`):
- `src/features/home/model/homeVisuals.test.ts`
- `src/features/products/model/productDirectory.test.ts`
- `src/features/products/model/productExposure.test.ts`
- `src/features/products/lib/tradeCatalog.test.ts`
- `src/features/products/lib/tradeMedia.test.ts`

Run tests with `npm test` or `npx vitest` from the project root.

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
- **Sanity as content backend** — all content (products, news) comes from Sanity via GROQ queries
- **Trade media proxy** at `/api/trade-media/*` — serves local trade catalog files
- **Server Actions** — form submissions (inquiry) use Next.js Server Actions
- **RTL support** — Arabic (`ar`) locale uses `dir="rtl"`; no separate component variants needed

### Sanity CMS

- **Project ID/Dataset**: `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` in `.env.local`
- **Sanity client**: `src/sanity/lib/client.ts` — `useCdn: false` (always fetches fresh)
- **Schemas**: `src/sanity/schemaTypes/` — `product`, `productVariant`, `category`, `news`, `inquiry`
- **Image URLs**: Use `@sanity/image-url` builder, never construct CDN URLs manually
- **API token**: `SANITY_API_TOKEN` in `.env.local` for write operations

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
```

Missing env vars throw at build/runtime — no fallback or stub values exist.

## Next.js 16 Notes

This project uses **Next.js 16.2.1**. It has breaking changes from earlier versions. Before writing routing, server action, or caching code, read the relevant guide in `node_modules/next/dist/docs/`.
