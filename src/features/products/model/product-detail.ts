import {
  getProductDisplayCategory,
  getProductDisplayDescription,
  getProductDisplayTitle,
  getProductImage,
  getProductVariants,
  type Product,
  type ProductMediaImage,
  type ProductMediaVideo,
  type ProductVariant,
} from "@/data/products";
import {
  localizeColorGroup,
  localizeFaceCount,
  localizeFacePatternNote,
  localizeMediaAlt,
  localizeProcess,
  localizeSeriesType,
} from "@/data/productAttributeLabels";
import { formatCopy } from "@/data/siteCopy";
import { getTradeMediaContentType } from "@/features/products/lib/tradeMedia";
import {
  pickDefaultVariantCode,
  type DirectoryVariant,
} from "@/features/products/model/productDirectory";
import type { AppLocale } from "@/i18n/types";

import type {
  ProductDetailMediaImage,
  ProductDetailMediaVideo,
  ProductDetailPageData,
  ProductDetailVariantData,
  ProductRelatedProduct,
} from "../types";

const RELATED_PRODUCTS_LIMIT = 3;

type ProductDetailCopy = {
  categoryFallback: string;
  description1: string;
  description2: string;
  variantSelectorLabel: string;
  productCodeLabel: string;
  colorGroupLabel: string;
  sizeLabel: string;
  processLabel: string;
  faceCountLabel: string;
  facePatternNoteLabel: string;
  thicknessLabel: string;
  elementImagesTitle: string;
  spaceImagesTitle: string;
  realImagesTitle: string;
  videosTitle: string;
  videoFallback: string;
  relatedProductsTitle: string;
};

function buildMediaImage(
  image: ProductMediaImage,
  fallbackAlt: string,
  locale: AppLocale
): ProductDetailMediaImage {
  return {
    publicUrl: image.publicUrl,
    alt: locale === "zh" && image.altZh ? image.altZh : fallbackAlt,
  };
}

function buildMediaVideo(
  video: ProductMediaVideo,
  fallbackTitle: string,
  locale: AppLocale
): ProductDetailMediaVideo {
  return {
    publicUrl: video.publicUrl,
    posterUrl: video.posterUrl,
    title: locale === "zh" && video.titleZh ? video.titleZh : fallbackTitle,
    mimeType: getTradeMediaContentType(video.sourcePath) ?? undefined,
  };
}

function buildVariantOptionLabel(
  size: string | undefined,
  thickness: string | undefined,
  process: string | undefined,
  code: string,
  showCode: boolean
): string {
  const parts = [size, thickness, process, showCode ? code : null].filter(Boolean);

  return parts.join(" / ");
}

function buildVariantData(
  product: Product,
  locale: AppLocale
): ProductDetailVariantData[] {
  const title = getProductDisplayTitle(product, locale);
  const hasExplicitVariants = (product.variants?.length ?? 0) > 0;

  return getProductVariants(product).map((variant) => {
    const process = localizeProcess(variant.process, locale);

    return {
      code: variant.code,
      showCode: hasExplicitVariants,
      optionLabel: buildVariantOptionLabel(
        variant.size,
        variant.thickness,
        process,
        variant.code,
        hasExplicitVariants
      ),
      thickness: variant.thickness,
      size: variant.size,
      process,
      colorGroup: localizeColorGroup(variant.colorGroup, locale),
      faceCount: localizeFaceCount(variant.faceCount, locale),
      facePatternNote: localizeFacePatternNote(
        variant.facePatternNote,
        locale
      ),
      elementImages: variant.elementImages.map((image) =>
        buildMediaImage(image, localizeMediaAlt(title, "element", locale), locale)
      ),
      spaceImages: variant.spaceImages.map((image) =>
        buildMediaImage(image, localizeMediaAlt(title, "space", locale), locale)
      ),
      realImages: variant.realImages.map((image) =>
        buildMediaImage(image, localizeMediaAlt(title, "real", locale), locale)
      ),
      videos: variant.videos.map((video) =>
        buildMediaVideo(video, localizeMediaAlt(title, "video", locale), locale)
      ),
    };
  });
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function buildSummaryTags(
  variants: ProductVariant[],
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

function productCategoryKey(product: Product): string {
  return (
    product.categorySlug ||
    product.category?.en?.trim() ||
    product.category?.zh?.trim() ||
    product.category?.es?.trim() ||
    product.category?.ar?.trim() ||
    ""
  );
}

function countSharedValues(
  leftValues: Iterable<string | null | undefined>,
  rightValues: Iterable<string | null | undefined>
): number {
  const leftSet = new Set(uniqueStrings([...leftValues]));
  const rightSet = new Set(uniqueStrings([...rightValues]));

  return [...leftSet].filter((value) => rightSet.has(value)).length;
}

function countSharedVariantValues(
  left: Product,
  right: Product,
  selectValue: (variant: ProductVariant) => string | undefined
): number {
  return countSharedValues(
    getProductVariants(left).map(selectValue),
    getProductVariants(right).map(selectValue)
  );
}

function scoreRelatedProduct(source: Product, candidate: Product): number {
  let score = 0;
  const sourceCategory = productCategoryKey(source);
  const candidateCategory = productCategoryKey(candidate);

  if (
    source.catalogMode === "custom" &&
    source.customCapability &&
    source.customCapability === candidate.customCapability
  ) {
    score += 12;
  }

  if (sourceCategory && sourceCategory === candidateCategory) {
    score += 10;
  }

  score +=
    countSharedValues(source.seriesTypes ?? [], candidate.seriesTypes ?? []) * 5;
  score += countSharedVariantValues(
    source,
    candidate,
    (variant) => variant.size
  );
  score += countSharedVariantValues(
    source,
    candidate,
    (variant) => variant.thickness
  );
  score += countSharedVariantValues(
    source,
    candidate,
    (variant) => variant.process
  );
  score += countSharedVariantValues(
    source,
    candidate,
    (variant) => variant.colorGroup
  );

  return score;
}

function compareProductsByCatalogOrder(left: Product, right: Product): number {
  const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.slug.localeCompare(right.slug, "zh-Hans-CN");
}

function buildRelatedProducts(
  product: Product,
  relatedCandidates: Product[],
  locale: AppLocale,
  categoryFallback: string
): ProductRelatedProduct[] {
  return relatedCandidates
    .filter((candidate) => candidate.slug !== product.slug)
    .map((candidate) => ({
      product: candidate,
      score: scoreRelatedProduct(product, candidate),
    }))
    .filter(({ score }) => score > 0)
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return compareProductsByCatalogOrder(left.product, right.product);
    })
    .slice(0, RELATED_PRODUCTS_LIMIT)
    .map(({ product: relatedProduct }) => {
      const variants = getProductVariants(relatedProduct);

      return {
        slug: relatedProduct.slug,
        title: getProductDisplayTitle(relatedProduct, locale),
        category: getProductDisplayCategory(
          relatedProduct,
          locale,
          categoryFallback
        ),
        coverImageUrl: getProductImage(relatedProduct),
        summaryTags: buildSummaryTags(variants, locale),
      };
    });
}

export function buildProductDescriptionParagraphs(
  product: Product,
  locale: AppLocale,
  title: string,
  category: string,
  copy: Pick<ProductDetailCopy, "description1" | "description2">
): string[] {
  const productDescription = getProductDisplayDescription(product, locale);

  if (productDescription) {
    return productDescription
      .split(/\n{2,}|\r?\n/u)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }

  return [
    formatCopy(copy.description1, { title, category }),
    copy.description2,
  ].filter((paragraph) => paragraph.trim().length > 0);
}

export function buildProductMetadataDescription(
  product: Product,
  locale: AppLocale,
  title: string,
  category: string,
  detailCopy: Pick<ProductDetailCopy, "description1" | "description2">,
  metadataTemplate: string
): string {
  const description = buildProductDescriptionParagraphs(
    product,
    locale,
    title,
    category,
    detailCopy
  ).join(" ");

  return description || formatCopy(metadataTemplate, { title, category });
}

export function buildProductDetailPageData(
  product: Product,
  locale: AppLocale,
  copy: {
    backLabel: string;
    requestSampleLabel: string;
    detail: ProductDetailCopy;
  },
  relatedCandidates: Product[] = []
): ProductDetailPageData {
  const title = getProductDisplayTitle(product, locale);
  const category = getProductDisplayCategory(
    product,
    locale,
    copy.detail.categoryFallback
  );
  const rawVariants = getProductVariants(product);
  const variants = buildVariantData(product, locale);
  const defaultVariantCode = pickDefaultVariantCode(
    rawVariants.map<DirectoryVariant>((variant) => ({
      code: variant.code,
      size: variant.size,
      process: variant.process,
      colorGroup: variant.colorGroup,
      sortOrder: variant.sortOrder,
      elementImages: variant.elementImages,
      spaceImages: variant.spaceImages,
      realImages: variant.realImages,
      videos: variant.videos,
    }))
  );

  return {
    backLabel: copy.backLabel,
    requestSampleLabel: copy.requestSampleLabel,
    productSlug: product.slug,
    title,
    category,
    seriesTypes: (product.seriesTypes ?? []).map((seriesType) =>
      localizeSeriesType(seriesType, locale)
    ),
    descriptionParagraphs: buildProductDescriptionParagraphs(
      product,
      locale,
      title,
      category,
      copy.detail
    ),
    defaultVariantCode,
    variants,
    relatedProducts: buildRelatedProducts(
      product,
      relatedCandidates,
      locale,
      copy.detail.categoryFallback
    ),
    labels: {
      variantSelector: copy.detail.variantSelectorLabel,
      productCode: copy.detail.productCodeLabel,
      colorGroup: copy.detail.colorGroupLabel,
      size: copy.detail.sizeLabel,
      process: copy.detail.processLabel,
      faceCount: copy.detail.faceCountLabel,
      facePatternNote: copy.detail.facePatternNoteLabel,
      thickness: copy.detail.thicknessLabel,
      elementImages: copy.detail.elementImagesTitle,
      spaceImages: copy.detail.spaceImagesTitle,
      realImages: copy.detail.realImagesTitle,
      videos: copy.detail.videosTitle,
      videoFallback: copy.detail.videoFallback,
      relatedProducts: copy.detail.relatedProductsTitle,
    },
  };
}
