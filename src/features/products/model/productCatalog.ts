import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SERIES_TYPES,
  TRADE_SIZES,
  TRADE_THICKNESSES,
} from "../lib/tradeCatalog.ts";
import {
  localizeColorGroup,
  localizeProcess,
  localizeSeriesType,
} from "@/data/productAttributeLabels";
import type { AppLocale } from "@/i18n/types";

import type {
  ProductCatalogSectionKey,
  ProductCustomCapabilitySummary,
  ProductDirectoryItem,
  ProductTaxonomyCard,
} from "../types";
import {
  matchesDirectoryFilters,
  type DirectoryFilters,
  type DirectoryProduct,
} from "./productDirectory.ts";

export const DEFAULT_PRODUCT_CATALOG_SECTION: ProductCatalogSectionKey = "size";

export const PRODUCT_CATALOG_SECTION_KEYS: ProductCatalogSectionKey[] = [
  "size",
  "series",
  "thickness",
  "color",
  "process",
  "custom",
];

type CatalogNavTranslationKey =
  | "catalogSize"
  | "catalogSeries"
  | "catalogThickness"
  | "catalogColor"
  | "catalogProcess"
  | "catalogCustom";

export const PRODUCT_CATALOG_NAV_TRANSLATION_KEYS: Record<
  ProductCatalogSectionKey,
  CatalogNavTranslationKey
> = {
  size: "catalogSize",
  series: "catalogSeries",
  thickness: "catalogThickness",
  color: "catalogColor",
  process: "catalogProcess",
  custom: "catalogCustom",
};

type CatalogSearchParams = {
  section?: string | string[];
  value?: string | string[];
};

type ProductDirectoryVariant = ProductDirectoryItem["variants"][number];

function readSingleValue(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0]?.trim() || null;
  }

  return value?.trim() || null;
}

function isCatalogSectionKey(value: string): value is ProductCatalogSectionKey {
  return PRODUCT_CATALOG_SECTION_KEYS.includes(value as ProductCatalogSectionKey);
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

function getBaseProducts(
  products: ProductDirectoryItem[],
  section: ProductCatalogSectionKey
): ProductDirectoryItem[] {
  if (section === "custom") {
    return products.filter((product) => product.catalogMode === "custom");
  }

  return products.filter((product) => {
    if (product.catalogMode === "custom") {
      return false;
    }

    if (section === "series") {
      return product.seriesTypes.length > 0;
    }

    return product.variants.some((variant) =>
      hasVariantValueForSection(variant, section)
    );
  });
}

function hasVariantValueForSection(
  variant: ProductDirectoryVariant,
  section: ProductCatalogSectionKey
): boolean {
  switch (section) {
    case "size":
      return Boolean(variant.size);
    case "thickness":
      return Boolean(variant.thickness);
    case "color":
      return Boolean(variant.colorGroup);
    case "process":
      return Boolean(variant.process);
    default:
      return false;
  }
}

function buildOrderedCards(
  products: ProductDirectoryItem[],
  values: readonly string[],
  buildFilter: (value: string) => DirectoryFilters,
  formatLabel?: (value: string) => string
): ProductTaxonomyCard[] {
  const cards: ProductTaxonomyCard[] = [];

  for (const value of values) {
    const matching = products.filter((product) =>
      matchesDirectoryFilters(mapDirectoryProduct(product), buildFilter(value))
    );

    if (matching.length === 0) {
      continue;
    }

    cards.push({
      key: value,
      value,
      label: formatLabel ? formatLabel(value) : value,
      imageSrc: matching[0]?.coverImageUrl,
      count: matching.length,
    });
  }

  return cards;
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
  customCapabilities: ProductCustomCapabilitySummary[],
  locale: AppLocale
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
      return buildOrderedCards(
        baseProducts,
        TRADE_SERIES_TYPES,
        (value) => ({
          seriesType: value,
        }),
        (value) => localizeSeriesType(value, locale)
      );
    case "thickness":
      return buildOrderedCards(baseProducts, TRADE_THICKNESSES, (value) => ({
        thickness: value,
      }));
    case "color":
      return buildOrderedCards(
        baseProducts,
        TRADE_COLOR_GROUPS,
        (value) => ({
          colorGroup: value,
        }),
        (value) => localizeColorGroup(value, locale) ?? value
      );
    case "process":
      return buildOrderedCards(
        baseProducts,
        TRADE_PROCESSES,
        (value) => ({
          process: value,
        }),
        (value) => localizeProcess(value, locale) ?? value
      );
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

  const activeFilter = buildActiveCatalogFilter(section, activeValue);

  return baseProducts.filter((product) =>
    matchesDirectoryFilters(mapDirectoryProduct(product), activeFilter)
  );
}

function buildActiveCatalogFilter(
  section: ProductCatalogSectionKey,
  activeValue: string
): DirectoryFilters {
  switch (section) {
    case "size":
      return { size: activeValue };
    case "series":
      return { seriesType: activeValue };
    case "thickness":
      return { thickness: activeValue };
    case "color":
      return { colorGroup: activeValue };
    case "process":
      return { process: activeValue };
    case "custom":
      return { customCapability: activeValue };
    default:
      return {};
  }
}
