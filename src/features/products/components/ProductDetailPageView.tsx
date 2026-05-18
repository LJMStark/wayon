"use client";

import { useEffect, useRef, useState, useMemo } from "react";

import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";

import ProductCard from "@/components/products/ProductCard";
import { Link } from "@/i18n/routing";
import { buildProductSpecifications } from "../model/productSpecifications";

import type {
  ProductDetailMediaImage,
  ProductDetailMediaVideo,
  ProductDetailPageData,
  ProductRelatedProduct,
} from "../types";

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

function SpecCard({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="rounded-2xl bg-[#F5F2EC] p-[6px] ring-1 ring-black/[0.06]">
      <div className="flex min-h-[116px] flex-col items-center justify-center gap-3 rounded-[calc(1rem-0.375rem)] bg-white px-5 py-6 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
        <span className="text-[13px] font-semibold uppercase tracking-[0.14em] text-[#888888]">
          {label}
        </span>
        <span className="text-[16px] font-normal leading-relaxed text-[#1a1a1a] md:text-[17px]">
          {value}
        </span>
      </div>
    </div>
  );
}

function SectionHeader({ label }: { label: string }): React.JSX.Element {
  const [ref, visible] = useFadeIn();

  return (
    <div
      ref={ref}
      className={`mb-12 flex justify-center transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      }`}
    >
      <div className="flex w-full max-w-3xl items-center justify-center gap-4 px-2 sm:gap-6">
        <div
          aria-hidden
          className="h-px min-w-0 flex-1 bg-gradient-to-l from-[#002b50]/14 to-transparent"
        />
        <span className="shrink-0 rounded-full bg-white/80 px-8 py-3.5 text-center text-[18px] font-semibold uppercase tracking-[0.08em] text-[#002b50] shadow-[0_12px_34px_-22px_rgba(0,43,80,0.55)] ring-1 ring-[#002b50]/12 backdrop-blur-sm sm:text-[22px]">
          {label}
        </span>
        <div
          aria-hidden
          className="h-px min-w-0 flex-1 bg-gradient-to-r from-[#002b50]/14 to-transparent"
        />
      </div>
    </div>
  );
}

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
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
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
            summaryTags={product.summaryTags}
          />
        ))}
      </div>
    </section>
  );
}

export function ProductDetailPageView({
  backLabel,
  requestSampleLabel,
  productSlug,
  title,
  category,
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
    ? buildProductSpecifications(selectedVariant, labels)
    : [];
  const heroProductCode = selectedVariant?.code?.trim() ?? "";

  const elementImages = selectedVariant?.elementImages ?? [];
  const heroFromElement = elementImages[0] ?? null;
  const heroSpaceImage = selectedVariant?.spaceImages[0] ?? null;
  const heroImage =
    heroFromElement ??
    heroSpaceImage ??
    selectedVariant?.realImages[0] ??
    null;
  const heroMainImage = heroSpaceImage ?? heroImage;
  const heroProductLabel = heroProductCode || category;

  const remainingElementImages = heroFromElement
    ? elementImages.slice(1)
    : elementImages;

  // Pill tabs for ≤8 variants; styled select for more
  const useTabPills = variants.length > 1 && variants.length <= 8;

  return (
    <div className="min-h-screen zyl-stone-bg pb-32">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      {heroImage ? (
        <section className="relative -mt-[var(--header-height)] h-[58svh] min-h-[520px] max-h-[760px] w-full overflow-hidden sm:h-[62svh] sm:min-h-[690px] md:min-h-[720px] lg:h-[66svh] lg:min-h-[640px] xl:max-h-[800px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage.publicUrl}
            alt={heroImage.alt}
            className={`absolute inset-0 h-full w-full object-cover ${
              heroFromElement
                ? "origin-left scale-[1.08] object-left"
                : "object-center"
            }`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          {/* Directional gradient for depth without hard vignette */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0.1)_52%,rgba(255,255,255,0.28)_100%)]"
          />

          <div className="relative z-10 flex h-full items-center px-[max(5vw,20px)] pt-[calc(var(--header-height)+clamp(1.25rem,4svh,3rem))] pb-[clamp(3.5rem,8svh,6rem)]">
            <div className="mx-auto grid w-full max-w-[1480px] items-end gap-5 [direction:ltr] md:grid-cols-[minmax(0,0.72fr)_minmax(170px,0.28fr)] md:gap-6 lg:grid-cols-[minmax(0,0.74fr)_minmax(180px,0.26fr)] lg:gap-[clamp(1.25rem,3vw,3.75rem)] xl:px-[max(0px,1.5vw)]">
              {heroMainImage ? (
                <figure className="w-full max-w-[min(86vw,980px)] justify-self-start rounded-[1.85rem] bg-white/18 p-2 shadow-[0_34px_92px_-44px_rgba(0,30,60,0.62)] ring-1 ring-white/25 backdrop-blur-md sm:max-w-[min(80vw,940px)] lg:max-w-none">
                  <div className="overflow-hidden rounded-[calc(1.85rem-0.5rem)] bg-white/38 shadow-[inset_0_1px_1px_rgba(255,255,255,0.32)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={heroMainImage.publicUrl}
                      alt={heroMainImage.alt}
                      loading="eager"
                      decoding="async"
                      className="block aspect-[2.05/1] w-full object-cover object-[center_42%] sm:aspect-[2/1] lg:aspect-[1.95/1]"
                    />
                  </div>
                </figure>
              ) : null}

              <div className="w-full max-w-[clamp(190px,18vw,290px)] justify-self-end rounded-[1.1rem] bg-white/18 p-1.5 ring-1 ring-white/18 backdrop-blur-md">
                <div className="rounded-[calc(1.1rem-0.375rem)] bg-white/34 px-3.5 py-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.22)] rtl:[direction:rtl] md:px-4 md:py-4">
                  {heroProductLabel ? (
                    <div className="mb-2.5">
                      <span className="text-[14px] font-semibold uppercase leading-none tracking-[0.08em] text-black/58 md:text-[15px] xl:text-[16px]">
                        {heroProductLabel}
                      </span>
                    </div>
                  ) : null}
                  <h1 className="zyl-brand-title break-words text-[1.18rem] leading-[1.08] text-[#1a1a1a] [overflow-wrap:anywhere] md:text-[1.3rem] xl:text-[1.42rem]">
                    {title}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ─── CONTENT ──────────────────────────────────────────────────── */}
      <div className="zyl-container-wide pt-10">
        <Link
          href="/products"
          className="mb-12 inline-flex items-center gap-2.5 rounded-full border border-[#002b50]/10 bg-white/70 px-5 py-2.5 text-[14px] font-semibold uppercase tracking-[0.12em] text-[#888888] backdrop-blur-sm transition-[color,border-color] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-[#002b50]/25 hover:text-[#002b50]"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          {backLabel}
        </Link>

        {/* No-hero fallback title */}
        {!heroImage ? (
          <div className="mb-16 flex flex-col items-center text-center">
            <span className="zyl-eyebrow mb-5 text-[15px] tracking-[0.08em]">
              {category}
            </span>
            <h1 className="zyl-brand-title mb-4 text-[2.4rem] text-[#242424] md:text-[3.2rem]">
              {title}
            </h1>
          </div>
        ) : null}

        {descriptionParagraphs.length > 0 ? (
          <div className="mx-auto mb-16 max-w-2xl text-left text-[17px] font-normal leading-[1.85] text-[#4a4a4a] [text-wrap:pretty] md:text-[18px]">
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
            <p className="zyl-eyebrow mb-5 text-center text-[15px] tracking-[0.08em]">
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
                    className={`rounded-full px-6 py-3 text-[14px] font-medium uppercase tracking-[0.08em] transition-[background-color,color,border-color,box-shadow] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#002b50] focus-visible:ring-offset-2 md:text-[15px] ${
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
                    className="w-full appearance-none rounded-[inherit] bg-transparent px-5 py-4 pe-10 text-[16px] text-[#242424] outline-none focus-visible:ring-2 focus-visible:ring-[#002b50] focus-visible:ring-inset"
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
            <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
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
            className="group inline-flex items-center gap-3.5 rounded-full bg-[#002b50] px-8 py-[1.125rem] text-[15px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_12px_40px_-12px_rgba(0,43,80,0.5)] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] hover:shadow-[0_16px_48px_-10px_rgba(0,43,80,0.55)]"
          >
            {requestSampleLabel}
            {/* Button-in-Button trailing icon */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105">
              <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
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
