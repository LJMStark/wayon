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
  readMoreLabel,
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
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#f3efe7_0%,#fbfaf7_48%,#e8eef4_100%)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,40,88,0.08),transparent_42%)]" />
        <div className="relative mx-auto flex min-h-[320px] max-w-[1400px] flex-col justify-center px-6 py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-[#0f2858]/70">
            Product Center
          </p>
          <h1 className="max-w-4xl text-4xl font-semibold tracking-wide text-[#1a1a1a] md:text-6xl">
            {heroTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-neutral-600 md:text-lg">
            {heroSubtitle}
          </p>
        </div>
      </section>

      <div className="mx-auto mb-8 max-w-[1400px] border-b border-gray-100 px-6 py-4 text-[13px] text-gray-500">
        <span className="text-gray-400">◆</span> {breadcrumbLabel}:{" "}
        <Link href="/" className="hover:text-black">
          {homeLabel}
        </Link>{" "}
        &gt; <span className="text-black">{collectionLabel}</span>
      </div>

      <section className="mx-auto max-w-[1400px] px-6 pb-8">
        <div className="max-w-4xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-neutral-400">
            {collectionLabel}
          </p>
          <h2 className="text-3xl font-semibold text-[#1a1a1a]">
            {directoryTitle}
          </h2>
          <p className="text-[15px] leading-8 text-neutral-600">
            {collectionDescription}
          </p>
          {showDirectoryDescription ? (
            <p className="text-[15px] leading-8 text-neutral-500">
              {directoryDescription}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-20">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav className="flex flex-col border-r border-[#EBEBEB] min-h-[500px] py-2 pr-4">
              {navSections.map((section) => {
                const isActive = section.key === activeSection;

                return (
                  <Link
                    key={section.key}
                    href={buildProductsHref(section.key)}
                    className={`flex items-center px-8 py-5 text-[15px] font-medium transition-colors ${
                      isActive
                        ? "bg-[#FAF9F7] text-[#294B3B]"
                        : "text-[#333333] hover:text-[#294B3B]"
                    }`}
                  >
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
              readMoreLabel={readMoreLabel}
              noProductsFoundLabel={noProductsFoundLabel}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
