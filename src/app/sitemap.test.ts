import { describe, expect, it, vi, beforeEach } from "vitest";

// @/i18n/routing pulls in next-intl's client navigation factory, which in turn
// imports next/navigation — unavailable in the bare Vitest node env. We only
// need the routing config object, so stub the module surface ourselves.
vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en", "zh", "es", "ar"] as const,
    defaultLocale: "zh" as const,
  },
}));

vi.mock("@/data/products", () => ({
  getProductSlugs: vi.fn(),
}));

vi.mock("@/data/news", () => ({
  getNewsSlugs: vi.fn(),
}));

import sitemap from "./sitemap";
import { getProductSlugs } from "@/data/products";
import { getNewsSlugs } from "@/data/news";

const mockedProductSlugs = vi.mocked(getProductSlugs);
const mockedNewsSlugs = vi.mocked(getNewsSlugs);

describe("sitemap", () => {
  beforeEach(() => {
    mockedProductSlugs.mockReset();
    mockedNewsSlugs.mockReset();
  });

  it("emits one <url> entry per (locale × content path) with full hreflang alternates per Google spec", async () => {
    mockedProductSlugs.mockResolvedValue([
      { slug: "lv927l175", updatedAt: "2026-01-15T00:00:00.000Z" },
    ]);
    mockedNewsSlugs.mockResolvedValue([
      { slug: "spring-launch", updatedAt: "2026-04-01T00:00:00.000Z" },
    ]);

    const entries = await sitemap();

    // 10 static routes × 4 locales + 1 product × 4 + 1 news × 4 = 48 entries.
    // Google's i18n sitemap spec requires each language version to appear as
    // its own <url> AND list every alternate (including itself).
    expect(entries).toHaveLength(48);

    // Every entry must carry the full hreflang map
    for (const entry of entries) {
      expect(entry.alternates?.languages).toBeDefined();
      const langs = entry.alternates!.languages!;
      expect(langs["x-default"]).toBeDefined();
      expect(langs["en"]).toBeDefined();
      expect(langs["zh"]).toBeDefined();
      expect(langs["es"]).toBeDefined();
      expect(langs["ar"]).toBeDefined();
    }
  });

  it("emits hreflang URLs with the correct locale prefix per Google's spec", async () => {
    mockedProductSlugs.mockResolvedValue([]);
    mockedNewsSlugs.mockResolvedValue([]);

    const entries = await sitemap();
    const aboutZh = entries.find(
      (e) => e.url === "https://zylsinteredstone.com/about",
    );
    expect(aboutZh).toBeDefined();
    const langs = aboutZh!.alternates!.languages!;
    // x-default must point at the English fallback for international B2B traffic
    expect(langs["x-default"]).toBe("https://zylsinteredstone.com/en/about");
    expect(langs["en"]).toBe("https://zylsinteredstone.com/en/about");
    // Default locale (zh) is unprefixed per normalizeMetadataPath
    expect(langs["zh"]).toBe("https://zylsinteredstone.com/about");
    expect(langs["es"]).toBe("https://zylsinteredstone.com/es/about");
    expect(langs["ar"]).toBe("https://zylsinteredstone.com/ar/about");

    // The non-default locale variants must also exist as their own <url>
    // entries (this is what Google's spec actually requires).
    expect(
      entries.some((e) => e.url === "https://zylsinteredstone.com/en/about"),
    ).toBe(true);
    expect(
      entries.some((e) => e.url === "https://zylsinteredstone.com/ar/about"),
    ).toBe(true);
  });

  it("emits one dynamic product entry per locale, all sharing hreflang + lastModified", async () => {
    mockedProductSlugs.mockResolvedValue([
      { slug: "yi-da-li-hui-dong", updatedAt: "2026-02-20T10:30:00.000Z" },
    ]);
    mockedNewsSlugs.mockResolvedValue([]);

    const entries = await sitemap();
    const productEntries = entries.filter((e) =>
      e.url.endsWith("/products/yi-da-li-hui-dong"),
    );
    // 4 locales = 4 entries for one product slug
    expect(productEntries).toHaveLength(4);

    for (const entry of productEntries) {
      expect(entry.priority).toBe(0.7);
      expect(entry.lastModified).toEqual(
        new Date("2026-02-20T10:30:00.000Z"),
      );
      const langs = entry.alternates!.languages!;
      expect(langs["x-default"]).toBe(
        "https://zylsinteredstone.com/en/products/yi-da-li-hui-dong",
      );
      expect(langs["en"]).toBe(
        "https://zylsinteredstone.com/en/products/yi-da-li-hui-dong",
      );
      expect(langs["ar"]).toBe(
        "https://zylsinteredstone.com/ar/products/yi-da-li-hui-dong",
      );
    }
  });

  it("emits one dynamic news entry per locale, all sharing hreflang + lastModified", async () => {
    mockedProductSlugs.mockResolvedValue([]);
    mockedNewsSlugs.mockResolvedValue([
      { slug: "spring-launch", updatedAt: "2026-04-01T12:00:00.000Z" },
    ]);

    const entries = await sitemap();
    const newsEntries = entries.filter((e) =>
      e.url.endsWith("/news/spring-launch"),
    );
    expect(newsEntries).toHaveLength(4);

    for (const entry of newsEntries) {
      expect(entry.priority).toBe(0.6);
      expect(entry.lastModified).toEqual(
        new Date("2026-04-01T12:00:00.000Z"),
      );
      const langs = entry.alternates!.languages!;
      expect(langs["x-default"]).toBe(
        "https://zylsinteredstone.com/en/news/spring-launch",
      );
    }
  });

  it("falls back to module-load timestamp when CMS returns an invalid updatedAt", async () => {
    mockedProductSlugs.mockResolvedValue([
      { slug: "bad-date", updatedAt: "not-a-date" },
      { slug: "empty-date", updatedAt: "" },
    ]);
    mockedNewsSlugs.mockResolvedValue([]);

    const entries = await sitemap();
    const badDateEntries = entries.filter((e) =>
      e.url.endsWith("/products/bad-date"),
    );
    const emptyDateEntries = entries.filter((e) =>
      e.url.endsWith("/products/empty-date"),
    );

    expect(badDateEntries).toHaveLength(4);
    expect(emptyDateEntries).toHaveLength(4);

    for (const entry of [...badDateEntries, ...emptyDateEntries]) {
      const lastMod = entry.lastModified;
      expect(lastMod).toBeInstanceOf(Date);
      // Must NOT be an Invalid Date — sitemap XML would otherwise emit
      // `<lastmod>Invalid Date</lastmod>` and Google would discard the entry.
      expect(Number.isNaN((lastMod as Date).getTime())).toBe(false);
    }
  });

  it("falls back to static routes when the CMS throws", async () => {
    mockedProductSlugs.mockRejectedValue(new Error("CMS unreachable"));
    mockedNewsSlugs.mockRejectedValue(new Error("CMS unreachable"));

    // Suppress the expected console.error to keep test output clean.
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const entries = await sitemap();
    // Only the 10 static routes × 4 locales = 40; no dynamic entries.
    expect(entries).toHaveLength(40);
    expect(errSpy).toHaveBeenCalledTimes(2);
    errSpy.mockRestore();
  });
});
