import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProductTaxonomyCards,
  DEFAULT_PRODUCT_CATALOG_SECTION,
  filterCatalogProducts,
  PRODUCT_CATALOG_NAV_SECTIONS,
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
  assert.equal(resolveProductCatalogSection({}), DEFAULT_PRODUCT_CATALOG_SECTION);
  assert.equal(
    resolveProductCatalogSection({ section: "process" }),
    "process"
  );
  assert.equal(
    resolveProductCatalogSection({ section: "invalid" }),
    DEFAULT_PRODUCT_CATALOG_SECTION
  );
});

test("buildProductTaxonomyCards only returns used cards for standard sections", () => {
  const thicknessCards = buildProductTaxonomyCards(
    products,
    "thickness",
    customCapabilities
  );

  assert.deepEqual(
    thicknessCards.map((card) => card.label),
    ["9 毫米", "12 毫米"]
  );
  assert.equal(thicknessCards[0].count, 1);
});

test("resolveProductCatalogValue only accepts values present in taxonomy cards", () => {
  const seriesCards = buildProductTaxonomyCards(products, "series", customCapabilities);

  assert.equal(
    resolveProductCatalogValue({ value: "洞石岩板" }, seriesCards),
    "洞石岩板"
  );
  assert.equal(resolveProductCatalogValue({ value: "木纹岩板" }, seriesCards), null);
});

test("filterCatalogProducts separates standard and custom sections", () => {
  assert.equal(filterCatalogProducts(products, "size", null).length, 2);
  assert.equal(filterCatalogProducts(products, "custom", null).length, 1);
  assert.equal(
    filterCatalogProducts(products, "custom", "custom-surface")[0]?.slug,
    "custom-surface-sample"
  );
});

test("catalog navigation keeps the fixed six sections", () => {
  assert.deepEqual(
    PRODUCT_CATALOG_NAV_SECTIONS.map((section) => section.key),
    ["size", "series", "thickness", "color", "process", "custom"]
  );
});
