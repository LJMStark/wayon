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
          <p className="text-[15px] leading-8 text-neutral-500">
            {directoryDescription}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-20">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-[32px] border border-neutral-200 bg-[#f7f4ef]">
              <div className="border-b border-white/80 px-6 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
                  Catalog
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1a1a1a]">
                  {directoryTitle}
                </h2>
              </div>
              <nav className="flex flex-col">
                {navSections.map((section) => {
                  const isActive = section.key === activeSection;

                  return (
                    <Link
                      key={section.key}
                      href={buildProductsHref(section.key)}
                      className={`flex items-center justify-between border-b border-white/80 px-6 py-6 text-lg transition-colors last:border-b-0 ${
                        isActive
                          ? "bg-white text-[#0f2858]"
                          : "text-[#1a1a1a] hover:bg-white/70"
                      }`}
                    >
                      <span className="font-medium">{section.label}</span>
                      <span
                        className={`text-sm ${
                          isActive ? "text-[#0f2858]" : "text-neutral-400"
                        }`}
                      >
                        {isActive ? "已选" : "进入"}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="rounded-[32px] border border-neutral-200 bg-white p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                Active Section
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold text-[#1a1a1a]">
                    {activeSectionLabel}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-neutral-600">
                    先浏览二级分类，再查看对应产品家族。后台补齐资料后，相关内容会自动显示。
                  </p>
                </div>
                <div className="inline-flex items-center rounded-full bg-[#f3f5f8] px-4 py-2 text-sm text-[#0f2858]">
                  {activeValue ? `当前筛选：${activeValue}` : `${allLabel}${activeSectionLabel}`}
                </div>
              </div>
            </div>

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
