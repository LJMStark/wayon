"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import { formatCopy } from "@/data/siteCopy";
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
  emptyTaxonomyTemplate: string;
  backToCategoriesLabel: string;
  productCountTemplate: string;
};

const GRID_ITEM_INITIAL = { opacity: 0, y: 12 } as const;
const GRID_ITEM_ANIMATE = { opacity: 1, y: 0 } as const;
const GRID_ITEM_EXIT = { opacity: 0, y: -8 } as const;
const GRID_ITEM_TRANSITION = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
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

function EmptyTaxonomyState({
  activeSectionLabel,
  emptyTaxonomyTemplate,
}: {
  activeSectionLabel: string;
  emptyTaxonomyTemplate: string;
}): React.JSX.Element {
  return (
    <div className="border border-dashed border-[color:var(--border)] bg-white px-6 py-12 text-center text-[color:var(--muted-foreground)]">
      {formatCopy(emptyTaxonomyTemplate, { section: activeSectionLabel })}
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
  emptyTaxonomyTemplate,
  backToCategoriesLabel,
  productCountTemplate,
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
            <EmptyTaxonomyState
              activeSectionLabel={activeSectionLabel}
              emptyTaxonomyTemplate={emptyTaxonomyTemplate}
            />
          ) : (
            <motion.div
              key={`taxonomy-${activeSection}`}
              className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {taxonomyCards.map((card) => (
                  <motion.div
                    key={card.key}
                    layout
                    initial={GRID_ITEM_INITIAL}
                    animate={GRID_ITEM_ANIMATE}
                    exit={GRID_ITEM_EXIT}
                    transition={GRID_ITEM_TRANSITION}
                  >
                    <TaxonomyCard activeSection={activeSection} card={card} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={buildProductsHref(activeSection)}
                className="inline-flex size-10 items-center justify-center border border-[color:var(--border)] text-[color:var(--muted-foreground)] transition-colors duration-200 hover:border-[color:var(--primary)] hover:text-[color:var(--primary)] rtl:rotate-180"
                aria-label={backToCategoriesLabel}
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
              {formatCopy(productCountTemplate, { count: products.length })}
            </p>
          </div>

          {products.length === 0 ? (
            <div className="border border-dashed border-[color:var(--border)] bg-white px-6 py-16 text-center text-[color:var(--muted-foreground)]">
              {noProductsFoundLabel}
            </div>
          ) : (
            <motion.div
              key={`products-${activeSection}-${activeValue ?? "all"}`}
              className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {products.map((product) => (
                  <motion.div
                    key={product.slug}
                    layout
                    initial={GRID_ITEM_INITIAL}
                    animate={GRID_ITEM_ANIMATE}
                    exit={GRID_ITEM_EXIT}
                    transition={GRID_ITEM_TRANSITION}
                  >
                    <ProductCard
                      title={product.title}
                      slug={product.slug}
                      image={product.coverImageUrl}
                      category={product.category}
                      summaryTags={product.summaryTags ?? []}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      )}
    </section>
  );
}
