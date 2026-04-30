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

test("collection menu places new and special series after the main series section", () => {
  const collection = NAV_ITEMS.find((item) => item.label === "collection");
  const labels = collection?.subItems?.map((item) => item.label) ?? [];

  expect(labels.slice(1, 4)).toEqual([
    "catalogSeries",
    "catalogNewSeries",
    "catalogSpecialSeries",
  ]);

  const hrefs = new Map(
    collection?.subItems?.map((item) => [item.label, item.href]) ?? []
  );

  expect(hrefs.get("catalogNewSeries")).toBe(
    "/products?section=series&value=%E6%96%B0%E5%93%81%E7%B3%BB%E5%88%97"
  );
  expect(hrefs.get("catalogSpecialSeries")).toBe(
    "/products?section=series&value=%E7%89%B9%E6%83%A0%E7%B3%BB%E5%88%97"
  );
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
      expect(url.searchParams.get("section")).toBe("series");
      expect(url.searchParams.get("value")).toBe("艺术岩板");
      continue;
    }

    expect(url.pathname).toBe("/contact");
  }
});
