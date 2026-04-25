import ProductGrid from "@/components/products/ProductGrid";
import { Link } from "@/i18n/routing";

import type { ProductsPageData, ProductCatalogSectionKey } from "../types";

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
  directoryTitle,
  directoryDescription,
  navSections,
  activeSection,
  activeValue,
  taxonomyCards,
  products,
}: ProductsPageData): React.JSX.Element {
  const activeSectionLabel =
    navSections.find((section) => section.key === activeSection)?.label ??
    collectionLabel;
  const showDirectoryDescription =
    directoryDescription.trim() !== collectionDescription.trim();

  return (
    <main className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-[color:var(--muted)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 end-0 w-1/2 bg-gradient-to-l from-[color:var(--surface)] to-transparent rtl:bg-gradient-to-r"
        />
        <div className="wayon-container-wide relative flex min-h-[340px] flex-col justify-center py-20 md:py-24">
          <span className="wayon-eyebrow mb-5 text-[color:var(--primary)]/70">
            Product Center
          </span>
          <h1 className="wayon-title max-w-4xl">
            {heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.85] text-[color:var(--muted-foreground)] md:text-[17px]">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <div className="wayon-container-wide mb-10 border-b border-[color:var(--border)] py-4 text-[12px] tracking-wide text-[color:var(--muted-foreground)]">
        {breadcrumbLabel}:{" "}
        <Link href="/" className="transition-colors hover:text-[color:var(--primary)]">
          {homeLabel}
        </Link>
        <span aria-hidden className="mx-2 opacity-40">/</span>
        <span className="text-[color:var(--foreground)]">{collectionLabel}</span>
      </div>

      <section className="wayon-container-wide pb-10">
        <div className="max-w-3xl space-y-4">
          <span className="wayon-eyebrow">{collectionLabel}</span>
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
            />
          </div>
        </div>
      </section>
    </main>
  );
}
