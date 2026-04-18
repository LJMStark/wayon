import { test, expect } from "@playwright/test";

// The product detail slug is stable: "trade-<sha1prefix>" is generated
// by buildStableTradeFamilySlug(normalizedName) in
// src/features/products/lib/tradeImportIdentity.ts, so it survives
// re-imports of the same supplier data.
const STABLE_PRODUCT_SLUG = "trade-01db306bd6";

test("root path redirects to a supported locale", async ({ page }) => {
  await page.goto("/");
  // next-intl picks the locale via Accept-Language; the test just
  // confirms we land on a prefixed route rather than a bare /.
  await expect(page).toHaveURL(/\/(en|zh|es|ar|ru)(\/|$)/);
  await expect(page.locator("body")).toBeVisible();
});

test("products directory loads with taxonomy filter tabs", async ({ page }) => {
  await page.goto("/zh/products");
  await expect(page).toHaveURL(/\/zh\/products/);
  // Root layout + page each render a <main>, so scope to .last() (the
  // page-owned one) rather than assume a single match.
  await expect(page.locator("main").last()).toBeVisible();
  // The catalog nav section (规格/石材/厚度/颜色/表面工艺/定制产品) is the
  // load-bearing UI on this page — a visitor needs it to filter. The
  // tabs are rendered as next-intl <Link>s (role=link), not buttons.
  await expect(
    page.locator("main").last().getByRole("link", { name: "规格", exact: true })
  ).toBeVisible({ timeout: 15_000 });
});

test("product detail page resolves for a stable imported slug", async ({ page }) => {
  const response = await page.goto(`/zh/products/${STABLE_PRODUCT_SLUG}`);
  expect(response?.status()).toBe(200);
  await expect(page.locator("h1")).toBeVisible();
  // The "request sample" CTA is the primary action — it must render so
  // the product-detail → contact routing path stays intact.
  await expect(page.getByRole("button").filter({ hasText: /SAMPLE|样品/i })).toBeVisible();
});

test("contact page renders the inquiry form with required fields", async ({ page }) => {
  await page.goto("/zh/contact");
  // Scope to <main> so the footer newsletter form doesn't trip strict mode.
  const inquiryForm = page.locator("main form");
  await expect(inquiryForm).toBeVisible();
  await expect(inquiryForm.locator("input[name='name']")).toBeVisible();
  await expect(inquiryForm.locator("input[name='email']")).toBeVisible();
  await expect(inquiryForm.locator("textarea[name='message']")).toBeVisible();
});

test("contact page prefills email when ?email query is present", async ({ page }) => {
  await page.goto("/zh/contact?email=visitor%40example.com");
  await expect(
    page.locator("main form input[name='email']")
  ).toHaveValue("visitor@example.com");
});

test("studio admin UI is reachable without locale prefix", async ({ page }) => {
  const response = await page.goto("/studio");
  expect(response?.status()).toBe(200);
  // Sanity Studio injects its own root — we just need it to not 404.
});
