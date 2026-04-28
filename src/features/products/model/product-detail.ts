import {
  getProductDisplayCategory,
  getProductDisplayDescription,
  getProductDisplayTitle,
  getProductVariants,
  type Product,
  type ProductMediaImage,
  type ProductMediaVideo,
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
} from "../types";

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
  }
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
    },
  };
}
