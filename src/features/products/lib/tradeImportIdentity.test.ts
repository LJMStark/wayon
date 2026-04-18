import { expect, test } from "vitest";

import {
  buildStableTradeFamilyKey,
  buildStableTradeFamilySlug,
  buildStableTradeProductId,
  buildStableTradeVariantId,
} from "./tradeImportIdentity.ts";

test("stable trade family identity only depends on normalized name", () => {
  const familyKey = buildStableTradeFamilyKey("白洞石");

  expect(familyKey).toBe(buildStableTradeFamilyKey("白洞石"));
  expect(buildStableTradeFamilySlug("白洞石")).toBe(buildStableTradeFamilySlug("白洞石"));
  expect(buildStableTradeProductId(familyKey)).toBe(buildStableTradeProductId(buildStableTradeFamilyKey("白洞石")));
  expect(buildStableTradeVariantId(familyKey, "ZL900001")).toBe(buildStableTradeVariantId(buildStableTradeFamilyKey("白洞石"), "ZL900001"));
});
