import { expect, test } from "vitest";

import {
  buildProductTaxonomyCards,
  DEFAULT_PRODUCT_CATALOG_SECTION,
  filterCatalogProducts,
  PRODUCT_CATALOG_SECTION_KEYS,
  resolveProductCatalogSection,
  resolveProductCatalogValue,
} from "./productCatalog.ts";
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
    slug: "bai-dong-shi",
    title: "白洞石",
    category: "岩板产品",
    catalogMode: "standard",
    seriesTypes: ["洞石岩板"],
    coverImageUrl: "/series-cover.jpg",
    variants: [
      {
        code: "WR153N",
        size: "900X2700mm",
        thickness: "12mm",
        process: "哑光",
        colorGroup: "白色",
      },
    ],
  },
  {
    slug: "custom-surface-sample",
    title: "定制表面案例",
    category: "定制产品",
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
    title: "定制表面",
    description: "支持表面纹理与触感方案。",
    imageSrc: "/custom-section.jpg",
    sortOrder: 0,
    count: 1,
  },
];

test("resolveProductCatalogSection falls back to default when section is invalid", () => {
  expect(resolveProductCatalogSection({})).toBe(DEFAULT_PRODUCT_CATALOG_SECTION);
  expect(resolveProductCatalogSection({ section: "process" })).toBe("process");
  expect(resolveProductCatalogSection({ section: "invalid" })).toBe(DEFAULT_PRODUCT_CATALOG_SECTION);
});

test("buildProductTaxonomyCards only returns used cards for standard sections", () => {
  const thicknessCards = buildProductTaxonomyCards(
    products,
    "thickness",
    customCapabilities,
    "zh"
  );

  expect(thicknessCards.map((card) => card.label)).toEqual(["9mm", "12mm"]);
  expect(thicknessCards[0].count).toBe(1);
});

test("resolveProductCatalogValue only accepts values present in taxonomy cards", () => {
  const seriesCards = buildProductTaxonomyCards(
    products,
    "series",
    customCapabilities,
    "zh"
  );

  expect(resolveProductCatalogValue({ value: "洞石岩板" }, seriesCards)).toBe("洞石岩板");
  expect(resolveProductCatalogValue({ value: "木纹岩板" }, seriesCards)).toBe(null);
});

test("filterCatalogProducts separates standard and custom sections", () => {
  expect(filterCatalogProducts(products, "size", null).length).toBe(2);
  expect(filterCatalogProducts(products, "custom", null).length).toBe(1);
  expect(filterCatalogProducts(products, "custom", "custom-surface")[0]?.slug).toBe("custom-surface-sample");
  expect(filterCatalogProducts(products, "thickness", null).length).toBe(2);
});

test("sections without backing attribute data should not fall back to all standard products", () => {
  const noThicknessProducts = products.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      thickness: undefined,
    })),
  }));

  expect(filterCatalogProducts(noThicknessProducts, "thickness", null).length).toBe(0);
  expect(buildProductTaxonomyCards(noThicknessProducts, "thickness", customCapabilities, "zh")
      .length).toBe(0);
});

test("taxonomy card labels localize display values without changing filter values", () => {
  const seriesCards = buildProductTaxonomyCards(
    products,
    "series",
    customCapabilities,
    "es"
  );
  const processCards = buildProductTaxonomyCards(
    products,
    "process",
    customCapabilities,
    "ar"
  );

  expect(seriesCards.find((card) => card.value === "洞石岩板")?.label).toBe(
    "Losa travertino"
  );
  expect(processCards.find((card) => card.value === "亮光")?.label).toBe(
    "لامع"
  );
});

test("catalog navigation keeps the fixed six sections", () => {
  expect(PRODUCT_CATALOG_SECTION_KEYS).toEqual(["size", "series", "thickness", "color", "process", "custom"]);
});
