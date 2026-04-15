import { getTranslations } from "next-intl/server";

import {
  getLocalizedProductValue,
  getProductImage,
  getProductVariants,
  getProductsDirectory,
} from "@/data/products";
import { getCommonCopy, getProductsPageCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import { PRODUCT_CATEGORY_SHOWCASES } from "../content/category-showcases";
import type { ProductDirectoryItem, ProductsPageData } from "../types";

function buildDirectoryItems(locale: AppLocale): Promise<ProductDirectoryItem[]> {
  return getProductsDirectory().then((products) =>
    products.map((product) => ({
      slug: product.slug,
      title: getLocalizedProductValue(product, locale, "title"),
      category:
        getLocalizedProductValue(product, locale, "category") ||
        product.seriesTypes?.[0] ||
        "",
      categorySlug: product.categorySlug,
      seriesTypes: product.seriesTypes ?? [],
      coverImageUrl: getProductImage(product),
      variants: getProductVariants(product).map((variant) => ({
        code: variant.code,
        size: variant.size,
        process: variant.process,
        colorGroup: variant.colorGroup,
      })),
    }))
  );
}

export async function getProductsPageData(
  locale: AppLocale
): Promise<ProductsPageData> {
  const [tNav, commonCopy, productsCopy, products] = await Promise.all([
    getTranslations({ locale, namespace: "Navigation" }),
    Promise.resolve(getCommonCopy(locale)),
    Promise.resolve(getProductsPageCopy(locale)),
    buildDirectoryItems(locale),
  ]);

  return {
    heroTitle: productsCopy.heroTitle,
    heroSubtitle: productsCopy.heroSubtitle,
    breadcrumbLabel: commonCopy.breadcrumbLabel,
    homeLabel: tNav("home"),
    collectionLabel: productsCopy.collectionLabel,
    collectionDescription: tNav("quartzDesc"),
    readMoreLabel: commonCopy.readMore,
    noProductsFoundLabel: commonCopy.noProductsFound,
    showcases: PRODUCT_CATEGORY_SHOWCASES.map((showcase) => ({
      slug: showcase.slug,
      title: tNav(showcase.titleKey),
      description: tNav(showcase.descriptionKey),
      imageSrc: showcase.imageSrc,
      background: showcase.background,
    })),
    directoryTitle: productsCopy.directoryTitle,
    directoryDescription: productsCopy.directoryDescription,
    filterLabels: {
      all: productsCopy.allFilter,
      size: productsCopy.sizeFilterLabel,
      process: productsCopy.processFilterLabel,
      seriesType: productsCopy.seriesTypeFilterLabel,
      colorGroup: productsCopy.colorGroupFilterLabel,
    },
    products,
  };
}
