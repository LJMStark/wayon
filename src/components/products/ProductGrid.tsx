"use client";

import { useMemo, useState } from "react";

import {
  TRADE_COLOR_GROUPS,
  TRADE_PROCESSES,
  TRADE_SERIES_TYPES,
  TRADE_SIZES,
} from "@/features/products/lib/tradeCatalog";
import {
  matchesDirectoryFilters,
  type DirectoryFilters,
  type DirectoryProduct,
} from "@/features/products/model/productDirectory";
import type {
  ProductDirectoryFilterLabels,
  ProductDirectoryItem,
} from "@/features/products/types";

import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: ProductDirectoryItem[];
  filterLabels: ProductDirectoryFilterLabels;
  readMoreLabel: string;
  noProductsFoundLabel: string;
};

function FilterGroup({
  label,
  allLabel,
  options,
  selected,
  onSelect,
}: {
  label: string;
  allLabel: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}): React.JSX.Element | null {
  if (options.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#1a1a1a]">{label}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onSelect(allLabel)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
            selected === allLabel
              ? "border-[#1a1a1a] bg-[#1a1a1a] text-white"
              : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
          }`}
        >
          {allLabel}
        </button>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onSelect(option)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              selected === option
                ? "border-[#0f2858] bg-[#0f2858] text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function mapDirectoryProduct(product: ProductDirectoryItem): DirectoryProduct {
  return {
    slug: product.slug,
    seriesTypes: product.seriesTypes,
    coverImageUrl: product.coverImageUrl ?? null,
    variants: product.variants.map(
      (variant): DirectoryProduct["variants"][number] => ({
        code: variant.code,
        size: variant.size,
        process: variant.process,
        colorGroup: variant.colorGroup,
        sortOrder: 0,
        elementImages: [],
        spaceImages: [],
        realImages: [],
        videos: [],
      })
    ),
  };
}

function collectVariantOptions(
  products: ProductDirectoryItem[],
  selector: (variant: ProductDirectoryItem["variants"][number]) => string | undefined,
  order: readonly string[]
): string[] {
  const used = new Set(
    products.flatMap((product) =>
      product.variants
        .map(selector)
        .filter((value): value is string => Boolean(value))
    )
  );

  return order.filter((value) => used.has(value));
}

function collectSeriesOptions(products: ProductDirectoryItem[]): string[] {
  const used = new Set(products.flatMap((product) => product.seriesTypes));

  return TRADE_SERIES_TYPES.filter((value) => used.has(value));
}

function buildSummaryTags(product: ProductDirectoryItem): string[] {
  const sizes = new Set(
    product.variants
      .map((variant) => variant.size)
      .filter((value): value is string => Boolean(value))
  );
  const processes = new Set(
    product.variants
      .map((variant) => variant.process)
      .filter((value): value is string => Boolean(value))
  );

  return [...sizes, ...processes].slice(0, 4);
}

export default function ProductGrid({
  products,
  filterLabels,
  readMoreLabel,
  noProductsFoundLabel,
}: ProductGridProps): React.JSX.Element {
  const [sizeFilter, setSizeFilter] = useState(filterLabels.all);
  const [processFilter, setProcessFilter] = useState(filterLabels.all);
  const [seriesTypeFilter, setSeriesTypeFilter] = useState(filterLabels.all);
  const [colorFilter, setColorFilter] = useState(filterLabels.all);

  const sizeOptions = useMemo(
    () => collectVariantOptions(products, (variant) => variant.size, TRADE_SIZES),
    [products]
  );
  const processOptions = useMemo(
    () =>
      collectVariantOptions(products, (variant) => variant.process, TRADE_PROCESSES),
    [products]
  );
  const seriesTypeOptions = useMemo(() => collectSeriesOptions(products), [products]);
  const colorOptions = useMemo(
    () =>
      collectVariantOptions(
        products,
        (variant) => variant.colorGroup,
        TRADE_COLOR_GROUPS
      ),
    [products]
  );

  const activeFilters = useMemo<DirectoryFilters>(
    () => ({
      size: sizeFilter === filterLabels.all ? null : sizeFilter,
      process: processFilter === filterLabels.all ? null : processFilter,
      seriesType: seriesTypeFilter === filterLabels.all ? null : seriesTypeFilter,
      colorGroup: colorFilter === filterLabels.all ? null : colorFilter,
    }),
    [colorFilter, filterLabels.all, processFilter, seriesTypeFilter, sizeFilter]
  );

  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        matchesDirectoryFilters(mapDirectoryProduct(product), activeFilters)
      ),
    [activeFilters, products]
  );

  return (
    <section className="space-y-10">
      <div className="rounded-[32px] border border-neutral-200 bg-[#faf9f7] p-6 sm:p-8">
        <div className="space-y-6">
          <FilterGroup
            label={filterLabels.size}
            allLabel={filterLabels.all}
            options={sizeOptions}
            selected={sizeFilter}
            onSelect={setSizeFilter}
          />
          <FilterGroup
            label={filterLabels.process}
            allLabel={filterLabels.all}
            options={processOptions}
            selected={processFilter}
            onSelect={setProcessFilter}
          />
          <FilterGroup
            label={filterLabels.seriesType}
            allLabel={filterLabels.all}
            options={seriesTypeOptions}
            selected={seriesTypeFilter}
            onSelect={setSeriesTypeFilter}
          />
          <FilterGroup
            label={filterLabels.colorGroup}
            allLabel={filterLabels.all}
            options={colorOptions}
            selected={colorFilter}
            onSelect={setColorFilter}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-neutral-500">
          {noProductsFoundLabel}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
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
    </section>
  );
}
