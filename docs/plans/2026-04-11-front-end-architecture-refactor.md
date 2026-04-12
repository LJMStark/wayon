# Front-End Architecture Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor home, products, and news into feature-oriented server assembly plus props-driven views without changing the site design.

**Architecture:** App routes become thin composition entry points. Feature server modules assemble page data and view models. Presentational components receive explicit props instead of reading page data directly.

**Tech Stack:** Next.js 16 App Router, React 19, next-intl, TypeScript, Tailwind CSS

---

### Task 1: Add design and planning artifacts

**Files:**
- Create: `docs/plans/2026-04-11-front-end-architecture-refactor-design.md`
- Create: `docs/plans/2026-04-11-front-end-architecture-refactor.md`

**Step 1:** Write the refactor design and implementation plan.

**Step 2:** Keep the scope bounded to route thinning, feature assembly, and props-driven sections.

### Task 2: Build shared route helpers

**Files:**
- Create: `src/features/shared/server/locale.ts`

**Step 1:** Add a locale validation helper for App Router pages/layouts.

**Step 2:** Make route pages use a shared helper instead of repeating `hasLocale` + `notFound`.

### Task 3: Refactor home into feature assembly

**Files:**
- Create: `src/features/home/server/getHomePageData.ts`
- Create: `src/features/home/components/HomePageView.tsx`
- Modify: `src/components/landing/AboutIntro.tsx`
- Modify: `src/components/landing/AboutAlbum.tsx`
- Modify: `src/components/landing/ProductsCarousel.tsx`
- Modify: `src/components/landing/SolutionTabs.tsx`
- Modify: `src/components/landing/EngineeringCase.tsx`
- Modify: `src/components/landing/PartnerCarousel.tsx`
- Modify: `src/components/landing/NewsSection.tsx`
- Modify: `src/components/landing/SocialTabs.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Step 1:** Move homepage data assembly into `getHomePageData(locale)`.

**Step 2:** Convert landing sections to explicit props.

**Step 3:** Create `HomePageView` as the single home composition component.

### Task 4: Refactor products into feature assembly

**Files:**
- Create: `src/features/products/content/category-showcases.ts`
- Create: `src/features/products/model/product-detail.ts`
- Create: `src/features/products/server/getProductsPageData.ts`
- Create: `src/features/products/server/getProductDetailPageData.ts`
- Create: `src/features/products/components/ProductsPageView.tsx`
- Create: `src/features/products/components/ProductDetailPageView.tsx`
- Modify: `src/app/[locale]/products/page.tsx`
- Modify: `src/app/[locale]/products/[slug]/page.tsx`

**Step 1:** Move category showcase config out of the route page.

**Step 2:** Move product detail formatting and spec assembly into feature model/server helpers.

**Step 3:** Replace large route render trees with feature page view components.

### Task 5: Refactor news into feature assembly

**Files:**
- Create: `src/features/news/model/news-view.ts`
- Create: `src/features/news/server/getNewsPageData.ts`
- Create: `src/features/news/server/getNewsDetailPageData.ts`
- Create: `src/features/news/components/NewsPageView.tsx`
- Create: `src/features/news/components/NewsDetailPageView.tsx`
- Modify: `src/app/[locale]/news/page.tsx`
- Modify: `src/app/[locale]/news/[slug]/page.tsx`

**Step 1:** Move news preview/detail mapping into feature model helpers.

**Step 2:** Move list/detail page assembly into feature server modules.

**Step 3:** Keep route files focused on metadata and render entry.

### Task 6: Verify the refactor

**Files:**
- Modify: only if verification exposes regressions

**Step 1:** Run `npm run lint`.

**Step 2:** Run `npm run build`.

**Step 3:** Fix any regressions introduced by the refactor before closing the task.
