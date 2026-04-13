# Minimal Blocking Review Fixes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add the minimum missing test coverage needed to address the blocking review findings before commit.

**Architecture:** Keep production behavior unchanged unless a new failing test reveals a real bug. Add focused node:test coverage around the new product-attribute localization table and the product detail page data builder so the recently introduced localization paths are protected against regressions.

**Tech Stack:** Next.js 16, TypeScript, Node.js built-in test runner (`node:test`), existing feature models under `src/features/products`

---

### Task 1: Add unit tests for product attribute localization helpers

**Files:**
- Create: `src/data/productAttributeLabels.test.ts`
- Modify: `src/data/productAttributeLabels.ts` (only if a failing test proves a bug)
- Reference: `src/features/products/lib/tradeCatalog.ts:1-55`

**Step 1: Write the failing test**

Create `src/data/productAttributeLabels.test.ts` with focused tests for:
- `localizeProcess("亮光", "en") === "Polished"`
- `localizeColorGroup("白色", "es") === "Blanco"`
- `localizeSeriesType("名石岩板", "ru") === 'Плита "классический камень"'`
- `localizeFaceCount("四面", "ar") === "4 أوجه"`
- `localizeFacePatternNote("无限连纹", "en") === "Continuous vein"`
- unknown key fallback returns the original input
- undefined input returns undefined for optional helpers
- `localizeMediaAlt("Aurora", "space", "en") === "Aurora - space view"`

Suggested skeleton:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import {
  localizeColorGroup,
  localizeFaceCount,
  localizeFacePatternNote,
  localizeMediaAlt,
  localizeProcess,
  localizeSeriesType,
} from "./productAttributeLabels.ts";
```

**Step 2: Run test to verify it fails**

Run:
```bash
node --test "/Users/demon/vibecoding/wayon/src/data/productAttributeLabels.test.ts"
```

Expected: FAIL because the test file is new and may expose an assertion mismatch if any helper is wrong.

**Step 3: Write minimal implementation**

Only if the test fails for a real behavior issue, make the smallest possible fix in:
- `src/data/productAttributeLabels.ts`

Do not refactor unrelated helpers.

**Step 4: Run test to verify it passes**

Run:
```bash
node --test "/Users/demon/vibecoding/wayon/src/data/productAttributeLabels.test.ts"
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/data/productAttributeLabels.test.ts src/data/productAttributeLabels.ts
git commit -m "test: cover product attribute localization helpers"
```

---

### Task 2: Add unit tests for product detail page data localization

**Files:**
- Create: `src/features/products/model/product-detail.test.ts`
- Modify: `src/features/products/model/product-detail.ts` (only if a failing test proves a bug)
- Reference: `src/features/products/model/product-detail.ts:1-177`
- Reference: `src/data/products.ts:20-69`

**Step 1: Write the failing test**

Create `src/features/products/model/product-detail.test.ts` that builds a minimal in-memory `Product` fixture and asserts:
- localized `seriesTypes` are transformed for a non-zh locale
- variant `process`, `colorGroup`, `faceCount`, `facePatternNote` are localized
- `optionLabel` uses localized process text
- media fallback alt/title uses `localizeMediaAlt(...)` when `altZh` / `titleZh` are absent
- `defaultVariantCode` still prefers richer media / sort order
- empty variants return `defaultVariantCode === null`

Use copy fixtures with only the fields required by `buildProductDetailPageData`.

Suggested structure:

```ts
import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "@/data/products";
import { buildProductDetailPageData } from "./product-detail.ts";
```

Include at least two tests:
1. `buildProductDetailPageData localizes detail fields for en locale`
2. `buildProductDetailPageData returns null default variant when product has no variants`

**Step 2: Run test to verify it fails**

Run:
```bash
node --test "/Users/demon/vibecoding/wayon/src/features/products/model/product-detail.test.ts"
```

Expected: FAIL initially because the test file is new and may expose a behavior mismatch.

**Step 3: Write minimal implementation**

Only if needed, adjust `src/features/products/model/product-detail.ts` with the smallest fix necessary to satisfy the assertions.

**Step 4: Run test to verify it passes**

Run:
```bash
node --test "/Users/demon/vibecoding/wayon/src/features/products/model/product-detail.test.ts"
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/features/products/model/product-detail.test.ts src/features/products/model/product-detail.ts
git commit -m "test: cover localized product detail data"
```

---

### Task 3: Run the related regression test set

**Files:**
- Test: `src/data/productAttributeLabels.test.ts`
- Test: `src/features/products/model/product-detail.test.ts`
- Test: `src/features/products/model/productDirectory.test.ts`

**Step 1: Run the focused regression suite**

Run:
```bash
node --test \
  "/Users/demon/vibecoding/wayon/src/data/productAttributeLabels.test.ts" \
  "/Users/demon/vibecoding/wayon/src/features/products/model/product-detail.test.ts" \
  "/Users/demon/vibecoding/wayon/src/features/products/model/productDirectory.test.ts"
```

Expected: all tests PASS.

**Step 2: If a regression appears, fix only the directly affected code**

Allowed files:
- `src/data/productAttributeLabels.ts`
- `src/features/products/model/product-detail.ts`
- `src/features/products/model/productDirectory.ts`

Do not expand scope into UI components.

**Step 3: Re-run the same suite**

Run the same command again and verify PASS.

**Step 4: Commit**

```bash
git add src/data/productAttributeLabels.test.ts src/features/products/model/product-detail.test.ts src/features/products/model/product-detail.ts src/features/products/model/productDirectory.ts
git commit -m "test: cover blocking product localization regressions"
```

---

### Task 4: Final verification before handoff

**Files:**
- Review: `src/data/productAttributeLabels.test.ts`
- Review: `src/features/products/model/product-detail.test.ts`
- Review: `src/features/products/model/productDirectory.test.ts`

**Step 1: Review diff for scope control**

Run:
```bash
git diff -- src/data/productAttributeLabels.test.ts src/features/products/model/product-detail.test.ts src/data/productAttributeLabels.ts src/features/products/model/product-detail.ts src/features/products/model/productDirectory.ts
```

Expected: only test additions and any minimal bug-fix lines needed to satisfy tests.

**Step 2: Summarize verification evidence**

Record:
- which tests were added
- exact `node --test` commands run
- whether any production code needed adjustment

**Step 3: Stop**

Do not fix MEDIUM issues in this plan. Those are intentionally left out to keep this change minimal.
