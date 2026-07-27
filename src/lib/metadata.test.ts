import { describe, expect, it, vi } from "vitest";

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["en", "zh", "es", "ar"] as const,
    defaultLocale: "zh" as const,
  },
}));

import { buildPageMetadata, normalizeMetadataPath } from "./metadata";

describe("localized metadata paths", () => {
  it("keeps the default locale prefix so canonical URLs resolve directly", () => {
    expect(normalizeMetadataPath("zh", "/products/lv927l175")).toBe(
      "/zh/products/lv927l175",
    );
    expect(normalizeMetadataPath("zh", "/")).toBe("/zh");
  });

  it("uses the same prefixed paths for canonical, hreflang and Open Graph", () => {
    const metadata = buildPageMetadata({
      locale: "zh",
      title: "测试产品",
      description: "测试介绍",
      path: "/products/lv927l175",
    });

    expect(metadata.alternates?.canonical).toBe("/zh/products/lv927l175");
    expect(metadata.alternates?.languages).toMatchObject({
      "x-default": "/en/products/lv927l175",
      en: "/en/products/lv927l175",
      zh: "/zh/products/lv927l175",
      es: "/es/products/lv927l175",
      ar: "/ar/products/lv927l175",
    });
    expect(metadata.openGraph?.url).toBe("/zh/products/lv927l175");
  });

  it("omits hreflang targets that are unavailable for locale-scoped content", () => {
    const metadata = buildPageMetadata({
      locale: "en",
      locales: ["en", "es", "ar"],
      title: "Launch",
      description: "Launch details",
      path: "/news/launch",
    });

    expect(metadata.alternates?.languages).toEqual({
      "x-default": "/en/news/launch",
      en: "/en/news/launch",
      es: "/es/news/launch",
      ar: "/ar/news/launch",
    });
  });
});
