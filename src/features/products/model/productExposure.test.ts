import assert from "node:assert/strict";
import test from "node:test";

import {
  isImportedProductFamily,
  TRADE_YELLOW_PLACEHOLDER_IMAGE,
} from "./productExposure.ts";

test("isImportedProductFamily only exposes imported trade families", () => {
  assert.equal(isImportedProductFamily({ normalizedName: "纯白" }), true);
  assert.equal(isImportedProductFamily({ normalizedName: "" }), false);
  assert.equal(isImportedProductFamily({ normalizedName: "   " }), false);
  assert.equal(isImportedProductFamily({}), false);
});

test("trade placeholder image path is stable", () => {
  assert.equal(
    TRADE_YELLOW_PLACEHOLDER_IMAGE,
    "/assets/placeholders/trade-yellow-placeholder.svg"
  );
});
