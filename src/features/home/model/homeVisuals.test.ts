import { expect, test } from "vitest";

import {
  HOME_CASE_PLACEHOLDER_HREF,
  HOME_VISUAL_PLACEHOLDER_IMAGE,
} from "./homeVisuals.ts";

test("home placeholder image reuses the trade yellow placeholder", () => {
  expect(HOME_VISUAL_PLACEHOLDER_IMAGE).toBe("/assets/placeholders/trade-yellow-placeholder.svg");
});

test("home case placeholder href points to the solution section", () => {
  expect(HOME_CASE_PLACEHOLDER_HREF).toBe("/solution#case");
});
