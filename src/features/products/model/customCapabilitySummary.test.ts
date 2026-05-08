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

test("buildCustomCapabilitySummaries falls back from missing locale to English before Chinese", () => {
  const summaries = buildCustomCapabilitySummaries(
    [
      {
        _id: "capability-1",
        capabilityKey: "custom-surface",
        title: {
          en: "Custom Surface",
          zh: "定制表面",
          es: "",
          ar: "",
        },
        description: {
          en: "Tailored surface systems.",
          zh: "定制表面系统。",
          es: "",
          ar: "",
        },
      },
    ],
    products,
    "es"
  );

  expect(summaries[0]?.title).toBe("Custom Surface");
  expect(summaries[0]?.description).toBe("Tailored surface systems.");
});

test("buildCustomCapabilitySummaries rejects Chinese text stored in non-Chinese locale fields", () => {
  const summaries = buildCustomCapabilitySummaries(
    [
      {
        _id: "capability-1",
        capabilityKey: "custom-pattern-design",
        title: {
          en: "定制图案设计",
          zh: "定制图案设计",
          es: "定制图案设计",
          ar: "定制图案设计",
        },
        description: {
          en: "支持纹理开发、图案深化与连纹方案。",
          zh: "支持纹理开发、图案深化与连纹方案。",
          es: "支持纹理开发、图案深化与连纹方案。",
          ar: "支持纹理开发、图案深化与连纹方案。",
        },
      },
    ],
    [
      {
        ...products[0],
        customCapability: "custom-pattern-design",
      },
    ],
    "en"
  );

  expect(summaries[0]?.title).toBe("Custom Pattern Design");
  expect(summaries[0]?.description).toBe(
    "Texture development, pattern refinement and book-matched solutions."
  );
});

test("buildCustomCapabilitySummaries keeps Chinese copy for the Chinese locale", () => {
  const summaries = buildCustomCapabilitySummaries(
    [
      {
        _id: "capability-1",
        capabilityKey: "custom-surface",
        title: {
          en: "Custom Surface",
          zh: "定制表面",
          es: "",
          ar: "",
        },
        description: {
          en: "Tailored surface systems.",
          zh: "定制表面系统。",
          es: "",
          ar: "",
        },
      },
    ],
    products,
    "zh"
  );

  expect(summaries[0]?.title).toBe("定制表面");
  expect(summaries[0]?.description).toBe("定制表面系统。");
});
