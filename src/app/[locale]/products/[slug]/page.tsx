import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getLocalizedProductValue,
} from "@/data/products";
import {
  formatCopy,
  getProductDetailPageCopy,
  getMetadataCopy,
} from "@/data/siteCopy";
import { ProductDetailPageView } from "@/features/products/components/ProductDetailPageView";
import { getProductDetailPageData } from "@/features/products/server/getProductDetailPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<import("next").Metadata> {
  const { slug, locale } = await getLocaleParams(params);

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const metadataCopy = getMetadataCopy(locale).productDetail;
  const detailCopy = getProductDetailPageCopy(locale);
  const localizedTitle = getLocalizedProductValue(product, locale, "title");
  const localizedCategory =
    getLocalizedProductValue(product, locale, "category") ||
    detailCopy.categoryFallback;

  return buildPageMetadata({
    locale,
    title: formatCopy(metadataCopy.title, { title: localizedTitle }),
    description: formatCopy(metadataCopy.description, {
      title: localizedTitle,
      category: localizedCategory,
    }),
    path: `/products/${slug}`,
  });
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<React.JSX.Element> {
  const { slug, locale } = await getLocaleParams(params);
  const pageData = await getProductDetailPageData(locale, slug);

  if (!pageData) {
    notFound();
  }

  return <ProductDetailPageView {...pageData} />;
}
