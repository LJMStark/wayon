import { describe, expect, test } from "vitest";

import { stripDirectoryMedia, type Product } from "./products";

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    _id: "p1",
    title: { en: "T", zh: "标题", es: "T", ar: "T" },
    slug: "demo-product",
    variants: [
      {
        code: "CODE1",
        size: "800x800",
        thickness: "9",
        process: "polished",
        colorGroup: "grey",
        elementImages: [
          { sourcePath: "a", publicUrl: "https://cdn/a.jpg", cardUrl: "https://cdn/a-card.jpg" },
          { sourcePath: "b", publicUrl: "https://cdn/b.jpg" },
        ],
        spaceImages: [{ sourcePath: "c", publicUrl: "https://cdn/c.jpg" }],
        realImages: [{ sourcePath: "d", publicUrl: "https://cdn/d.jpg" }],
        videos: [{ sourcePath: "v", publicUrl: "https://cdn/v.mp4" }],
      },
    ],
    ...overrides,
  };
}

describe("stripDirectoryMedia", () => {
  test("drops heavy media arrays while keeping variant attributes", () => {
    const light = stripDirectoryMedia(makeProduct({ coverImageUrl: "https://cdn/cover.jpg" }));
    const variant = light.variants![0];

    expect(variant.elementImages).toEqual([]);
    expect(variant.spaceImages).toEqual([]);
    expect(variant.realImages).toEqual([]);
    expect(variant.videos).toEqual([]);
    // Attributes the listing + related-products scoring rely on are preserved.
    expect(variant.code).toBe("CODE1");
    expect(variant.size).toBe("800x800");
    expect(variant.thickness).toBe("9");
    expect(variant.process).toBe("polished");
    expect(variant.colorGroup).toBe("grey");
  });

  test("keeps an explicit cover image", () => {
    const light = stripDirectoryMedia(makeProduct({ coverImageUrl: "https://cdn/cover.jpg" }));
    expect(light.coverImageUrl).toBe("https://cdn/cover.jpg");
  });

  test("falls back to the first variant image when no cover is set", () => {
    const light = stripDirectoryMedia(makeProduct({ coverImageUrl: undefined }));
    // Resolved before the arrays are emptied, so the listing thumbnail survives.
    // The cover picker prefers the sized `card` variant when present.
    expect(light.coverImageUrl).toBe("https://cdn/a-card.jpg");
  });

  test("does not mutate the input product", () => {
    const original = makeProduct({ coverImageUrl: "https://cdn/cover.jpg" });
    stripDirectoryMedia(original);
    expect(original.variants![0].elementImages).toHaveLength(2);
  });
});
