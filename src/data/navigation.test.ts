import { expect, test } from "vitest";

import { TRADE_PROCESSES } from "@/features/products/lib/tradeCatalog";

import { NAV_ITEMS } from "./navigation";

test("collection process menu exposes every supported process", () => {
  const collection = NAV_ITEMS.find((item) => item.label === "collection");
  const processSection = collection?.subItems?.find(
    (item) => item.label === "catalogProcess"
  );

  const values =
    processSection?.children?.map((child) => {
      const url = new URL(child.href, "https://example.com");
      return url.searchParams.get("value");
    }) ?? [];

  expect(values).toEqual([...TRADE_PROCESSES]);
});

test("collection menu nests new series under slabs and previews special offers", () => {
  const collection = NAV_ITEMS.find((item) => item.label === "collection");
  const labels = collection?.subItems?.map((item) => item.label) ?? [];

  expect(labels.slice(1, 3)).toEqual([
    "catalogSeries",
    "catalogSpecialSeries",
  ]);

  const seriesSection = collection?.subItems?.find(
    (item) => item.label === "catalogSeries"
  );
  expect(seriesSection?.children?.map((child) => child.label)).toContain(
    "catalogNewSeries"
  );

  const hrefs = new Map(
    collection?.subItems?.map((item) => [item.label, item.href]) ?? []
  );

  expect(hrefs.get("catalogSpecialSeries")).toBe(
    "/products?section=series&value=%E7%89%B9%E6%83%A0%E7%B3%BB%E5%88%97"
  );

  const specialSeries = collection?.subItems?.find(
    (item) => item.label === "catalogSpecialSeries"
  );

  expect(specialSeries?.children).toBeUndefined();
  expect(specialSeries?.previewProducts?.slice(0, 2)).toEqual([
    expect.objectContaining({
      title: "雅诗兰黛",
      href: "/products/zyl1632l971",
    }),
    expect.objectContaining({
      title: "丝绸白",
      href: "/products/zl1224l936",
    }),
  ]);

  expect(
    specialSeries?.previewProducts?.some((product) =>
      /^ZYL?\d|^ZL\d/i.test(product.title)
    )
  ).toBe(false);
});

test("collection custom menu exposes customization links with contact fallbacks", () => {
  const collection = NAV_ITEMS.find((item) => item.label === "collection");
  const customSection = collection?.subItems?.find(
    (item) => item.label === "catalogCustom"
  );
  const children = customSection?.children ?? [];

  expect(children.map((child) => child.label)).toEqual([
    "catalogCustomSize",
    "catalogCustomThickness",
    "catalogCustomSurfaceFinish",
    "catalogCustomColor",
    "catalogCustomCuttingProcessing",
    "catalogCustomPatternDesign",
    "catalogCustomHotBending",
    "catalogCustomLogoBranding",
  ]);

  for (const child of children) {
    const url = new URL(child.href, "https://example.com");

    if (child.label === "catalogCustomPatternDesign") {
      expect(url.pathname).toBe("/products");
      expect(url.searchParams.get("section")).toBe("custom");
      expect(url.searchParams.get("value")).toBe("custom-pattern-design");
      continue;
    }

    expect(url.pathname).toBe("/contact");
  }
});
