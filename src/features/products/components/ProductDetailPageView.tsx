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
      <div className="wayon-container-wide py-12">
        <Link
          href="/products"
          className="mb-12 inline-flex items-center text-[12px] font-medium uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] transition-colors duration-200 hover:text-[color:var(--primary)]"
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" /> {backLabel}
        </Link>

        <div className="mx-auto mb-16 flex max-w-4xl flex-col items-center text-center">
          <span className="wayon-eyebrow mb-5">{category}</span>
          <h1 className="mb-7 font-heading text-[2.4rem] font-light tracking-[-0.015em] text-[#242424] md:text-[3.2rem]">
            {title}
          </h1>

          {seriesTypes.length > 0 ? (
            <div className="mb-9 flex flex-wrap justify-center gap-2">
              {seriesTypes.map((seriesType) => (
                <span
                  key={seriesType}
                  className="border border-[color:var(--border)] px-4 py-1.5 text-[12px] uppercase tracking-[0.14em] text-[color:var(--muted-foreground)]"
                >
                  {seriesType}
                </span>
              ))}
            </div>
          ) : null}

          {descriptionParagraphs.length > 0 ? (
            <div className="prose prose-lg mb-10 font-light leading-[1.85] text-[color:var(--muted-foreground)]">
              {descriptionParagraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          ) : null}

          {variants.length > 1 ? (
            <div className="mx-auto mb-10 w-full max-w-md text-start">
              <label className="wayon-eyebrow mb-3 block text-[color:var(--foreground)]">
                {labels.variantSelector}
              </label>
              <select
                value={selectedVariantCode}
                onChange={(event) => setSelectedVariantCode(event.target.value)}
                className="w-full border border-[color:var(--border)] bg-white px-4 py-3 text-sm text-[#242424] outline-none transition-colors duration-200 focus:border-[color:var(--primary)]"
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
            <div className="mb-12 grid w-full grid-cols-2 gap-px border border-[color:var(--border)] bg-[color:var(--border)] text-start sm:grid-cols-4">
              {specifications.map((specification) => (
                <ProductSpecificationCard
                  key={specification.label}
                  label={specification.label}
                  value={specification.value}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-2">
            <button
              type="button"
              onClick={handleRequestSample}
              className="wayon-cta-primary group"
            >
              {requestSampleLabel}
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
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
