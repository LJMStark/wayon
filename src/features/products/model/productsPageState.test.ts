import { expect, test } from "vitest";

import { buildProductsPageState } from "./productsPageState";
import type {
  ProductCustomCapabilitySummary,
  ProductDirectoryItem,
} from "../types";

const products: ProductDirectoryItem[] = [
  {
    slug: "xi-nai-jin",
    title: "西奈金",
    category: "岩板产品",
    catalogMode: "standard",
    seriesTypes: ["名石岩板"],
    coverImageUrl: "/size-cover.jpg",
    variants: [
      {
        code: "LV826L064",
        size: "800X2600mm",
        thickness: "9mm",
        process: "亮光",
        colorGroup: "金黄色",
      },
    ],
  },
  {
    slug: "plain-quartz",
    title: "Plain Quartz",
    category: "Slabs",
    catalogMode: "standard",
    seriesTypes: ["质感岩板"],
    coverImageUrl: "/quartz-cover.jpg",
    variants: [
      {
        code: "QT-001",
        size: "900X2700mm",
        thickness: "12mm",
        process: "哑光",
        colorGroup: "白色",
      },
    ],
  },
  {
    slug: "custom-surface-sample",
    title: "Custom Surface Sample",
    category: "Custom Products",
    catalogMode: "custom",
    customCapability: "custom-surface",
    seriesTypes: [],
    coverImageUrl: "/custom-cover.jpg",
    variants: [
      {
        code: "CUSTOM-001",
      },
    ],
  },
];

const customCapabilities: ProductCustomCapabilitySummary[] = [
  {
    key: "custom-surface",
    title: "Custom Surface",
    description: "Custom surface textures.",
    imageSrc: "/custom-section.jpg",
    sortOrder: 0,
    count: 1,
  },
];

test("legacy category aliases resolve to the canonical series filter", () => {
  const state = buildProductsPageState({
    customCapabilities,
    locale: "en",
    products,
    searchParams: { category: "quartz" },
  });

  expect(state.activeSection).toBe("series");
  expect(state.activeValue).toBe("质感岩板");
  expect(state.activeValueLabel).toBe("Texture Slab");
  expect(state.filteredProducts.map((product) => product.slug)).toEqual([
    "plain-quartz",
  ]);
});

test("free-text search scans the full directory when no catalog scope is set", () => {
  const state = buildProductsPageState({
    customCapabilities,
    locale: "en",
    products,
    searchParams: { q: "CUSTOM-001" },
  });

  expect(state.searchQuery).toBe("CUSTOM-001");
  expect(state.filteredProducts.map((product) => product.slug)).toEqual([
    "custom-surface-sample",
  ]);
});

test("free-text search stays inside the selected catalog scope", () => {
  const state = buildProductsPageState({
    customCapabilities,
    locale: "en",
    products,
    searchParams: {
      q: "CUSTOM-001",
      section: "series",
      value: "名石岩板",
    },
  });

  expect(state.activeSection).toBe("series");
  expect(state.activeValue).toBe("名石岩板");
  expect(state.filteredProducts).toEqual([]);
});
