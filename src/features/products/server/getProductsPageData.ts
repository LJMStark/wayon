import { getTranslations } from "next-intl/server";

import {
  getCustomCapabilities,
  getProductDisplayCategory,
  getProductDisplayTitle,
  getProductImage,
  getProductVariants,
  getProductsDirectory,
} from "@/data/products";
import { getCommonCopy, getProductsPageCopy } from "@/data/siteCopy";
import {
  localizeProcess,
  localizeSeriesType,
} from "@/data/productAttributeLabels";
import type { AppLocale } from "@/i18n/types";

import {
  PRODUCT_CATALOG_NAV_TRANSLATION_KEYS,
  PRODUCT_CATALOG_SECTION_KEYS,
} from "../model/productCatalog";
import { buildCustomCapabilitySummaries } from "../model/customCapabilitySummary";
import {
  buildProductsPageState,
  type ProductsPageSearchParams,
} from "../model/productsPageState";
import type {
  ProductCatalogSectionKey,
  ProductDirectoryItem,
  ProductsPageData,
} from "../types";

const SIDEBAR_SERIES_VALUE_LINKS = ["特惠系列"] as const;

function buildProductsHref(
  section: ProductCatalogSectionKey,
  locale: AppLocale,
  value?: string
): string {
  const params = new URLSearchParams();
  params.set("section", section);

  if (value) {
    params.set("value", value);
  }

  return `/${locale}/products?${params.toString()}`;
}

function buildDirectoryItems(
  products: Awaited<ReturnType<typeof getProductsDirectory>>,
  locale: AppLocale,
  categoryFallback: string
): ProductDirectoryItem[] {
  return products.map((product) => {
    const variants = getProductVariants(product);

    return {
      slug: product.slug,
      title: getProductDisplayTitle(product, locale),
      category: getProductDisplayCategory(product, locale, categoryFallback),
      catalogMode: product.catalogMode ?? "standard",
      customCapability: product.customCapability,
      seriesTypes: product.seriesTypes ?? [],
      coverImageUrl: getProductImage(product),
      variants: variants.map((variant) => ({
        code: variant.code,
        size: variant.size,
        thickness: variant.thickness,
        thicknessCustom: variant.thicknessCustom,
        process: variant.process,
        colorGroup: variant.colorGroup,
      })),
      summaryTags: buildSummaryTags(variants, locale),
    };
  });
}

function buildSummaryTags(
  variants: ReturnType<typeof getProductVariants>,
  locale: AppLocale
): string[] {
  const sizes = uniqueStrings(variants.map((variant) => variant.size));
  const thicknesses = uniqueStrings(
    variants.map((variant) =>
      variant.thickness === "custom" ? variant.thicknessCustom : variant.thickness
    )
  );
  const processes = uniqueStrings(
    variants.map((variant) =>
      variant.process ? localizeProcess(variant.process, locale) : undefined
    )
  );

  return [...sizes, ...thicknesses, ...processes].slice(0, 4);
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

export async function getProductsPageData(
  locale: AppLocale,
  searchParams: ProductsPageSearchParams = {}
): Promise<ProductsPageData> {
  const [tNav, commonCopy, productsCopy, rawProducts, rawCustomCapabilities] =
    await Promise.all([
      getTranslations({ locale, namespace: "Navigation" }),
      Promise.resolve(getCommonCopy(locale)),
      Promise.resolve(getProductsPageCopy(locale)),
      getProductsDirectory(),
      getCustomCapabilities(),
    ]);

  const products = buildDirectoryItems(
    rawProducts,
    locale,
    productsCopy.collectionLabel || productsCopy.heroTitle
  );
  const customCapabilities = buildCustomCapabilitySummaries(
    rawCustomCapabilities,
    products,
    locale
  );
  const {
    activeSection,
    activeValue,
    activeValueLabel,
    filteredProducts,
    searchQuery,
    taxonomyCards,
  } = buildProductsPageState({
    customCapabilities,
    locale,
    products,
    searchParams,
  });

  return {
    locale,
    heroTitle: productsCopy.heroTitle,
    heroSubtitle: productsCopy.heroSubtitle,
    breadcrumbLabel: commonCopy.breadcrumbLabel,
    homeLabel: tNav("home"),
    collectionLabel: productsCopy.collectionLabel,
    collectionDescription: productsCopy.directoryDescription,
    allLabel: productsCopy.allFilter,
    noProductsFoundLabel: commonCopy.noProductsFound,
    emptyTaxonomyTemplate: commonCopy.emptyTaxonomy,
    backToCategoriesLabel: productsCopy.backToCategories,
    productCountTemplate: productsCopy.productCount,
    directoryTitle: productsCopy.directoryTitle,
    directoryDescription: productsCopy.directoryDescription,
    navSections: PRODUCT_CATALOG_SECTION_KEYS.map((key) => ({
      key,
      label: tNav(PRODUCT_CATALOG_NAV_TRANSLATION_KEYS[key]),
    })),
    seriesQuickLinks: SIDEBAR_SERIES_VALUE_LINKS.map((value) => ({
      key: value,
      value,
      label: localizeSeriesType(value, locale) ?? "",
      href: buildProductsHref("series", locale, value),
    })),
    activeSection,
    activeValue,
    activeValueLabel,
    taxonomyCards,
    customCapabilities,
    allProducts: products,
    products: filteredProducts,
    searchQuery,
    searchResultsLabel: productsCopy.searchResultsLabel,
    searchResultsForTemplate: productsCopy.searchResultsFor,
  };
}
