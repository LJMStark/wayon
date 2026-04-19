import {
  getLocalizedProductValue,
  getProductVariants,
  type Product,
  type ProductMediaImage,
  type ProductMediaVideo,
} from "@/data/products";
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
  fallbackAlt: string
): ProductDetailMediaImage {
  return {
    publicUrl: image.publicUrl,
    alt: image.altZh || fallbackAlt,
  };
}

function buildMediaVideo(
  video: ProductMediaVideo,
  fallbackTitle: string
): ProductDetailMediaVideo {
  return {
    publicUrl: video.publicUrl,
    posterUrl: video.posterUrl,
    title: video.titleZh || fallbackTitle,
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
  const title = getLocalizedProductValue(product, locale, "title");
  const hasExplicitVariants = (product.variants?.length ?? 0) > 0;

  return getProductVariants(product).map((variant) => ({
    code: variant.code,
    showCode: hasExplicitVariants,
    optionLabel: buildVariantOptionLabel(
      variant.size,
      variant.thickness,
      variant.process,
      variant.code,
      hasExplicitVariants
    ),
    thickness: variant.thickness,
    size: variant.size,
    process: variant.process,
    colorGroup: variant.colorGroup,
    faceCount: variant.faceCount,
    facePatternNote: variant.facePatternNote,
    elementImages: variant.elementImages.map((image) =>
      buildMediaImage(image, `${title} 元素图`)
    ),
    spaceImages: variant.spaceImages.map((image) =>
      buildMediaImage(image, `${title} 空间图`)
    ),
    realImages: variant.realImages.map((image) =>
      buildMediaImage(image, `${title} 实拍图`)
    ),
    videos: variant.videos.map((video) => buildMediaVideo(video, `${title} 视频`)),
  }));
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
  const title = getLocalizedProductValue(product, locale, "title");
  const category =
    getLocalizedProductValue(product, locale, "category") ||
    copy.detail.categoryFallback;
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
    seriesTypes: product.seriesTypes ?? [],
    descriptionParagraphs: [
      formatCopy(copy.detail.description1, { title, category }),
      copy.detail.description2,
    ],
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
