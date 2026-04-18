import { expect, test } from "vitest";

import {
  isPublishedProduct,
  TRADE_YELLOW_PLACEHOLDER_IMAGE,
} from "./productExposure.ts";

test("isPublishedProduct only exposes products explicitly flagged published", () => {
  expect(isPublishedProduct({ published: true })).toBe(true);
  expect(isPublishedProduct({ published: false })).toBe(false);
  expect(isPublishedProduct({ published: null })).toBe(false);
  expect(isPublishedProduct({})).toBe(false);
});

test("trade placeholder image path is stable", () => {
  expect(TRADE_YELLOW_PLACEHOLDER_IMAGE).toBe("/assets/placeholders/trade-yellow-placeholder.svg");
});
