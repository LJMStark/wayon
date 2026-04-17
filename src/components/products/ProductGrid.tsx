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
  activeValue,
  card,
}: {
  activeSection: ProductCatalogSectionKey;
  activeValue: string | null;
  card: ProductTaxonomyCard;
}): React.JSX.Element {
  const isActive = activeValue === card.value;

  return (
    <Link
      href={buildProductsHref(activeSection, card.value)}
      className={`group overflow-hidden rounded-[28px] border transition-all duration-300 ${
        isActive
          ? "border-[#0f2858] bg-[#f5f7fb] shadow-lg shadow-[#0f2858]/8"
          : "border-neutral-200 bg-white hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl hover:shadow-black/5"
      }`}
    >
      <div className="relative aspect-[16/10] bg-neutral-100">
        {card.imageSrc ? (
          <Image
            src={card.imageSrc}
            alt={card.label}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#f7f4ef,#ece8df)]" />
        )}
        <span className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          {card.count} 款
        </span>
      </div>
      <div className="space-y-2 px-5 py-5">
        <h3 className="text-xl font-semibold text-[#1a1a1a]">{card.label}</h3>
        {card.description ? (
          <p className="text-sm leading-6 text-neutral-600">{card.description}</p>
        ) : null}
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
    <section className="space-y-10">
      <div className="flex flex-col gap-4 rounded-[32px] border border-neutral-200 bg-[#faf9f7] p-6 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-400">
              Product Navigation
            </p>
            <h3 className="mt-2 text-3xl font-semibold text-[#1a1a1a]">
              {activeSectionLabel}
            </h3>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href={buildProductsHref(activeSection)}
              className={`inline-flex items-center rounded-full border px-4 py-2 text-sm transition-colors ${
                activeValue
                  ? "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                  : "border-[#1a1a1a] bg-[#1a1a1a] text-white"
              }`}
            >
              {allLabel}
            </Link>
            {selectedCard ? (
              <span className="inline-flex items-center rounded-full bg-[#0f2858] px-4 py-2 text-sm text-white">
                当前分类：{selectedCard.label}
              </span>
            ) : null}
          </div>
        </div>

        {taxonomyCards.length === 0 ? (
          <EmptyTaxonomyState activeSectionLabel={activeSectionLabel} />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {taxonomyCards.map((card) => (
              <TaxonomyCard
                key={card.key}
                activeSection={activeSection}
                activeValue={activeValue}
                card={card}
              />
            ))}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-neutral-500">
          {noProductsFoundLabel}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-neutral-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-neutral-400">
                Product Family
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-[#1a1a1a]">
                {selectedCard?.label || `全部${activeSectionLabel}`}
              </h3>
            </div>
            <p className="text-sm text-neutral-500">共 {products.length} 个产品家族</p>
          </div>

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
        </div>
      )}
    </section>
  );
}
