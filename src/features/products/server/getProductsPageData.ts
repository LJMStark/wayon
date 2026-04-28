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
import { getSeriesForCategory } from "@/data/navigationCategoryMap";
import { localizeProcess } from "@/data/productAttributeLabels";
import type { AppLocale } from "@/i18n/types";

import {
  buildProductTaxonomyCards,
  filterCatalogProducts,
  PRODUCT_CATALOG_NAV_TRANSLATION_KEYS,
  PRODUCT_CATALOG_SECTION_KEYS,
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
  locale: AppLocale,
  categoryFallback: string
): ProductDirectoryItem[] {
  return products.map((product) => {
    const variants = getProductVariants(product);

    return {
      slug: product.slug,
      title: getProductDisplayTitle(product, locale),
      category: getProductDisplayCategory(product, locale, categoryFallback),
      categorySlug: product.categorySlug,
      catalogMode: product.catalogMode ?? "standard",
      customCapability: product.customCapability,
      seriesTypes: product.seriesTypes ?? [],
      coverImageUrl: getProductImage(product),
      variants: variants.map((variant) => ({
        code: variant.code,
        size: variant.size,
        thickness: variant.thickness,
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
    variants.map((variant) => variant.thickness)
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
  const resolvedParams = applyLegacyCategoryAlias(searchParams);
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
    productsCopy.collectionLabel
  );
  const customCapabilities = buildCustomCapabilitySummaries(
    rawCustomCapabilities,
    products,
    locale
  );
  const activeSection = resolveProductCatalogSection(resolvedParams);
  const taxonomyCards = buildProductTaxonomyCards(
    products,
    activeSection,
    customCapabilities,
    locale
  );
  const activeValue = resolveProductCatalogValue(resolvedParams, taxonomyCards);
  const catalogFiltered = filterCatalogProducts(
    products,
    activeSection,
    activeValue
  );
  const searchQuery = readSingleParam(resolvedParams.q)?.trim().toLowerCase() ?? "";
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
    activeSection,
    activeValue,
    taxonomyCards,
    customCapabilities,
    products: filteredProducts,
  };
}
