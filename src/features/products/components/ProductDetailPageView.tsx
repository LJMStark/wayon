"use client";

import { useMemo, useState } from "react";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Link, useRouter } from "@/i18n/routing";

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

function MediaImageStack({
  images,
}: {
  images: ProductDetailMediaImage[];
}): React.JSX.Element | null {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col w-full">
      {images.map((image) => (
        // Plain <img>: trade-media assets have varied aspect ratios (portrait,
        // square, panoramic) and we don't know dimensions at build time.
        // next/image with fixed width/height would force a 16:9 box and distort
        // anything off-ratio.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={image.publicUrl}
          src={image.publicUrl}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block"
        />
      ))}
    </div>
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
    variant.faceCount
      ? { label: labels.faceCount, value: variant.faceCount }
      : null,
    variant.process ? { label: labels.process, value: variant.process } : null,
    variant.thickness
      ? { label: labels.thickness, value: variant.thickness }
      : null,
    variant.facePatternNote
      ? { label: labels.facePatternNote, value: variant.facePatternNote }
      : null,
  ].filter((item): item is { label: string; value: string } => item !== null);
}

export function ProductDetailPageView({
  backLabel,
  requestSampleLabel,
  productSlug,
  title,
  category,
  seriesTypes,
  descriptionParagraphs,
  defaultVariantCode,
  variants,
  labels,
}: ProductDetailPageData): React.JSX.Element {
  const router = useRouter();
  const [selectedVariantCode, setSelectedVariantCode] = useState<string>(
    defaultVariantCode ?? variants[0]?.code ?? ""
  );

  // "Request sample" is the primary CTA on every product page. The actual
  // sample-request pipeline is the inquiry form on /contact, so route the
  // user there with the product slug prefilled rather than firing a
  // disconnected modal or — worse — a dead button.
  const handleRequestSample = (): void => {
    router.push(`/contact?product=${encodeURIComponent(productSlug)}`);
  };

  const selectedVariant = useMemo(
    () =>
      variants.find((variant) => variant.code === selectedVariantCode) ??
      variants[0] ??
      null,
    [selectedVariantCode, variants]
  );


  const specifications = selectedVariant
    ? buildSpecifications(selectedVariant, labels)
    : [];

  return (
    <div className="min-h-screen bg-white pt-24 pb-24">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="mb-8 inline-flex items-center text-sm font-medium uppercase tracking-wide text-gray-400 transition-colors hover:text-[#1a1a1a]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {backLabel}
        </Link>

        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16">
          <span className="mb-4 block text-xs font-bold uppercase tracking-widest text-gray-400">
            {category}
          </span>
          <h1 className="mb-6 text-4xl font-heading font-bold tracking-wide text-[#1a1a1a] md:text-5xl">
            {title}
          </h1>

          {seriesTypes.length > 0 ? (
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {seriesTypes.map((seriesType) => (
                <span
                  key={seriesType}
                  className="rounded-full border border-neutral-200 px-4 py-1.5 text-sm text-neutral-600"
                >
                  {seriesType}
                </span>
              ))}
            </div>
          ) : null}

          {descriptionParagraphs.length > 0 ? (
            <div className="prose prose-lg mb-10 font-light leading-relaxed text-gray-500">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {variants.length > 1 ? (
            <div className="mb-10 w-full max-w-md mx-auto text-left">
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
            <div className="mb-12 w-full grid grid-cols-2 gap-px border border-gray-200 bg-gray-200 text-left sm:grid-cols-4">
              {specifications.map((specification) => (
                <ProductSpecificationCard
                  key={specification.label}
                  label={specification.label}
                  value={specification.value}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-4">
            <button
              type="button"
              onClick={handleRequestSample}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#1a1a1a] px-12 py-5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-gray-800 sm:w-auto"
            >
              {requestSampleLabel}
              <ArrowRight className="ml-3 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedVariant ? (
        <div className="w-full flex flex-col items-center">
          <MediaImageStack images={selectedVariant.elementImages} />
          <MediaImageStack images={selectedVariant.spaceImages} />
          <MediaImageStack images={selectedVariant.realImages} />

          {selectedVariant.videos.length > 0 ? (
            <div className="w-full flex flex-col">
              {selectedVariant.videos.map((video) => (
                <div key={video.publicUrl} className="w-full bg-black">
                  <video
                    controls
                    preload="metadata"
                    className="w-full h-auto object-contain max-h-screen"
                    poster={video.posterUrl}
                  >
                    <source src={video.publicUrl} type={video.mimeType} />
                    {labels.videoFallback}
                  </video>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
