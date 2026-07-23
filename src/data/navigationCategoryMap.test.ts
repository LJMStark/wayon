import { expect, test } from "vitest";

import {
  buildLegacyProductCategoryRedirects,
  buildCategoryProductsHref,
  getSeriesForCategory,
} from "./navigationCategoryMap";

test("getSeriesForCategory maps each known nav slug to a TradeSeriesType", () => {
  expect(getSeriesForCategory("quartz")).toBe("质感岩板");
  expect(getSeriesForCategory("marble")).toBe("名石岩板");
  expect(getSeriesForCategory("artificial-marble")).toBe("名石岩板");
  expect(getSeriesForCategory("terrazzo")).toBe("艺术岩板");
});

test("getSeriesForCategory returns null for unknown slugs", () => {
  expect(getSeriesForCategory("not-a-category")).toBe(null);
  expect(getSeriesForCategory("")).toBe(null);
});

test("buildCategoryProductsHref produces a descriptive ASCII query", () => {
  expect(buildCategoryProductsHref("quartz")).toBe(
    "/products?series=texture-slab"
  );
});

test("buildCategoryProductsHref falls back to the bare /products path on unknown slug", () => {
  // No-mapping slugs land on the unfiltered catalog rather than emit a
  // broken filter URL.
  expect(buildCategoryProductsHref("not-a-category")).toBe("/products");
});

test("legacy product paths derive their destinations from the category map", () => {
  expect(buildLegacyProductCategoryRedirects()).toEqual([
    { source: "/products/quartz", destination: "/products?series=texture-slab" },
    { source: "/products/terrazzo", destination: "/products?series=art-slab" },
    { source: "/products/flexible-stone", destination: "/products?series=texture-slab" },
    { source: "/products/marble", destination: "/products?series=classic-stone-slab" },
    { source: "/products/gem-stone", destination: "/products?series=art-slab" },
    { source: "/products/silica-free", destination: "/products?series=texture-slab" },
    { source: "/products/quartz.html", destination: "/products?series=texture-slab" },
    { source: "/products/flexible-stone.html", destination: "/products?series=texture-slab" },
  ]);
});
