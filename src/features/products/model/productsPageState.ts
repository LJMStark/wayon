import { getSeriesForCategory } from "@/data/navigationCategoryMap";
import {
  localizeColorGroup,
  localizeProcess,
  localizeSeriesType,
} from "@/data/productAttributeLabels";
import type { AppLocale } from "@/i18n/types";

import {
  buildProductTaxonomyCards,
  filterCatalogProducts,
  PRODUCT_CATALOG_SECTION_KEYS,
  resolveProductCatalogSection,
  resolveProductCatalogValue,
} from "./productCatalog";
import type {
  ProductCatalogSectionKey,
  ProductCustomCapabilitySummary,
  ProductDirectoryItem,
  ProductTaxonomyCard,
} from "../types";

export type ProductsPageSearchParams = {
  section?: string | string[];
  value?: string | string[];
  // Legacy alias: previous CMS used `?category=quartz` to filter by family.
  // Inbound traffic from search engines and the next.config redirect chain
  // still arrives with this. We translate it through navigationCategoryMap so
  // the page always operates on the canonical section/value pair internally.
  category?: string | string[];
  // Free-text keyword from the Header search form. Filters the directory
  // by substring match against the localized title.
  q?: string | string[];
};

export type ProductsPageStateInput = {
  customCapabilities: ProductCustomCapabilitySummary[];
  locale: AppLocale;
  products: ProductDirectoryItem[];
  searchParams?: ProductsPageSearchParams;
};

export type ProductsPageState = {
  activeSection: ProductCatalogSectionKey;
  activeValue: string | null;
  activeValueLabel: string | null;
  filteredProducts: ProductDirectoryItem[];
  searchQuery: string;
  taxonomyCards: ProductTaxonomyCard[];
};

const CJK_TEXT_PATTERN = /[\u3400-\u9fff]/u;

function readSingleParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function applyLegacyCategoryAlias(
  params: ProductsPageSearchParams
): ProductsPageSearchParams {
  // Canonical params win — only fall back to the alias when the page
  // explicitly received neither section nor value.
  if (params.section || params.value) {
    return params;
  }

  const categorySlug = readSingleParam(params.category);
  if (!categorySlug) {
    return params;
  }

  const series = getSeriesForCategory(categorySlug);
  if (!series) {
    return params;
  }

  return { ...params, section: "series", value: series };
}

function formatSizeLabel(size: string): string {
  return size.replace(/X/g, " × ");
}

function safeRawCatalogLabel(
  value: string,
  locale: AppLocale
): string | null {
  return locale !== "zh" && CJK_TEXT_PATTERN.test(value) ? null : value;
}

function getActiveValueLabel({
  activeSection,
  activeValue,
  customCapabilities,
  locale,
  taxonomyCards,
}: {
  activeSection: ProductCatalogSectionKey;
  activeValue: string | null;
  customCapabilities: ProductCustomCapabilitySummary[];
  locale: AppLocale;
  taxonomyCards: ProductTaxonomyCard[];
}): string | null {
  if (!activeValue) {
    return null;
  }

  const taxonomyLabel = taxonomyCards.find(
    (card) => card.value === activeValue
  )?.label;

  if (taxonomyLabel) {
    return taxonomyLabel;
  }

  switch (activeSection) {
    case "size":
      return formatSizeLabel(activeValue);
    case "series":
      return (
        localizeSeriesType(activeValue, locale) ??
        safeRawCatalogLabel(activeValue, locale)
      );
    case "color":
      return (
        localizeColorGroup(activeValue, locale) ??
        safeRawCatalogLabel(activeValue, locale)
      );
    case "process":
      return (
        localizeProcess(activeValue, locale) ??
        safeRawCatalogLabel(activeValue, locale)
      );
    case "custom":
      return (
        customCapabilities.find((capability) => capability.key === activeValue)
          ?.title ?? safeRawCatalogLabel(activeValue, locale)
      );
    default:
      return safeRawCatalogLabel(activeValue, locale);
  }
}

function normalizeSearchValue(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function hasExplicitCatalogScope(params: ProductsPageSearchParams): boolean {
  const requestedSection = readSingleParam(params.section);
  const requestedValue = readSingleParam(params.value);

  return Boolean(
    requestedValue ||
      (requestedSection &&
        PRODUCT_CATALOG_SECTION_KEYS.includes(
          requestedSection as ProductCatalogSectionKey
        ))
  );
}

function productMatchesSearch(
  product: ProductDirectoryItem,
  searchQuery: string,
  locale: AppLocale
): boolean {
  const values = [
    product.title,
    product.category,
    product.slug,
    product.customCapability,
    ...product.seriesTypes,
    ...product.seriesTypes.map((value) => localizeSeriesType(value, locale)),
    ...(product.summaryTags ?? []),
    ...product.variants.flatMap((variant) => [
      variant.code,
      variant.size,
      variant.thickness,
      variant.process,
      variant.process ? localizeProcess(variant.process, locale) : undefined,
      variant.colorGroup,
      variant.colorGroup
        ? localizeColorGroup(variant.colorGroup, locale)
        : undefined,
    ]),
  ];

  return values.some((value) =>
    normalizeSearchValue(value).includes(searchQuery)
  );
}

export function buildProductsPageState({
  customCapabilities,
  locale,
  products,
  searchParams = {},
}: ProductsPageStateInput): ProductsPageState {
  const resolvedParams = applyLegacyCategoryAlias(searchParams);
  const activeSection = resolveProductCatalogSection(resolvedParams);
  const taxonomyCards = buildProductTaxonomyCards(
    products,
    activeSection,
    customCapabilities,
    locale
  );
  const activeValue = resolveProductCatalogValue(
    resolvedParams,
    taxonomyCards,
    activeSection
  );
  const activeValueLabel = getActiveValueLabel({
    activeSection,
    activeValue,
    customCapabilities,
    locale,
    taxonomyCards,
  });
  const catalogFiltered = filterCatalogProducts(
    products,
    activeSection,
    activeValue
  );
  const searchInput = readSingleParam(resolvedParams.q)?.trim() ?? "";
  const searchQuery = normalizeSearchValue(searchInput);
  const searchBase =
    searchQuery && !hasExplicitCatalogScope(resolvedParams)
      ? products
      : catalogFiltered;
  const filteredProducts = searchQuery
    ? searchBase.filter((product) =>
        productMatchesSearch(product, searchQuery, locale)
      )
    : catalogFiltered;

  return {
    activeSection,
    activeValue,
    activeValueLabel,
    filteredProducts,
    searchQuery: searchInput,
    taxonomyCards,
  };
}
