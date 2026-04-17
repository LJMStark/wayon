import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SERIES_TYPES,
  TRADE_SIZES,
  TRADE_THICKNESSES,
} from "../lib/tradeCatalog.ts";

import type {
  ProductCatalogNavSection,
  ProductCatalogSectionKey,
  ProductCustomCapabilitySummary,
  ProductDirectoryItem,
  ProductTaxonomyCard,
} from "../types";
import {
  matchesDirectoryFilters,
  type DirectoryProduct,
} from "./productDirectory.ts";

export const DEFAULT_PRODUCT_CATALOG_SECTION: ProductCatalogSectionKey = "size";

export const PRODUCT_CATALOG_NAV_SECTIONS: ProductCatalogNavSection[] = [
  { key: "size", label: "规格" },
  { key: "series", label: "石材" },
  { key: "thickness", label: "厚度" },
  { key: "color", label: "颜色" },
  { key: "process", label: "表面工艺" },
  { key: "custom", label: "定制产品" },
];

type CatalogSearchParams = {
  section?: string | string[];
  value?: string | string[];
};

function readSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function isCatalogSectionKey(value: string): value is ProductCatalogSectionKey {
  return PRODUCT_CATALOG_NAV_SECTIONS.some((section) => section.key === value);
}

function mapDirectoryProduct(product: ProductDirectoryItem): DirectoryProduct {
  return {
    slug: product.slug,
    seriesTypes: product.seriesTypes,
    coverImageUrl: product.coverImageUrl ?? null,
    catalogMode: product.catalogMode,
    customCapability: product.customCapability ?? null,
    variants: product.variants.map((variant) => ({
      code: variant.code,
      size: variant.size,
      thickness: variant.thickness,
      process: variant.process,
      colorGroup: variant.colorGroup,
      sortOrder: 0,
      elementImages: [],
      spaceImages: [],
      realImages: [],
      videos: [],
    })),
  };
}

function formatSizeLabel(size: string): string {
  return size.replace(/X/g, " × ");
}

function formatThicknessLabel(thickness: string): string {
  return thickness.replace("mm", " 毫米");
}

function getBaseProducts(
  products: ProductDirectoryItem[],
  section: ProductCatalogSectionKey
): ProductDirectoryItem[] {
  if (section === "custom") {
    return products.filter((product) => product.catalogMode === "custom");
  }

  return products.filter((product) => product.catalogMode !== "custom");
}

function buildOrderedCards(
  products: ProductDirectoryItem[],
  values: readonly string[],
  buildFilter: (value: string) => Parameters<typeof matchesDirectoryFilters>[1],
  formatLabel?: (value: string) => string
): ProductTaxonomyCard[] {
  const cards: Array<ProductTaxonomyCard | null> = values.map((value) => {
    const matching = products.filter((product) =>
      matchesDirectoryFilters(mapDirectoryProduct(product), buildFilter(value))
    );

    if (matching.length === 0) {
      return null;
    }

    return {
      key: value,
      value,
      label: formatLabel ? formatLabel(value) : value,
      imageSrc: matching[0]?.coverImageUrl,
      count: matching.length,
    };
  });

  return cards.filter((card): card is ProductTaxonomyCard => card !== null);
}

export function resolveProductCatalogSection(
  searchParams: CatalogSearchParams
): ProductCatalogSectionKey {
  const requested = readSingleValue(searchParams.section);

  if (!requested || !isCatalogSectionKey(requested)) {
    return DEFAULT_PRODUCT_CATALOG_SECTION;
  }

  return requested;
}

export function resolveProductCatalogValue(
  searchParams: CatalogSearchParams,
  taxonomyCards: ProductTaxonomyCard[]
): string | null {
  const value = readSingleValue(searchParams.value);

  if (!value) {
    return null;
  }

  return taxonomyCards.some((card) => card.value === value) ? value : null;
}

export function buildProductTaxonomyCards(
  products: ProductDirectoryItem[],
  section: ProductCatalogSectionKey,
  customCapabilities: ProductCustomCapabilitySummary[]
): ProductTaxonomyCard[] {
  const baseProducts = getBaseProducts(products, section);

  switch (section) {
    case "size":
      return buildOrderedCards(
        baseProducts,
        TRADE_SIZES,
        (value) => ({ size: value }),
        formatSizeLabel
      );
    case "series":
      return buildOrderedCards(baseProducts, TRADE_SERIES_TYPES, (value) => ({
        seriesType: value,
      }));
    case "thickness":
      return buildOrderedCards(
        baseProducts,
        TRADE_THICKNESSES,
        (value) => ({ thickness: value }),
        formatThicknessLabel
      );
    case "color":
      return buildOrderedCards(baseProducts, TRADE_COLOR_GROUPS, (value) => ({
        colorGroup: value,
      }));
    case "process":
      return buildOrderedCards(baseProducts, TRADE_PROCESSES, (value) => ({
        process: value,
      }));
    case "custom":
      return customCapabilities.map((capability) => ({
        key: capability.key,
        value: capability.key,
        label: capability.title,
        description: capability.description,
        imageSrc:
          capability.imageSrc ||
          baseProducts.find(
            (product) => product.customCapability === capability.key
          )?.coverImageUrl,
        count: capability.count,
      }));
    default:
      return [];
  }
}

export function filterCatalogProducts(
  products: ProductDirectoryItem[],
  section: ProductCatalogSectionKey,
  activeValue: string | null
): ProductDirectoryItem[] {
  const baseProducts = getBaseProducts(products, section);

  if (!activeValue) {
    return baseProducts;
  }

  return baseProducts.filter((product) =>
    matchesDirectoryFilters(mapDirectoryProduct(product), {
      size: section === "size" ? activeValue : null,
      seriesType: section === "series" ? activeValue : null,
      thickness: section === "thickness" ? activeValue : null,
      colorGroup: section === "color" ? activeValue : null,
      process: section === "process" ? activeValue : null,
      customCapability: section === "custom" ? activeValue : null,
    })
  );
}
