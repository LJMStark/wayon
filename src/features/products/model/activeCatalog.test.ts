import { expect, test } from "vitest";

import { isActiveCatalogSourcePath } from "./activeCatalog";

test("isActiveCatalogSourcePath keeps paths inside the active catalog tree", () => {
  expect(
    isActiveCatalogSourcePath("产品/众岩联标准素材集合/新品素材集合/800x2600x9mm/demo.jpg")
  ).toBe(true);
  expect(
    isActiveCatalogSourcePath("产品/众岩联标准素材集合/促销特惠款/demo.mp4")
  ).toBe(true);
});

test("isActiveCatalogSourcePath rejects legacy paths under 视频/", () => {
  // These were the 128 productVariant video references that need to be
  // filtered out now that docs/外贸出口资料/视频/ has been moved aside.
  expect(
    isActiveCatalogSourcePath("视频/众岩联--实物视频/918馆/918细哑面/demo.mp4")
  ).toBe(false);
});

test("isActiveCatalogSourcePath rejects empty or missing paths", () => {
  expect(isActiveCatalogSourcePath(undefined)).toBe(false);
  expect(isActiveCatalogSourcePath("")).toBe(false);
});

test("isActiveCatalogSourcePath rejects paths that merely contain the prefix", () => {
  // Anchored at the start of the string; a sibling with a confusing
  // prefix substring should not pass.
  expect(
    isActiveCatalogSourcePath("外部/产品/众岩联标准素材集合/fake.jpg")
  ).toBe(false);
});
