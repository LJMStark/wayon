# Wayon Homepage Restoration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将 `wayon-web` 首页与全局头尾补齐到尽可能接近 `www.wayon.com` 的高保真实现。

**Architecture:** 以本地静态资源 + React 组件重建线上首页，不复制线上脚本。首页从单一 `app/page.tsx` 拆为 landing 组件，全局样式与元数据在 `app/layout.tsx`、`app/globals.css` 中统一管理，数据集中在 `src/data/`。

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind CSS v4, Framer Motion, local assets under `public/assets`

---

### Task 1: 建立资源目录并同步关键线上资产

**Files:**
- Create: `wayon-web/public/assets/brand/*`
- Create: `wayon-web/public/assets/hero/*`
- Create: `wayon-web/public/assets/about/*`
- Create: `wayon-web/public/assets/solutions/*`
- Create: `wayon-web/public/assets/partner/*`
- Create: `wayon-web/public/assets/news/*`
- Create: `wayon-web/public/assets/social/*`
- Create: `wayon-web/public/assets/backgrounds/*`
- Create: `wayon-web/public/assets/footer/*`
- Create: `wayon-web/public/assets/icons/social/*`

**Step 1: Create missing asset directories**

Run:

```bash
mkdir -p wayon-web/public/assets/{brand,hero,about,solutions,partner,news,social,backgrounds,footer,icons/social}
```

**Step 2: Download critical hero, about, footer, social, and background assets**

Run:

```bash
curl -L "<source-url>" -o "wayon-web/public/assets/<target-path>"
```

**Step 3: Verify files exist**

Run:

```bash
find wayon-web/public/assets -maxdepth 2 -type f | sort
```

Expected: newly downloaded files appear under the new directories.

### Task 2: 重建主题 token、字体与根布局元数据

**Files:**
- Modify: `wayon-web/src/app/globals.css`
- Modify: `wayon-web/src/app/layout.tsx`
- Modify: `wayon-web/src/app/favicon.ico` or related app icon files if needed

**Step 1: Replace current font setup with Montserrat-based site typography**

**Step 2: Rewrite global theme variables to match source site**

**Step 3: Restore layout shell spacing, header offset, body colors, and shared utility classes**

**Step 4: Update metadata to match source site title and description**

**Step 5: Run lint to catch layout/global style regressions**

Run:

```bash
cd wayon-web && npm run lint
```

### Task 3: 重做全局头部、页脚和悬浮侧栏

**Files:**
- Modify: `wayon-web/src/components/layout/Header.tsx`
- Modify: `wayon-web/src/components/layout/Footer.tsx`
- Modify: `wayon-web/src/components/layout/FloatingSidebar.tsx`
- Modify: `wayon-web/src/data/navigation.ts`

**Step 1: Expand navigation data to support source-style mega menu content**

**Step 2: Rebuild desktop header with fixed positioning, search affordance, language switcher, and source-like spacing**

**Step 3: Rebuild `Collection` mega menu closer to source structure**

**Step 4: Rebuild mobile drawer hierarchy and language links**

**Step 5: Rebuild footer with source-like columns, sample form, footer CTA images, and legal links**

**Step 6: Rebuild floating sidebar to better match QR / language / chat / back-to-top affordances**

### Task 4: 将首页拆为 landing 组件并重建 section 结构

**Files:**
- Create: `wayon-web/src/components/landing/Hero.tsx`
- Create: `wayon-web/src/components/landing/AboutIntro.tsx`
- Create: `wayon-web/src/components/landing/AboutAlbum.tsx`
- Create: `wayon-web/src/components/landing/ProductsCarousel.tsx`
- Create: `wayon-web/src/components/landing/SolutionTabs.tsx`
- Create: `wayon-web/src/components/landing/EngineeringCase.tsx`
- Create: `wayon-web/src/components/landing/PartnerCarousel.tsx`
- Create: `wayon-web/src/components/landing/NewsSection.tsx`
- Create: `wayon-web/src/components/landing/SocialTabs.tsx`
- Modify: `wayon-web/src/app/page.tsx`
- Modify: `wayon-web/src/data/home.ts`

**Step 1: Normalize `home.ts` into explicit source-like data groups**

**Step 2: Build `Hero` with video + second image slide + pagination**

**Step 3: Split About into `AboutIntro` and `AboutAlbum`**

**Step 4: Replace product grid pagination with source-style product carousel**

**Step 5: Rebuild solution block with overlay panel and thumb tabs**

**Step 6: Replace partner grid with source-style partner carousel cards**

**Step 7: Rebuild news and social sections using real local assets**

**Step 8: Compose the new homepage in `app/page.tsx`**

### Task 5: 补齐细节、对照验证并修复剩余偏差

**Files:**
- Modify: `wayon-web/src/app/page.tsx`
- Modify: `wayon-web/src/components/landing/*`
- Modify: `wayon-web/src/components/layout/*`
- Modify: `wayon-web/src/data/*`

**Step 1: Compare local page against source for spacing, colors, text, and missing assets**

**Step 2: Fix high-visibility mismatches**

**Step 3: Run lint**

Run:

```bash
cd wayon-web && npm run lint
```

**Step 4: Run production build**

Run:

```bash
cd wayon-web && npm run build
```

**Step 5: Manual browser verification**

Check:

- header layout and mega menu hierarchy
- hero slides and autoplay behavior
- product hover behavior
- solution thumb switching
- footer assets and sample form
- overall spacing and color palette

### Task 6: 记录结果与剩余差异

**Files:**
- Modify: `docs/plans/2026-04-01-wayon-homepage.md`

**Step 1: Record what was fully restored**

**Step 2: Record any unavoidable residual gaps**

**Step 3: Keep verification commands and actual results at the end of the document**
