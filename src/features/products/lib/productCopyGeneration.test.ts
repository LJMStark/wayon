import { expect, test } from "vitest";

import {
  hasAnyLocalizedDescription,
  validateProductCopyDraft,
} from "./productCopyGeneration.mts";

test("hasAnyLocalizedDescription detects existing manual copy in any locale", () => {
  expect(
    hasAnyLocalizedDescription({ zh: "", en: "Existing copy", es: "", ar: "" })
  ).toBe(true);
  expect(
    hasAnyLocalizedDescription({ zh: "", en: "  ", es: "", ar: "" })
  ).toBe(false);
});

test("validateProductCopyDraft accepts complete four-locale copy", () => {
  const result = validateProductCopyDraft({
    description: {
      zh: "柔和纹理适合项目空间。",
      en: "Soft movement for project spaces.",
      es: "Vetas suaves para proyectos.",
      ar: "عروق ناعمة للمشاريع.",
    },
    sources: [{ title: "Reference", url: "https://example.com" }],
    warnings: ["Check physical samples before approval."],
  });

  expect(result.ok).toBe(true);
  if (result.ok) {
    expect(result.draft.description.en).toBe("Soft movement for project spaces.");
    expect(result.draft.sources).toEqual([
      { title: "Reference", url: "https://example.com" },
    ]);
  }
});

test("validateProductCopyDraft reports invalid generated JSON shape", () => {
  const result = validateProductCopyDraft({
    description: {
      zh: "柔和纹理适合项目空间。",
      en: "Soft movement for project spaces.",
      es: "",
    },
    sources: [{ title: "Reference" }],
  });

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors).toEqual([
      "Missing non-empty description.es.",
      "Missing non-empty description.ar.",
    ]);
  }
});
