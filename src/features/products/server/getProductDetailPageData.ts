import { cache } from "react";
import { getTranslations } from "next-intl/server";

import { getProductBySlug, getProductsDirectory } from "@/data/products";
import { isPublishedProduct } from "@/features/products/model/productExposure";
import { getCommonCopy, getProductDetailPageCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import { buildProductDetailPageData } from "../model/product-detail";
import type { ProductDetailPageData } from "../types";

const getProductDirectoryRecords = cache(
  async function getProductDirectoryRecords() {
    return getProductsDirectory();
  }
);

export const getProductDetailPageData = cache(async function getProductDetailPageData(
  locale: AppLocale,
  slug: string
): Promise<ProductDetailPageData | null> {
  // The main product carries the full media (element/space/real images, videos)
  // and is fetched on its own; the directory is light (no heavy media) and only
  // feeds related-product scoring.
  const [product, products] = await Promise.all([
    getProductBySlug(slug),
    getProductDirectoryRecords(),
  ]);

  if (!product || !isPublishedProduct(product)) {
    return null;
  }

  const [tHeader, commonCopy, detailCopy] = await Promise.all([
    getTranslations({ locale, namespace: "Header" }),
    Promise.resolve(getCommonCopy(locale)),
    Promise.resolve(getProductDetailPageCopy(locale)),
  ]);

  return buildProductDetailPageData(
    product,
    locale,
    {
      backLabel: tHeader("back"),
      requestSampleLabel: commonCopy.requestSample,
      detail: detailCopy,
    },
    products
  );
});
