import { getTranslations } from "next-intl/server";

import { getCommonCopy, getProductsPageCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import { PRODUCT_CATEGORY_SHOWCASES } from "../content/category-showcases";
import type { ProductsPageData } from "../types";

export async function getProductsPageData(
  locale: AppLocale
): Promise<ProductsPageData> {
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const commonCopy = getCommonCopy(locale);
  const productsCopy = getProductsPageCopy(locale);

  return {
    heroTitle: productsCopy.heroTitle,
    heroSubtitle: productsCopy.heroSubtitle,
    breadcrumbLabel: commonCopy.breadcrumbLabel,
    homeLabel: tNav("home"),
    collectionLabel: productsCopy.collectionLabel,
    collectionDescription: tNav("quartzDesc"),
    readMoreLabel: commonCopy.readMore,
    showcases: PRODUCT_CATEGORY_SHOWCASES.map((showcase) => ({
      slug: showcase.slug,
      title: tNav(showcase.titleKey),
      description: tNav(showcase.descriptionKey),
      imageSrc: showcase.imageSrc,
      background: showcase.background,
    })),
  };
}
