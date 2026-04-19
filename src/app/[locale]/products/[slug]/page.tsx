import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getLocalizedProductValue,
} from "@/data/products";

export const revalidate = 3600;
import { isPublishedProduct } from "@/features/products/model/productExposure";
import {
  formatCopy,
  getProductDetailPageCopy,
  getMetadataCopy,
} from "@/data/siteCopy";
import { ProductDetailPageView } from "@/features/products/components/ProductDetailPageView";
import { getProductDetailPageData } from "@/features/products/server/getProductDetailPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata } from "@/lib/metadata";
import { productJsonLd } from "@/lib/jsonLd";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<import("next").Metadata> {
  const { slug, locale } = await getLocaleParams(params);

  const product = await getProductBySlug(slug);

  if (!product || !isPublishedProduct(product)) {
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

  // Collect image URLs from all variants for JSON-LD (deduplicated, up to 10)
  const variantImages = pageData.variants
    .flatMap((v) => [
      ...v.elementImages.map((img) => img.publicUrl),
      ...v.spaceImages.map((img) => img.publicUrl),
      ...v.realImages.map((img) => img.publicUrl),
    ])
    .filter(Boolean)
    .slice(0, 10);

  const jsonLd = productJsonLd({
    name: pageData.title,
    description: pageData.descriptionParagraphs.join(" "),
    image: variantImages,
    category: pageData.category,
    url: `/products/${slug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailPageView {...pageData} />
    </>
  );
}
