import { expect, test } from "vitest";

import {
  isImportedProductFamily,
  TRADE_YELLOW_PLACEHOLDER_IMAGE,
} from "./productExposure.ts";

test("isImportedProductFamily only exposes imported trade families", () => {
  expect(isImportedProductFamily({ normalizedName: "纯白" })).toBe(true);
  expect(isImportedProductFamily({ normalizedName: "" })).toBe(false);
  expect(isImportedProductFamily({ normalizedName: "   " })).toBe(false);
  expect(isImportedProductFamily({})).toBe(false);
});

test("trade placeholder image path is stable", () => {
  expect(TRADE_YELLOW_PLACEHOLDER_IMAGE).toBe("/assets/placeholders/trade-yellow-placeholder.svg");
});
