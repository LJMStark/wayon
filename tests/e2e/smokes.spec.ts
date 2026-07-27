import { test, expect } from "@playwright/test";

const hasPayloadBackedE2E =
  process.env.PAYLOAD_E2E === "1" ||
  Boolean(process.env.DATABASE_URL && process.env.PAYLOAD_SECRET);

test("root path redirects to a supported locale", async ({ page }) => {
  await page.goto("/");
  // next-intl picks the locale via Accept-Language; the test just
  // confirms we land on a prefixed route rather than a bare /.
  await expect(page).toHaveURL(/\/(en|zh|es|ar)(\/|$)/);
  await expect(page.locator("body")).toBeVisible();
});

test("home startup stays within the CLS budget", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "Desktop Chrome",
    "LayoutShift entries are asserted with Chromium's PerformanceObserver implementation"
  );

  await page.addInitScript(() => {
    let cumulativeLayoutShift = 0;

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        };

        if (!layoutShift.hadRecentInput) {
          cumulativeLayoutShift += layoutShift.value;
        }
      }
    }).observe({ type: "layout-shift", buffered: true });

    Object.defineProperty(window, "__wayonCumulativeLayoutShift", {
      get: () => cumulativeLayoutShift,
    });
  });

  await page.goto("/zh", { waitUntil: "networkidle" });

  const cls = await page.evaluate(
    () =>
      (
        window as Window & {
          __wayonCumulativeLayoutShift?: number;
        }
      ).__wayonCumulativeLayoutShift ?? 0
  );

  expect(cls).toBeLessThan(0.1);
});

test("desktop solution tabs reserve their scroll height before hydration", async ({
  browser,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "Desktop Chrome",
    "The no-JavaScript SSR check runs once in Chromium"
  );

  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();

  try {
    await page.goto(`${process.env.BASE_URL ?? "http://localhost:3000"}/zh`, {
      waitUntil: "networkidle",
    });

    await expect(page.locator(".zyl-home-immersive--scroll")).toHaveCSS(
      "height",
      "4500px"
    );
  } finally {
    await context.close();
  }
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
  // The catalog nav section (规格/岩板产品系列/厚度/颜色/表面工艺/定制产品) is the
  // load-bearing UI on this page — a visitor needs it to filter. The
  // tabs are rendered as next-intl <Link>s (role=link), not buttons.
  await expect(
    page.locator("main").last().getByRole("link", { name: "规格", exact: true })
  ).toBeVisible({ timeout: 15_000 });
});

test("invalid product filters render the localized not-found page", async ({
  page,
}) => {
  const response = await page.goto("/en/products?color=unknown");

  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: "Page not found" })
  ).toBeVisible();
});

test("product detail page resolves from the current directory", async ({ page }) => {
  test.skip(
    !hasPayloadBackedE2E,
    "Payload-backed product pages need DATABASE_URL/PAYLOAD_SECRET in CI"
  );

  await page.goto(
    "/zh/products?series=texture-slab"
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

test("desktop language selector opens on click and switches locale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/zh");

  const header = page.getByRole("banner");
  await header.getByRole("button", { name: "语言切换" }).click();

  const englishLink = header.getByRole("link", { name: /English/ }).first();
  await expect(englishLink).toBeVisible();
  await englishLink.click();
  await expect(page).toHaveURL(/\/en$/);

  await page.getByRole("banner").getByRole("button", { name: "Language" }).click();
  await expect(
    page.getByRole("banner").getByRole("link", { name: /Chinese/ }).first()
  ).toBeVisible();
  await expect(page.getByRole("banner")).not.toContainText(/[\u3400-\u9fff]/);
});

test("header contact links are usable on ultra-wide desktop and mobile", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "Desktop Chrome",
    "Responsive header contact behavior is covered once in Chromium"
  );

  await page.setViewportSize({ width: 1944, height: 910 });
  await page.goto("/en");

  const header = page.getByRole("banner");
  const desktopEmail = header.locator(
    'a[href="mailto:zyl.stone.slab@gmail.com"]'
  );
  const desktopWhatsapp = header.locator(
    'a[href="https://wa.me/8613229246894"]'
  );

  await expect(desktopEmail).toBeVisible();
  await expect(desktopEmail).toContainText("zyl.stone.slab@gmail.com");
  await expect(desktopWhatsapp).toBeVisible();
  await expect(desktopWhatsapp).toContainText("+86 132 2924 6894");
  await expect(desktopWhatsapp).toHaveAttribute("target", "_blank");
  await expect(desktopWhatsapp).toHaveAttribute("rel", "noopener noreferrer");

  await page.setViewportSize({ width: 390, height: 844 });
  await header.getByRole("button", { name: "Open navigation" }).click();

  const mobileEmail = header
    .locator('a[href="mailto:zyl.stone.slab@gmail.com"]')
    .last();
  const mobileWhatsapp = header
    .locator('a[href="https://wa.me/8613229246894"]')
    .last();

  await expect(mobileEmail).toBeVisible();
  await expect(mobileWhatsapp).toBeVisible();
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
