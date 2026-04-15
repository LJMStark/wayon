import assert from "node:assert/strict";
import test from "node:test";

import {
  HOME_CASE_PLACEHOLDER_HREF,
  HOME_VISUAL_PLACEHOLDER_IMAGE,
} from "./homeVisuals.ts";

test("home placeholder image reuses the trade yellow placeholder", () => {
  assert.equal(
    HOME_VISUAL_PLACEHOLDER_IMAGE,
    "/assets/placeholders/trade-yellow-placeholder.svg"
  );
});

test("home case placeholder href points to the solution section", () => {
  assert.equal(HOME_CASE_PLACEHOLDER_HREF, "/solution#case");
});
