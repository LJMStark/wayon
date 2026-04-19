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
  readMoreLabel: string;
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
    <div className="rounded-[28px] border border-dashed border-neutral-300 bg-white px-6 py-12 text-center text-neutral-500">
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
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-[#f5f5f5]">
        {card.imageSrc ? (
          <Image
            src={card.imageSrc}
            alt={card.label}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : null}
      </div>
      <div className="text-center font-medium text-[#1A1A1A]">
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
  readMoreLabel,
  noProductsFoundLabel,
}: ProductGridProps): React.JSX.Element {
  const selectedCard =
    taxonomyCards.find((card) => card.value === activeValue) ?? null;

  return (
    <section>
      {!activeValue ? (
        <div className="space-y-8">
          <div className="bg-[#FAF9F7] px-6 py-4">
            <h3 className="text-lg font-medium text-[#294B3B]">
              {activeSectionLabel} &gt;&gt;
            </h3>
          </div>
          
          {taxonomyCards.length === 0 ? (
            <EmptyTaxonomyState activeSectionLabel={activeSectionLabel} />
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
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
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Link 
                href={buildProductsHref(activeSection)}
                className="text-neutral-500 hover:text-black transition-colors"
                aria-label="Back to categories"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h3 className="text-2xl font-semibold text-[#1A1A1A]">
                {selectedCard?.label || allLabel}
              </h3>
            </div>
            <p className="text-sm text-neutral-500">共 {products.length} 个产品家族</p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-neutral-500">
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
                  readMoreLabel={readMoreLabel}
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
