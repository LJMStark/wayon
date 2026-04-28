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
