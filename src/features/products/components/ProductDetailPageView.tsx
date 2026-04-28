"use client";

import { useEffect, useRef, useState, useMemo } from "react";

import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import { Link } from "@/i18n/routing";

import type {
  ProductDetailMediaImage,
  ProductDetailMediaVideo,
  ProductDetailPageData,
  ProductDetailVariantData,
  ProductRelatedProduct,
} from "../types";

type ProductSpecification = {
  label: string;
  value: string;
};

// IntersectionObserver fade-up — GPU-safe (transform + opacity only)
function useFadeIn(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

// Double-Bezel specification card — outer shell → inner core
function SpecCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl bg-[#F5F2EC] p-[6px] ring-1 ring-black/[0.06]">
      <div className="flex min-h-[96px] flex-col items-center justify-center gap-2.5 rounded-[calc(1rem-0.375rem)] bg-white px-4 py-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#888888]">
          {label}
        </span>
        <span className="text-[13px] font-normal leading-relaxed text-[#1a1a1a]">
          {value}
        </span>
      </div>
    </div>
  );
}

// Section header: eyebrow pill + gradient rule line
function SectionHeader({ label }: { label: string }): React.JSX.Element {
  const [ref, visible] = useFadeIn();

  return (
    <div
      ref={ref}
      className={`mb-14 flex items-center gap-5 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <span className="shrink-0 rounded-full bg-[#002b50]/[0.05] px-4 py-1.5 text-[9px] font-semibold uppercase tracking-[0.26em] text-[#002b50]/60 ring-1 ring-[#002b50]/10">
        {label}
      </span>
      <div className="h-px flex-1 bg-gradient-to-r from-[#002b50]/12 to-transparent" />
    </div>
  );
}

// Image grid — rounded corners + hover scale (transform only)
function MediaImageGrid({
  images,
}: {
  images: ProductDetailMediaImage[];
}): React.JSX.Element | null {
  if (images.length === 0) return null;

  if (images.length === 1) {
    const image = images[0];
    return (
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl ring-1 ring-black/[0.06]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.publicUrl}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 md:columns-2 [&>*]:mb-5 [&>*]:break-inside-avoid">
      {images.map((image) => (
        <div
          key={image.publicUrl}
          className="group overflow-hidden rounded-xl ring-1 ring-black/[0.06]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.publicUrl}
            alt={image.alt}
            loading="lazy"
            decoding="async"
            className="block h-auto w-full transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.02]"
          />
        </div>
      ))}
    </div>
  );
}

// Video grid — bezel outer shell, black inner
function MediaVideoGrid({
  videos,
  fallbackLabel,
}: {
  videos: ProductDetailMediaVideo[];
  fallbackLabel: string;
}): React.JSX.Element | null {
  if (videos.length === 0) return null;

  if (videos.length === 1) {
    const video = videos[0];
    return (
      <div className="mx-auto max-w-3xl rounded-2xl bg-[#F5F2EC] p-[6px] ring-1 ring-black/[0.06]">
        <div className="overflow-hidden rounded-[calc(1rem-0.375rem)] bg-black">
          <video
            controls
            preload="metadata"
            className="block h-auto w-full"
            poster={video.posterUrl}
          >
            <source src={video.publicUrl} type={video.mimeType} />
            {fallbackLabel}
          </video>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {videos.map((video) => (
        <div
          key={video.publicUrl}
          className="rounded-2xl bg-[#F5F2EC] p-[6px] ring-1 ring-black/[0.06]"
        >
          <div className="overflow-hidden rounded-[calc(1rem-0.375rem)] bg-black">
            <video
              controls
              preload="metadata"
              className="block h-auto w-full"
              poster={video.posterUrl}
            >
              <source src={video.publicUrl} type={video.mimeType} />
              {fallbackLabel}
            </video>
          </div>
        </div>
      ))}
    </div>
  );
}

function RelatedProductsSection({
  products,
  title,
}: {
  products: ProductRelatedProduct[];
  title: string;
}): React.JSX.Element | null {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-28">
      <SectionHeader label={title} />
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            title={product.title}
            slug={product.slug}
            image={product.coverImageUrl}
            category={product.category}
            summaryTags={product.summaryTags}
          />
        ))}
      </div>
    </section>
  );
}

function buildSpecifications(
  variant: ProductDetailVariantData,
  labels: ProductDetailPageData["labels"]
): ProductSpecification[] {
  const specifications: ProductSpecification[] = [];

  if (variant.showCode) {
    addSpecification(specifications, labels.productCode, variant.code);
  }

  addSpecification(specifications, labels.colorGroup, variant.colorGroup);
  addSpecification(specifications, labels.size, variant.size);
  addSpecification(specifications, labels.faceCount, variant.faceCount);
  addSpecification(specifications, labels.process, variant.process);
  addSpecification(specifications, labels.thickness, variant.thickness);
  addSpecification(
    specifications,
    labels.facePatternNote,
    variant.facePatternNote
  );

  return specifications;
}

function addSpecification(
  specifications: ProductSpecification[],
  label: string,
  value: string | null | undefined
): void {
  if (value) {
    specifications.push({ label, value });
  }
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
  relatedProducts,
  labels,
}: ProductDetailPageData): React.JSX.Element {
  const [selectedVariantCode, setSelectedVariantCode] = useState<string>(
    defaultVariantCode ?? variants[0]?.code ?? ""
  );
  const requestSampleHref = `/contact?product=${encodeURIComponent(productSlug)}`;

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

  const elementImages = selectedVariant?.elementImages ?? [];
  const heroFromElement = elementImages[0] ?? null;
  const heroImage =
    heroFromElement ??
    selectedVariant?.spaceImages[0] ??
    selectedVariant?.realImages[0] ??
    null;

  const remainingElementImages = heroFromElement
    ? elementImages.slice(1)
    : elementImages;

  // Pill tabs for ≤8 variants; styled select for more
  const useTabPills = variants.length > 1 && variants.length <= 8;

  return (
    <div className="min-h-screen wayon-stone-bg pb-32">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      {heroImage ? (
        <section className="relative -mt-[var(--header-height)] h-screen min-h-[640px] w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage.publicUrl}
            alt={heroImage.alt}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Directional gradient for depth without hard vignette */}
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-black/25 via-black/5 to-transparent"
          />

          {/* Info card: Double-Bezel (outer shell → inner core) */}
          <div className="relative z-10 flex h-full flex-col justify-center pt-[var(--header-height)] ps-[max(5vw,24px)] pe-4">
            {/* outer shell */}
            <div className="w-full max-w-[460px] rounded-[2rem] bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur-2xl md:max-w-[540px]">
              {/* inner core */}
              <div className="rounded-[calc(2rem-0.5rem)] bg-white/32 px-8 py-9 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)] md:px-10 md:py-11">
                <span className="wayon-eyebrow mb-4 block text-black/60">
                  {category}
                </span>
                <h1 className="font-heading text-[1.9rem] font-normal tracking-[-0.02em] text-[#1a1a1a] md:text-[2.6rem]">
                  {title}
                </h1>
                {seriesTypes.length > 0 ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {seriesTypes.map((seriesType) => (
                      <span
                        key={seriesType}
                        className="rounded-full border border-black/20 px-3.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-black/65"
                      >
                        {seriesType}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── CONTENT ──────────────────────────────────────────────────── */}
      <div className="wayon-container-wide pt-10">
        {/* Back link — pill badge */}
        <Link
          href="/products"
          className="mb-12 inline-flex items-center gap-2 rounded-full border border-[#002b50]/10 bg-white/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#888888] backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#002b50]/25 hover:text-[#002b50]"
        >
          <ArrowLeft className="h-3 w-3 rtl:rotate-180" aria-hidden="true" />
          {backLabel}
        </Link>

        {/* No-hero fallback title */}
        {!heroImage ? (
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="wayon-eyebrow mb-5">{category}</span>
            <h1 className="mb-4 font-heading text-[2.4rem] font-normal tracking-[-0.02em] text-[#242424] md:text-[3.2rem]">
              {title}
            </h1>
          </div>
        ) : null}

        {/* Description */}
        {descriptionParagraphs.length > 0 ? (
          <div className="mx-auto mb-16 max-w-2xl text-center text-[15px] font-normal leading-[1.9] text-[#4a4a4a]">
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}

        {/* ─── VARIANT SELECTOR ─────────────────────────────────────── */}
        {variants.length > 1 ? (
          <div className="mb-16">
            <p className="wayon-eyebrow mb-5 text-center">
              {labels.variantSelector}
            </p>

            {useTabPills ? (
              // Pill tabs for ≤8 variants
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={labels.variantSelector}>
                {variants.map((variant) => (
                  <button
                    key={variant.code}
                    type="button"
                    onClick={() => setSelectedVariantCode(variant.code)}
                    aria-pressed={selectedVariantCode === variant.code}
                    className={`rounded-full px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] transition-all duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002b50] focus-visible:ring-offset-2 ${
                      selectedVariantCode === variant.code
                        ? "bg-[#002b50] text-white shadow-[0_8px_24px_-6px_rgba(0,43,80,0.45)]"
                        : "border border-[#002b50]/15 text-[#002b50]/65 hover:border-[#002b50]/30 hover:text-[#002b50]"
                    }`}
                  >
                    {variant.optionLabel}
                  </button>
                ))}
              </div>
            ) : (
              // Double-Bezel styled select for >8 variants
              <div className="mx-auto max-w-md rounded-2xl bg-[#F5F2EC] p-[6px] ring-1 ring-black/[0.06]">
                <label htmlFor="variant-select" className="sr-only">
                  {labels.variantSelector}
                </label>
                <div className="relative rounded-[calc(1rem-0.375rem)] bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                  <select
                    id="variant-select"
                    value={selectedVariantCode}
                    onChange={(event) =>
                      setSelectedVariantCode(event.target.value)
                    }
                    className="w-full appearance-none rounded-[inherit] bg-transparent px-5 py-3.5 pe-10 text-sm text-[#242424] outline-none focus-visible:ring-2 focus-visible:ring-[#002b50] focus-visible:ring-inset"
                  >
                    {variants.map((variant) => (
                      <option key={variant.code} value={variant.code}>
                        {variant.optionLabel}
                      </option>
                    ))}
                  </select>
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 end-4 flex items-center"
                  >
                    <ChevronDown className="h-3 w-3 text-[#002b50]/35" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* ─── SPECIFICATION BENTO CARDS ────────────────────────────── */}
        {specifications.length > 0 ? (
          <div className="mb-16">
            <div className="mx-auto grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {specifications.map((specification) => (
                <SpecCard
                  key={specification.label}
                  label={specification.label}
                  value={specification.value}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* ─── REQUEST SAMPLE CTA — pill + nested icon circle ───────── */}
        <div className="mb-28 flex justify-center">
          <Link
            href={requestSampleHref}
            className="group inline-flex items-center gap-3 rounded-full bg-[#002b50] px-7 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_40px_-12px_rgba(0,43,80,0.5)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:shadow-[0_16px_48px_-10px_rgba(0,43,80,0.55)]"
          >
            {requestSampleLabel}
            {/* Button-in-Button trailing icon */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
              <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            </span>
          </Link>
        </div>

        {/* ─── MEDIA GALLERIES ──────────────────────────────────────── */}
        {selectedVariant ? (
          <div className="flex flex-col gap-24">
            {remainingElementImages.length > 0 ? (
              <section>
                <SectionHeader label={labels.elementImages} />
                <MediaImageGrid images={remainingElementImages} />
              </section>
            ) : null}

            {selectedVariant.spaceImages.length > 0 ? (
              <section>
                <SectionHeader label={labels.spaceImages} />
                <MediaImageGrid images={selectedVariant.spaceImages} />
              </section>
            ) : null}

            {selectedVariant.realImages.length > 0 ? (
              <section>
                <SectionHeader label={labels.realImages} />
                <MediaImageGrid images={selectedVariant.realImages} />
              </section>
            ) : null}

            {selectedVariant.videos.length > 0 ? (
              <section>
                <SectionHeader label={labels.videos} />
                <MediaVideoGrid
                  videos={selectedVariant.videos}
                  fallbackLabel={labels.videoFallback}
                />
              </section>
            ) : null}
          </div>
        ) : null}

        <RelatedProductsSection
          products={relatedProducts}
          title={labels.relatedProducts}
        />
      </div>
    </div>
  );
}
