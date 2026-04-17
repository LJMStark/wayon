import { getTranslations } from "next-intl/server";

import {
  getCustomCapabilities,
  getLocalizedProductValue,
  getProductImage,
  getProductVariants,
  getProductsDirectory,
} from "@/data/products";
import { getCommonCopy, getProductsPageCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import {
  buildProductTaxonomyCards,
  filterCatalogProducts,
  PRODUCT_CATALOG_NAV_SECTIONS,
  resolveProductCatalogSection,
  resolveProductCatalogValue,
} from "../model/productCatalog";
import type {
  ProductCustomCapabilitySummary,
  ProductDirectoryItem,
  ProductsPageData,
} from "../types";

type ProductsPageSearchParams = {
  section?: string | string[];
  value?: string | string[];
};

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

function buildCustomCapabilities(
  capabilities: Awaited<ReturnType<typeof getCustomCapabilities>>,
  products: ProductDirectoryItem[],
  locale: AppLocale
): ProductCustomCapabilitySummary[] {
  return capabilities.map((capability) => ({
    key: capability.capabilityKey,
    title:
      capability.title?.[locale] ||
      capability.title?.zh ||
      capability.title?.en ||
      capability.capabilityKey,
    description:
      capability.description?.[locale] ||
      capability.description?.zh ||
      capability.description?.en,
    imageSrc: capability.coverImageUrl,
    sortOrder: capability.sortOrder ?? 0,
    count: products.filter(
      (product) => product.customCapability === capability.capabilityKey
    ).length,
  }));
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

  const products = buildDirectoryItems(rawProducts, locale);
  const customCapabilities = buildCustomCapabilities(
    rawCustomCapabilities,
    products,
    locale
  );
  const activeSection = resolveProductCatalogSection(searchParams);
  const taxonomyCards = buildProductTaxonomyCards(
    products,
    activeSection,
    customCapabilities
  );
  const activeValue = resolveProductCatalogValue(searchParams, taxonomyCards);
  const filteredProducts = filterCatalogProducts(
    products,
    activeSection,
    activeValue
  );

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
