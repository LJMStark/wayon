"use client";

import { useMemo, useState } from "react";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";

import { Link } from "@/i18n/routing";

import type {
  ProductDetailMediaImage,
  ProductDetailPageData,
  ProductDetailVariantData,
} from "../types";

function ProductSpecificationCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="bg-white p-6">
      <span className="mb-2 block text-[10px] uppercase tracking-widest text-gray-400">
        {label}
      </span>
      <span className="font-medium text-[#1a1a1a]">{value}</span>
    </div>
  );
}

function MediaImageGrid({
  title,
  images,
}: {
  title: string;
  images: ProductDetailMediaImage[];
}): React.JSX.Element | null {
  if (images.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-[#1a1a1a]">{title}</h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {images.map((image) => (
          <div
            key={image.publicUrl}
            className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-neutral-100"
          >
            <Image
              src={image.publicUrl}
              alt={image.alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function getPrimaryImage(variant: ProductDetailVariantData): ProductDetailMediaImage | null {
  return (
    variant.spaceImages[0] ??
    variant.elementImages[0] ??
    variant.realImages[0] ??
    null
  );
}

function buildSpecifications(
  variant: ProductDetailVariantData,
  labels: ProductDetailPageData["labels"]
): Array<{ label: string; value: string }> {
  return [
    variant.showCode && variant.code
      ? { label: labels.productCode, value: variant.code }
      : null,
    variant.colorGroup
      ? { label: labels.colorGroup, value: variant.colorGroup }
      : null,
    variant.size ? { label: labels.size, value: variant.size } : null,
    variant.process ? { label: labels.process, value: variant.process } : null,
    variant.faceCount
      ? { label: labels.faceCount, value: variant.faceCount }
      : null,
    variant.facePatternNote
      ? { label: labels.facePatternNote, value: variant.facePatternNote }
      : null,
    variant.thickness
      ? { label: labels.thickness, value: variant.thickness }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);
}

export function ProductDetailPageView({
  backLabel,
  requestSampleLabel,
  title,
  category,
  seriesTypes,
  descriptionParagraphs,
  defaultVariantCode,
  variants,
  labels,
}: ProductDetailPageData): React.JSX.Element {
  const [selectedVariantCode, setSelectedVariantCode] = useState<string>(
    defaultVariantCode ?? variants[0]?.code ?? ""
  );

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.code === selectedVariantCode) ??
      variants[0] ??
      null,
    [selectedVariantCode, variants]
  );

  const primaryImage = selectedVariant ? getPrimaryImage(selectedVariant) : null;
  const specifications = selectedVariant
    ? buildSpecifications(selectedVariant, labels)
    : [];

  return (
    <div className="min-h-screen bg-white pt-24">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-12 inline-flex items-center text-sm font-medium uppercase tracking-wide text-gray-400 transition-colors hover:text-[#1a1a1a]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
        </Link>

        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden rounded-[32px] bg-[#f8f8f8]">
            {primaryImage ? (
              <div className="relative aspect-[4/5]">
                <Image
                  src={primaryImage.publicUrl}
                  alt={primaryImage.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>
            ) : (
              <div className="aspect-[4/5] bg-[linear-gradient(135deg,#f4f4f4,#ececec)]" />
            )}
          </div>

          <div className="flex flex-col pt-2">
            <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-gray-400">
              {category}
            </span>
            <h1 className="mb-6 text-4xl font-heading font-bold tracking-wide text-[#1a1a1a] md:text-5xl">
              {title}
            </h1>

            {seriesTypes.length > 0 ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {seriesTypes.map((seriesType) => (
                  <span
                    key={seriesType}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600"
                  >
                    {seriesType}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="prose prose-lg mb-8 font-light leading-relaxed text-gray-500">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {variants.length > 1 ? (
              <div className="mb-8">
                <label className="mb-3 block text-sm font-semibold text-[#1a1a1a]">
                  {labels.variantSelector}
                </label>
                <select
                  value={selectedVariantCode}
                  onChange={(event) => setSelectedVariantCode(event.target.value)}
                  className="w-full rounded-2xl border border-neutral-300 bg-white px-4 py-3 text-sm text-[#1a1a1a] outline-none transition-colors focus:border-[#0f2858]"
                >
                  {variants.map((variant) => (
                    <option key={variant.code} value={variant.code}>
                      {variant.optionLabel}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {specifications.length > 0 ? (
              <div className="mb-12 grid grid-cols-1 gap-px border border-gray-200 bg-gray-200 sm:grid-cols-2">
                {specifications.map((specification) => (
                  <ProductSpecificationCard
                    key={specification.label}
                    label={specification.label}
                    value={specification.value}
                  />
                ))}
              </div>
            ) : null}

            <div className="mt-auto">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-full bg-[#1a1a1a] px-12 py-5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gray-800 sm:w-auto"
              >
                {requestSampleLabel}
                <ArrowRight className="ml-3 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {selectedVariant ? (
          <div className="mt-20 space-y-14">
            <MediaImageGrid
              title={labels.elementImages}
              images={selectedVariant.elementImages}
            />
            <MediaImageGrid
              title={labels.spaceImages}
              images={selectedVariant.spaceImages}
            />
            <MediaImageGrid
              title={labels.realImages}
              images={selectedVariant.realImages}
            />

            {selectedVariant.videos.length > 0 ? (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-[#1a1a1a]">
                  {labels.videos}
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {selectedVariant.videos.map((video) => (
                    <div
                      key={video.publicUrl}
                      className="overflow-hidden rounded-[24px] border border-neutral-200 bg-black"
                    >
                      <video
                        controls
                        preload="metadata"
                        className="aspect-[4/3] w-full bg-black object-cover"
                        poster={video.posterUrl}
                      >
                        <source src={video.publicUrl} type={video.mimeType} />
                        {labels.videoFallback}
                      </video>
                      <div className="border-t border-white/10 bg-[#111111] px-4 py-3 text-sm text-white/80">
                        {video.title}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
