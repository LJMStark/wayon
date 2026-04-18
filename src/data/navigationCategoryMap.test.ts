import { expect, test } from "vitest";

import {
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

test("buildCategoryProductsHref produces a percent-encoded canonical query", () => {
  // The Chinese series name has to be URI-encoded so it survives the
  // browser address bar and stays a valid HTTP header value when the
  // navigation menu emits an anchor.
  expect(buildCategoryProductsHref("quartz")).toBe(
    "/products?section=series&value=%E8%B4%A8%E6%84%9F%E5%B2%A9%E6%9D%BF"
  );
});

test("buildCategoryProductsHref falls back to the bare /products path on unknown slug", () => {
  // No-mapping slugs land on the unfiltered catalog rather than emit a
  // broken filter URL.
  expect(buildCategoryProductsHref("not-a-category")).toBe("/products");
});
