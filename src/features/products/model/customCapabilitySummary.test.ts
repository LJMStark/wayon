import { expect, test } from "vitest";

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

  expect(summaries.length).toBe(1);
  expect(summaries[0]?.key).toBe("custom-surface");
  expect(summaries[0]?.title).toBe("定制表面");
  expect(summaries[0]?.count).toBe(1);
});
