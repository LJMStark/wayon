import { test, expect } from "@playwright/test";

const hasPayloadBackedE2E =
  process.env.PAYLOAD_E2E === "1" ||
  Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);

test("root path redirects to a supported locale", async ({ page }) => {
  await page.goto("/");
  // next-intl picks the locale via Accept-Language; the test just
  // confirms we land on a prefixed route rather than a bare /.
  await expect(page).toHaveURL(/\/(en|zh|es|ar|ru)(\/|$)/);
  await expect(page.locator("body")).toBeVisible();
});

test("products directory loads with taxonomy filter tabs", async ({ page }) => {
  test.skip(
    !hasPayloadBackedE2E,
    "Payload-backed product pages need DATABASE_URL/PAYLOAD_SECRET in CI"
  );

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

test("product detail page resolves from the current directory", async ({ page }) => {
  test.skip(
    !hasPayloadBackedE2E,
    "Payload-backed product pages need DATABASE_URL/PAYLOAD_SECRET in CI"
  );

  await page.goto(
    `/zh/products?section=series&value=${encodeURIComponent("质感岩板")}`
  );
  const detailLink = page
    .locator('#main-content a[href^="/zh/products/"]:not([href*="?"])')
    .first();

  await expect(detailLink).toBeVisible({ timeout: 15_000 });
  await detailLink.click();
  await expect(page).toHaveURL(/\/zh\/products\/[^/?#]+$/);
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

test("payload admin UI is reachable without locale prefix", async ({ page }) => {
  test.skip(
    !hasPayloadBackedE2E,
    "Payload admin needs DATABASE_URL/PAYLOAD_SECRET in CI"
  );

  const response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  // Payload injects its own root — we just need it to not 404.
});
