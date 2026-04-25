import Image from "next/image";

import { Link } from "@/i18n/routing";
import type {
  ProductCatalogSectionKey,
  ProductDirectoryItem,
  ProductTaxonomyCard,
} from "@/features/products/types";

import ProductCard from "./ProductCard";

type ProductGridProps = {
  activeSection: ProductCatalogSectionKey;
  activeSectionLabel: string;
  activeValue: string | null;
  allLabel: string;
  taxonomyCards: ProductTaxonomyCard[];
  products: ProductDirectoryItem[];

  noProductsFoundLabel: string;
};

function buildProductsHref(
  section: ProductCatalogSectionKey,
  value?: string | null
): string {
  const params = new URLSearchParams();
  params.set("section", section);

  if (value) {
    params.set("value", value);
  }

  return `/products?${params.toString()}`;
}

function buildSummaryTags(product: ProductDirectoryItem): string[] {
  const sizes = new Set(
    product.variants
      .map((variant) => variant.size)
      .filter((value): value is string => Boolean(value))
  );
  const thicknesses = new Set(
    product.variants
      .map((variant) => variant.thickness)
      .filter((value): value is string => Boolean(value))
  );
  const processes = new Set(
    product.variants
      .map((variant) => variant.process)
      .filter((value): value is string => Boolean(value))
  );

  return [...sizes, ...thicknesses, ...processes].slice(0, 4);
}

function EmptyTaxonomyState({
  activeSectionLabel,
}: {
  activeSectionLabel: string;
}): React.JSX.Element {
  return (
    <div className="border border-dashed border-[color:var(--border)] bg-white px-6 py-12 text-center text-[color:var(--muted-foreground)]">
      当前“{activeSectionLabel}”栏目还没有可展示的二级分类。
    </div>
  );
}

function TaxonomyCard({
  activeSection,
  card,
}: {
  activeSection: ProductCatalogSectionKey;
  card: ProductTaxonomyCard;
}): React.JSX.Element {
  return (
    <Link
      href={buildProductsHref(activeSection, card.value)}
      className="group flex flex-col gap-4"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-[color:var(--surface)]">
        {card.imageSrc ? (
          <Image
            src={card.imageSrc}
            alt={card.label}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            unoptimized
          />
        ) : null}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px scale-x-0 bg-[color:var(--accent)] transition-transform duration-500 ease-out group-hover:scale-x-100 origin-left"
        />
      </div>
      <div className="text-center text-[15px] font-medium tracking-[0.04em] text-[#242424] transition-colors duration-300 group-hover:text-[color:var(--primary)]">
        {card.label}
      </div>
    </Link>
  );
}

export default function ProductGrid({
  activeSection,
  activeSectionLabel,
  activeValue,
  allLabel,
  taxonomyCards,
  products,

  noProductsFoundLabel,
}: ProductGridProps): React.JSX.Element {
  const selectedCard =
    taxonomyCards.find((card) => card.value === activeValue) ?? null;

  return (
    <section>
      {!activeValue ? (
        <div className="space-y-10">
          <div className="flex items-baseline gap-4 border-b border-[color:var(--border)] pb-5">
            <span className="wayon-eyebrow">{activeSectionLabel}</span>
            <span
              aria-hidden
              className="h-px flex-1 bg-[color:var(--border)]"
            />
          </div>

          {taxonomyCards.length === 0 ? (
            <EmptyTaxonomyState activeSectionLabel={activeSectionLabel} />
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {taxonomyCards.map((card) => (
                <TaxonomyCard
                  key={card.key}
                  activeSection={activeSection}
                  card={card}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={buildProductsHref(activeSection)}
                className="inline-flex size-10 items-center justify-center border border-[color:var(--border)] text-[color:var(--muted-foreground)] transition-colors duration-200 hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] rtl:rotate-180"
                aria-label="Back to categories"
              >
                <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="flex flex-col gap-1">
                <span className="wayon-eyebrow">{activeSectionLabel}</span>
                <h3 className="font-heading text-[1.75rem] font-medium tracking-[-0.01em] text-[#242424]">
                  {selectedCard?.label || allLabel}
                </h3>
              </div>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted-foreground)]">
              {products.length} <span className="opacity-60">/ products</span>
            </p>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-[color:var(--border)] bg-white px-6 py-16 text-center text-[color:var(--muted-foreground)]">
              {noProductsFoundLabel}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard
                  key={product.slug}
                  title={product.title}
                  slug={product.slug}
                  image={product.coverImageUrl}
                  category={product.seriesTypes[0] || product.category}

                  summaryTags={buildSummaryTags(product)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
