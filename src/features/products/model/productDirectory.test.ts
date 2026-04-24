import { expect, test } from "vitest";

import {
  matchesDirectoryFilters,
  pickDefaultVariantCode,
  selectProductCoverUrl,
  type DirectoryFilters,
  type DirectoryProduct,
} from "./productDirectory.ts";

const baseProduct: DirectoryProduct = {
  slug: "wei-duo-li-ya",
  seriesTypes: ["名石岩板"],
  coverImageUrl: null,
  catalogMode: "standard",
  customCapability: null,
  variants: [
    {
      code: "LV930L902",
      size: "900X3000mm",
      thickness: "9mm",
      process: "亮光",
      colorGroup: "白色",
      sortOrder: 20,
      elementImages: [{ publicUrl: "/element-1.jpg", sourcePath: "a", sortOrder: 0 }],
      spaceImages: [],
      realImages: [],
      videos: [],
    },
    {
      code: "LV1224L902",
      size: "1200X2400mm",
      thickness: "12mm",
      process: "亮光",
      colorGroup: "白色",
      sortOrder: 10,
      elementImages: [],
      spaceImages: [{ publicUrl: "/space-1.jpg", sourcePath: "b", sortOrder: 0 }],
      realImages: [{ publicUrl: "/real-1.jpg", sourcePath: "c", sortOrder: 0 }],
      videos: [{ publicUrl: "/video-1.mp4", sourcePath: "d", sortOrder: 0 }],
    },
  ],
};

test("pickDefaultVariantCode prefers richer media, then sortOrder, then code", () => {
  expect(pickDefaultVariantCode(baseProduct.variants)).toBe("LV1224L902");

  expect(pickDefaultVariantCode([
      {
        ...baseProduct.variants[0],
        code: "B",
        sortOrder: 5,
      },
      {
        ...baseProduct.variants[0],
        code: "A",
        sortOrder: 5,
      },
    ])).toBe("A");
});

test("matchesDirectoryFilters matches when any variant satisfies active filters", () => {
  const filters: DirectoryFilters = {
    size: "1200X2400mm",
    thickness: "12mm",
    process: "亮光",
    seriesType: "名石岩板",
    colorGroup: "白色",
    catalogMode: "standard",
  };

  expect(matchesDirectoryFilters(baseProduct, filters)).toBe(true);
  expect(matchesDirectoryFilters(baseProduct, {
      ...filters,
      colorGroup: "绿色",
    })).toBe(false);

  expect(matchesDirectoryFilters(
      {
        ...baseProduct,
        catalogMode: "custom",
        customCapability: "custom-size",
      },
      {
        catalogMode: "custom",
        customCapability: "custom-size",
      }
    )).toBe(true);
});

test("selectProductCoverUrl respects product cover, then element, then space, then real", () => {
  expect(selectProductCoverUrl(baseProduct, "/placeholder.jpg")).toBe("/element-1.jpg");

  expect(selectProductCoverUrl(
      {
        ...baseProduct,
        coverImageUrl: "/family-cover.jpg",
      },
      "/placeholder.jpg"
    )).toBe("/family-cover.jpg");

  expect(selectProductCoverUrl(
      {
        ...baseProduct,
        variants: [
          {
            ...baseProduct.variants[0],
            elementImages: [],
            spaceImages: [],
            realImages: [],
          },
        ],
      },
      "/placeholder.jpg"
    )).toBe("/placeholder.jpg");
});
