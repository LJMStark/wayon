import { expect, test } from "vitest";

import {
  HOME_CASE_PLACEHOLDER_HREF,
  HOME_HERO_FALLBACK_IMAGE,
  HOME_VISUAL_PLACEHOLDER_IMAGE,
} from "./homeVisuals.ts";

test("home placeholder image reuses the trade yellow placeholder", () => {
  expect(HOME_VISUAL_PLACEHOLDER_IMAGE).toBe("/assets/fallbacks/product-fallback.jpg");
});

test("home case placeholder href points to the cases page", () => {
  expect(HOME_CASE_PLACEHOLDER_HREF).toBe("/cases");
});

test("home hero fallback image points to a real hero asset", () => {
  expect(HOME_HERO_FALLBACK_IMAGE).toBe("/assets/hero/hero-zyl-global.png");
});
