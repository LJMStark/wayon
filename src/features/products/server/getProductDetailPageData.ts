import { cache } from "react";
import { getTranslations } from "next-intl/server";

import { getProductBySlug } from "@/data/products";
import { isPublishedProduct } from "@/features/products/model/productExposure";
import { getCommonCopy, getProductDetailPageCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import { buildProductDetailPageData } from "../model/product-detail";
import type { ProductDetailPageData } from "../types";

const getProductRecord = cache(async function getProductRecord(slug: string) {
  return getProductBySlug(slug);
});

export const getProductDetailPageData = cache(async function getProductDetailPageData(
  locale: AppLocale,
  slug: string
): Promise<ProductDetailPageData | null> {
  const product = await getProductRecord(slug);

  if (!product || !isPublishedProduct(product)) {
    return null;
  }

  const [tHeader, commonCopy, detailCopy] = await Promise.all([
    getTranslations({ locale, namespace: "Header" }),
    Promise.resolve(getCommonCopy(locale)),
    Promise.resolve(getProductDetailPageCopy(locale)),
  ]);

  return buildProductDetailPageData(product, locale, {
    backLabel: tHeader("back"),
    requestSampleLabel: commonCopy.requestSample,
    detail: detailCopy,
  });
});
