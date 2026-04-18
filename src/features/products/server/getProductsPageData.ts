import { getTranslations } from "next-intl/server";

import {
  getCustomCapabilities,
  getLocalizedProductValue,
  getProductImage,
  getProductVariants,
  getProductsDirectory,
} from "@/data/products";
import { getCommonCopy, getProductsPageCopy } from "@/data/siteCopy";
import { getSeriesForCategory } from "@/data/navigationCategoryMap";
import type { AppLocale } from "@/i18n/types";

import {
  buildProductTaxonomyCards,
  filterCatalogProducts,
  PRODUCT_CATALOG_NAV_SECTIONS,
  resolveProductCatalogSection,
  resolveProductCatalogValue,
} from "../model/productCatalog";
import { buildCustomCapabilitySummaries } from "../model/customCapabilitySummary";
import type {
  ProductDirectoryItem,
  ProductsPageData,
} from "../types";

type ProductsPageSearchParams = {
  section?: string | string[];
  value?: string | string[];
  // Legacy alias: previous CMS used `?category=quartz` to filter by family.
  // Inbound traffic from search engines and the next.config redirect chain
  // still arrives with this. We translate it server-side via
  // navigationCategoryMap so the page always operates on the canonical
  // section/value pair internally.
  category?: string | string[];
  // Free-text keyword from the Header search form. Filters the directory
  // by substring match against the localized title.
  q?: string | string[];
};

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

  return { section: "series", value: series };
}

function buildDirectoryItems(
  products: Awaited<ReturnType<typeof getProductsDirectory>>,
  locale: AppLocale
): ProductDirectoryItem[] {
  return products.map((product) => ({
    slug: product.slug,
    title: getLocalizedProductValue(product, locale, "title"),
    category:
      getLocalizedProductValue(product, locale, "category") ||
      product.seriesTypes?.[0] ||
      "",
    categorySlug: product.categorySlug,
    catalogMode: product.catalogMode ?? "standard",
    customCapability: product.customCapability,
    seriesTypes: product.seriesTypes ?? [],
    coverImageUrl: getProductImage(product),
    variants: getProductVariants(product).map((variant) => ({
      code: variant.code,
      size: variant.size,
      thickness: variant.thickness,
      process: variant.process,
      colorGroup: variant.colorGroup,
    })),
  }));
}

export async function getProductsPageData(
  locale: AppLocale,
  searchParams: ProductsPageSearchParams = {}
): Promise<ProductsPageData> {
  const resolvedParams = applyLegacyCategoryAlias(searchParams);
  const [tNav, commonCopy, productsCopy, rawProducts, rawCustomCapabilities] =
    await Promise.all([
    getTranslations({ locale, namespace: "Navigation" }),
    Promise.resolve(getCommonCopy(locale)),
    Promise.resolve(getProductsPageCopy(locale)),
    getProductsDirectory(),
    getCustomCapabilities(),
  ]);

  const products = buildDirectoryItems(rawProducts, locale);
  const customCapabilities = buildCustomCapabilitySummaries(
    rawCustomCapabilities,
    products,
    locale
  );
  const activeSection = resolveProductCatalogSection(resolvedParams);
  const taxonomyCards = buildProductTaxonomyCards(
    products,
    activeSection,
    customCapabilities
  );
  const activeValue = resolveProductCatalogValue(resolvedParams, taxonomyCards);
  const catalogFiltered = filterCatalogProducts(
    products,
    activeSection,
    activeValue
  );
  const searchQuery = readSingleParam(searchParams.q)?.trim().toLowerCase() ?? "";
  const filteredProducts = searchQuery
    ? catalogFiltered.filter((product) =>
        product.title.toLowerCase().includes(searchQuery)
      )
    : catalogFiltered;

  return {
    heroTitle: productsCopy.heroTitle,
    heroSubtitle: productsCopy.heroSubtitle,
    breadcrumbLabel: commonCopy.breadcrumbLabel,
    homeLabel: tNav("home"),
    collectionLabel: productsCopy.collectionLabel,
    collectionDescription: productsCopy.directoryDescription,
    allLabel: productsCopy.allFilter,
    readMoreLabel: commonCopy.readMore,
    noProductsFoundLabel: commonCopy.noProductsFound,
    directoryTitle: productsCopy.directoryTitle,
    directoryDescription: productsCopy.directoryDescription,
    navSections: PRODUCT_CATALOG_NAV_SECTIONS,
    activeSection,
    activeValue,
    taxonomyCards,
    customCapabilities,
    products: filteredProducts,
  };
}
