"use client";

import { useMemo, useState } from "react";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { Link, useRouter } from "@/i18n/routing";

import type {
  ProductDetailMediaImage,
  ProductDetailMediaVideo,
  ProductDetailPageData,
  ProductDetailVariantData,
} from "../types";

function ProductSpecificationItem({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="flex flex-col items-center text-center px-4 py-2">
      <span className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[color:var(--muted-foreground)]">
        {label}
      </span>
      <span className="text-[15px] font-light leading-relaxed text-[#242424]">
        {value}
      </span>
    </div>
  );
}

function MediaSectionHeader({
  label,
}: {
  label: string;
}): React.JSX.Element {
  return (
    <div className="mb-10 flex flex-col items-center text-center">
      <span className="mb-3 h-px w-10 bg-[color:var(--border)]" aria-hidden />
      <h2 className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#242424]">
        {label}
      </h2>
    </div>
  );
}

function MediaImageGrid({
  images,
}: {
  images: ProductDetailMediaImage[];
}): React.JSX.Element | null {
  if (images.length === 0) {
    return null;
  }

  // Single image: center it in a constrained column instead of letting CSS
  // columns shove it into the left half with an empty right column.
  if (images.length === 1) {
    const image = images[0];
    return (
      <div className="mx-auto max-w-3xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.publicUrl}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="block w-full h-auto"
        />
      </div>
    );
  }

  // Multiple images: CSS columns produce a natural masonry flow for images
  // of unknown, varied aspect ratios — far cleaner than CSS grid, which
  // would force every row to take the tallest item's height.
  return (
    <div className="columns-1 gap-6 md:columns-2 [&>*]:mb-6 [&>*]:break-inside-avoid">
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
          className="block w-full h-auto"
        />
      ))}
    </div>
  );
}

function MediaVideoGrid({
  videos,
  fallbackLabel,
}: {
  videos: ProductDetailMediaVideo[];
  fallbackLabel: string;
}): React.JSX.Element | null {
  if (videos.length === 0) {
    return null;
  }

  // Single video: center it in a constrained column rather than leaving an
  // empty second grid cell.
  if (videos.length === 1) {
    const video = videos[0];
    return (
      <div className="mx-auto max-w-3xl bg-black">
        <video
          controls
          preload="metadata"
          className="block w-full h-auto"
          poster={video.posterUrl}
        >
          <source src={video.publicUrl} type={video.mimeType} />
          {fallbackLabel}
        </video>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {videos.map((video) => (
        <div key={video.publicUrl} className="bg-black">
          <video
            controls
            preload="metadata"
            className="block w-full h-auto"
            poster={video.posterUrl}
          >
            <source src={video.publicUrl} type={video.mimeType} />
            {fallbackLabel}
          </video>
        </div>
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

  // Hero: first element image of the active variant. Fall back to the first
  // available image of any kind if no element image exists, so the hero
  // composition still reads as the product, not a blank rectangle.
  const heroFromElement = selectedVariant?.elementImages[0] ?? null;
  const heroImage =
    heroFromElement ??
    selectedVariant?.spaceImages[0] ??
    selectedVariant?.realImages[0] ??
    null;

  // The hero already shows the first element image — render the rest in the
  // contained gallery below to avoid duplication.
  const remainingElementImages = heroFromElement
    ? (selectedVariant?.elementImages ?? []).slice(1)
    : (selectedVariant?.elementImages ?? []);

  return (
    <div className="min-h-screen bg-white pb-24">
      {heroImage ? (
        // Negative margin pulls the hero up behind the fixed header, so the
        // image reads as a true full-bleed cover (extending to the very top
        // of the viewport) instead of starting below an 80px white bar.
        // Height = 100vh keeps the visible area roughly one full screen even
        // after the header overlays the top strip.
        <section className="relative -mt-[var(--header-height)] w-full h-screen min-h-[640px] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage.publicUrl}
            alt={heroImage.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="relative z-10 flex h-full flex-col justify-center pt-[var(--header-height)] ps-[32%]">
            <div className="w-fit max-w-sm bg-white/35 px-10 py-10 backdrop-blur-md md:max-w-md md:px-14 md:py-12">
              <span className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.36em] text-black/55">
                {category}
              </span>
              <h1 className="font-heading text-[2.2rem] font-light tracking-[-0.015em] text-[#1a1a1a] md:text-[3rem]">
                {title}
              </h1>
              {seriesTypes.length > 0 ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  {seriesTypes.map((seriesType) => (
                    <span
                      key={seriesType}
                      className="border border-black/25 px-4 py-1.5 text-[11px] uppercase tracking-[0.18em] text-black/70"
                    >
                      {seriesType}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <div className="wayon-container-wide pt-10">
        <Link
          href="/products"
          className="mb-10 inline-flex items-center text-[12px] font-medium uppercase tracking-[0.22em] text-[color:var(--muted-foreground)] transition-colors duration-200 hover:text-[color:var(--primary)]"
        >
          <ArrowLeft className="me-2 h-4 w-4 rtl:rotate-180" /> {backLabel}
        </Link>

        {!heroImage ? (
          <div className="mb-12 flex flex-col items-center text-center">
            <span className="wayon-eyebrow mb-5">{category}</span>
            <h1 className="mb-4 font-heading text-[2.4rem] font-light tracking-[-0.015em] text-[#242424] md:text-[3.2rem]">
              {title}
            </h1>
          </div>
        ) : null}

        {descriptionParagraphs.length > 0 ? (
          <div className="mx-auto mb-12 max-w-3xl text-center font-light leading-[1.85] text-[color:var(--muted-foreground)]">
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {variants.length > 1 ? (
          <div className="mx-auto mb-12 w-full max-w-md">
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
          <div
            className="mx-auto mb-14 grid w-full max-w-4xl grid-cols-2 gap-y-6 border-y border-[color:var(--border)] py-10 sm:grid-cols-3 md:grid-cols-4"
          >
            {specifications.map((specification) => (
              <ProductSpecificationItem
                key={specification.label}
                label={specification.label}
                value={specification.value}
              />
            ))}
          </div>
        ) : null}

        <div className="mb-20 flex justify-center">
          <button
            type="button"
            onClick={handleRequestSample}
            className="wayon-cta-primary group"
          >
            {requestSampleLabel}
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </button>
        </div>

        {selectedVariant ? (
          <div className="flex flex-col gap-20">
            {remainingElementImages.length > 0 ? (
              <section>
                <MediaSectionHeader label={labels.elementImages} />
                <MediaImageGrid images={remainingElementImages} />
              </section>
            ) : null}

            {selectedVariant.spaceImages.length > 0 ? (
              <section>
                <MediaSectionHeader label={labels.spaceImages} />
                <MediaImageGrid images={selectedVariant.spaceImages} />
              </section>
            ) : null}

            {selectedVariant.realImages.length > 0 ? (
              <section>
                <MediaSectionHeader label={labels.realImages} />
                <MediaImageGrid images={selectedVariant.realImages} />
              </section>
            ) : null}

            {selectedVariant.videos.length > 0 ? (
              <section>
                <MediaSectionHeader label={labels.videos} />
                <MediaVideoGrid
                  videos={selectedVariant.videos}
                  fallbackLabel={labels.videoFallback}
                />
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
