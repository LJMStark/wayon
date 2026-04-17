import assert from "node:assert/strict";
import test from "node:test";

import { buildCustomCapabilitySummaries } from "./customCapabilitySummary.ts";
import type { ProductDirectoryItem } from "../types";

const products: ProductDirectoryItem[] = [
  {
    slug: "custom-surface-demo",
    title: "定制表面案例",
    category: "定制产品",
    catalogMode: "custom",
    customCapability: "custom-surface",
    seriesTypes: [],
    coverImageUrl: "/surface-cover.jpg",
    variants: [{ code: "CUSTOM-001" }],
  },
];

test("buildCustomCapabilitySummaries falls back to built-in capability copy when cms record is missing", () => {
  const summaries = buildCustomCapabilitySummaries([], products, "zh");

  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.key, "custom-surface");
  assert.equal(summaries[0]?.title, "定制表面");
  assert.equal(summaries[0]?.count, 1);
});
