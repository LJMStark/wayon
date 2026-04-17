import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStableTradeFamilyKey,
  buildStableTradeFamilySlug,
  buildStableTradeProductId,
  buildStableTradeVariantId,
} from "./tradeImportIdentity.ts";

test("stable trade family identity only depends on normalized name", () => {
  const familyKey = buildStableTradeFamilyKey("白洞石");

  assert.equal(familyKey, buildStableTradeFamilyKey("白洞石"));
  assert.equal(
    buildStableTradeFamilySlug("白洞石"),
    buildStableTradeFamilySlug("白洞石")
  );
  assert.equal(
    buildStableTradeProductId(familyKey),
    buildStableTradeProductId(buildStableTradeFamilyKey("白洞石"))
  );
  assert.equal(
    buildStableTradeVariantId(familyKey, "ZL900001"),
    buildStableTradeVariantId(buildStableTradeFamilyKey("白洞石"), "ZL900001")
  );
});
