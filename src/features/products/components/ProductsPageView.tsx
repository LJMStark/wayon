import Image from "next/image";

import ProductGrid from "@/components/products/ProductGrid";
import { Link } from "@/i18n/routing";

import type { ProductsPageData, ProductCatalogSectionKey } from "../types";

const PRODUCTS_HERO_IMAGE_SRC =
  "/assets/products/products-hero-lauren-black-gold.jpg";

function buildProductsHref(section: ProductCatalogSectionKey): string {
  const params = new URLSearchParams();
  params.set("section", section);

  return `/products?${params.toString()}`;
}

export function ProductsPageView({
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
  activeSection,
  activeValue,
  taxonomyCards,
  products,
}: ProductsPageData): React.JSX.Element {
  const hasCollectionLabel = collectionLabel.trim().length > 0;
  const activeSectionLabel =
    navSections.find((section) => section.key === activeSection)?.label ??
    collectionLabel;
  const showDirectoryDescription =
    directoryDescription.trim() !== collectionDescription.trim();

  return (
    <main className="min-h-screen wayon-stone-bg">
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
        <div className="wayon-container-wide relative flex min-h-[340px] flex-col justify-center pb-20 pt-[calc(var(--header-height)+5rem)] md:pb-24 md:pt-[calc(var(--header-height)+6rem)]">
          {hasCollectionLabel ? (
            <span className="wayon-eyebrow mb-5 text-[#d7b06a]">
              {collectionLabel}
            </span>
          ) : null}
          <h1 className="wayon-title max-w-4xl break-words text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)]">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl break-words text-base leading-[1.85] text-white/80 md:text-[17px]">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <div className="wayon-container-wide mb-10 border-b border-[color:var(--border)] py-4 text-[12px] tracking-wide text-[color:var(--muted-foreground)]">
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

      <section className="wayon-container-wide pb-10">
        <div className="max-w-3xl space-y-4">
          {hasCollectionLabel ? (
            <span className="wayon-eyebrow">{collectionLabel}</span>
          ) : null}
          <h2 className="font-heading text-[2rem] font-medium tracking-[-0.015em] text-[#242424] md:text-[2.4rem]">
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

      <section className="wayon-container-wide pb-24">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="flex flex-col border-s border-[color:var(--border)] py-2 ps-0 lg:min-h-[500px]">
              {navSections.map((section) => {
                const isActive = section.key === activeSection;

                return (
                  <Link
                    key={section.key}
                    href={buildProductsHref(section.key)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative flex items-center px-7 py-5 text-[15px] font-medium tracking-[0.02em] transition-colors duration-200 ${
                      isActive
                        ? "text-[color:var(--primary)]"
                        : "text-[#333333] hover:text-[color:var(--primary)]"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute inset-y-2 start-[-1px] w-[2px] origin-center transition-transform duration-300 ease-out ${
                        isActive ? "scale-y-100 bg-[color:var(--primary)]" : "scale-y-0 bg-[color:var(--primary)]"
                      }`}
                    />
                    {section.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="space-y-8">
            <ProductGrid
              activeSection={activeSection}
              activeSectionLabel={activeSectionLabel}
              activeValue={activeValue}
              allLabel={allLabel}
              taxonomyCards={taxonomyCards}
              products={products}
              noProductsFoundLabel={noProductsFoundLabel}
              emptyTaxonomyTemplate={emptyTaxonomyTemplate}
              backToCategoriesLabel={backToCategoriesLabel}
              productCountTemplate={productCountTemplate}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
