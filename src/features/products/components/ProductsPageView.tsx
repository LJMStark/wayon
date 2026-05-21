import { Suspense } from "react";
import Image from "next/image";

import { Link } from "@/i18n/routing";

import {
  ProductsCatalogClient,
  ProductsCatalogFallback,
} from "./ProductsCatalogClient";
import type { ProductsPageData } from "../types";

const PRODUCTS_HERO_IMAGE_SRC =
  "/assets/products/products-hero-lauren-black-gold.jpg";

export function ProductsPageView({
  locale,
  heroTitle,
  heroSubtitle,
  breadcrumbLabel,
  homeLabel,
  collectionLabel,
  collectionDescription,
  allLabel,
  noProductsFoundLabel,
  emptyTaxonomyTemplate,
  backToCategoriesLabel,
  productCountTemplate,
  directoryTitle,
  directoryDescription,
  navSections,
  seriesQuickLinks,
  activeSection,
  activeValue,
  activeValueLabel,
  taxonomyCards,
  customCapabilities,
  allProducts,
  products,
  searchQuery,
  searchResultsLabel,
  searchResultsForTemplate,
}: ProductsPageData): React.JSX.Element {
  const hasCollectionLabel = collectionLabel.trim().length > 0;
  const showDirectoryDescription =
    directoryDescription.trim() !== collectionDescription.trim();
  const catalogProps = {
    allLabel,
    backToCategoriesLabel,
    customCapabilities,
    emptyTaxonomyTemplate,
    initialActiveSection: activeSection,
    initialActiveValue: activeValue,
    initialActiveValueLabel: activeValueLabel,
    initialProducts: products,
    initialSearchQuery: searchQuery,
    initialTaxonomyCards: taxonomyCards,
    locale,
    navSections,
    noProductsFoundLabel,
    productCountTemplate,
    products: allProducts,
    searchResultsForTemplate,
    searchResultsLabel,
    seriesQuickLinks,
  };

  return (
    <main className="min-h-screen zyl-stone-bg">
      <section className="relative -mt-[var(--header-height)] overflow-hidden bg-black">
        <Image
          src={PRODUCTS_HERO_IMAGE_SRC}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.56)_48%,rgba(0,0,0,0.18)_100%)] rtl:bg-[linear-gradient(270deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.56)_48%,rgba(0,0,0,0.18)_100%)]"
        />
        <div className="zyl-container-wide relative flex min-h-[340px] flex-col justify-center pb-20 pt-[calc(var(--header-height)+5rem)] md:pb-24 md:pt-[calc(var(--header-height)+6rem)]">
          {hasCollectionLabel ? (
            <span className="zyl-eyebrow mb-5 text-[#d7b06a]">
              {collectionLabel}
            </span>
          ) : null}
          <h1 className="zyl-title zyl-brand-title max-w-4xl break-words text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl break-words text-base leading-[1.85] text-white/80 md:text-[17px]">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <div className="zyl-container-wide mb-10 border-b border-[color:var(--border)] py-4 text-[12px] tracking-wide text-[color:var(--muted-foreground)]">
        {breadcrumbLabel}:{" "}
        <Link href="/" className="transition-colors hover:text-[color:var(--primary)]">
          {homeLabel}
        </Link>
        {hasCollectionLabel ? (
          <>
            <span aria-hidden className="mx-2 opacity-40">/</span>
            <span className="text-[color:var(--foreground)]">
              {collectionLabel}
            </span>
          </>
        ) : null}
      </div>

      <section className="zyl-container-wide pb-10">
        <div className="max-w-3xl space-y-4">
          {hasCollectionLabel ? (
            <span className="zyl-eyebrow">{collectionLabel}</span>
          ) : null}
          <h2 className="zyl-brand-title text-[2rem] text-[#242424] md:text-[2.4rem]">
            {directoryTitle}
          </h2>
          <p className="text-[15px] leading-[1.85] text-[color:var(--muted-foreground)]">
            {collectionDescription}
          </p>
          {showDirectoryDescription ? (
            <p className="text-[15px] leading-[1.85] text-[color:var(--muted-foreground)]/85">
              {directoryDescription}
            </p>
          ) : null}
        </div>
      </section>

      <section className="zyl-container-wide pb-24">
        <Suspense fallback={<ProductsCatalogFallback {...catalogProps} />}>
          <ProductsCatalogClient {...catalogProps} />
        </Suspense>
      </section>
    </main>
  );
}
