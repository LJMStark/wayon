# Repository Guidelines

## Project Structure & Module Organization
`wayon-web/` is the main application. It is a Next.js 16 App Router project: routes live in `wayon-web/src/app`, shared UI in `wayon-web/src/components`, and bundled JSON in `wayon-web/src/data`. Scraping and ingestion live at the repo root: `scripts/` contains Playwright-based collectors, `data/` stores raw scraped JSON, and `wayon-web/public/assets/` stores downloaded images. Treat `.next/` and `node_modules/` as generated output.

## Build, Test, and Development Commands
Run web commands inside `wayon-web/`:
- `npm run dev`: start the local Next.js server on `http://localhost:3000`.
- `npm run lint`: run ESLint with Next core-web-vitals and TypeScript rules.
- `npm run build`: verify the production build.

Run scraper commands from the repo root:
- `node scripts/scrape.mjs`: refresh `data/categories.json`.
- `node scripts/scrape-products.mjs`: refresh `data/products.json` and download product images into `wayon-web/public/assets/products/`.

## Coding Style & Naming Conventions
Use TypeScript for app code and keep strict-mode assumptions intact. Follow the existing 2-space indentation and prefer the `@/*` alias for imports inside `wayon-web/src`. Use PascalCase for components (`ProductGrid.tsx`, `Header.tsx`), lowercase route folders in `src/app`, and lowercase JSON filenames in `data/`. Tailwind CSS v4 is the primary styling layer; extend existing utility patterns instead of adding ad hoc CSS. ESLint is the source of truth. There is no Prettier config, so avoid formatting-only churn.

## Testing Guidelines
There is no dedicated test suite yet. Every code change should at minimum pass `cd wayon-web && npm run lint` and `cd wayon-web && npm run build`. For scraper changes, rerun the affected script and inspect JSON and asset diffs rather than weakening selectors or swallowing errors. If you add tests, prefer `*.test.ts` or `*.test.tsx` near the feature or under `wayon-web/tests/`.

## Commit & Pull Request Guidelines
Git history is currently minimal, with an initial scaffold commit. Keep commit subjects short, imperative, and English, for example `Add product card image fallback`. PRs should include a scope summary, affected paths, verification commands with actual output, linked task or issue, and screenshots for UI changes.
