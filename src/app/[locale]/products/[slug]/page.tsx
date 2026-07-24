import { notFound } from "next/navigation";

import {
  getProductBySlug,
  getProductDisplayCategory,
  getProductDisplayTitle,
} from "@/data/products";
import { isPublishedProduct } from "@/features/products/model/productExposure";
import { buildProductMetadataDescription } from "@/features/products/model/product-detail";
import {
  formatCopy,
  getProductDetailPageCopy,
  getMetadataCopy,
} from "@/data/siteCopy";
import { ProductDetailPageView } from "@/features/products/components/ProductDetailPageView";
import { getProductDetailPageData } from "@/features/products/server/getProductDetailPageData";
import { getLocaleParams } from "@/features/shared/server/locale";
import { buildPageMetadata, normalizeMetadataPath } from "@/lib/metadata";
import { productJsonLd, productBreadcrumbJsonLd } from "@/lib/jsonLd";

// The catalog contains thousands of products across four locales. Returning an
// empty list keeps deploys bounded; dynamicParams defaults to true, so each
// detail page is generated on first request and then revalidated hourly.
export function generateStaticParams(): { slug: string }[] {
  return [];
}

export const revalidate = 3600;

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
  const localizedTitle = getProductDisplayTitle(product, locale);
  const localizedCategory = getProductDisplayCategory(
    product,
    locale,
    detailCopy.categoryFallback
  );
  const description = buildProductMetadataDescription(
    product,
    locale,
    localizedTitle,
    localizedCategory,
    detailCopy,
    metadataCopy.description
  );

  // Pick the most representative product image for og:image and twitter card.
  // Order: product cover → first element image → first real image → fall back
  // to the brand default inside buildPageMetadata. The image arrays are typed
  // as non-optional, but the data comes from Payload via hydration where the
  // mapping uses `(raw.elementImages ?? []).map(...)`; we still guard with
  // `?.[0]` so a future schema/cache anomaly returning `null` cannot 500 the
  // route.
  const firstVariant = product.variants?.[0];
  const ogImage =
    product.coverImageUrl ??
    product.imageUrl ??
    firstVariant?.elementImages?.[0]?.publicUrl ??
    firstVariant?.realImages?.[0]?.publicUrl ??
    undefined;

  return buildPageMetadata({
    locale,
    title: formatCopy(metadataCopy.title, { title: localizedTitle }),
    description,
    path: `/products/${slug}`,
    image: ogImage,
    imageAlt: localizedTitle,
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

  const productUrl = normalizeMetadataPath(locale, `/products/${slug}`);
  const jsonLd = productJsonLd({
    name: pageData.title,
    description: pageData.descriptionParagraphs.join(" "),
    image: variantImages,
    category: pageData.category,
    url: productUrl,
  });
  const breadcrumbLd = productBreadcrumbJsonLd(locale, pageData.title, productUrl);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd).replace(/</g, "\\u003c") }}
      />
      <ProductDetailPageView {...pageData} />
    </>
  );
}
