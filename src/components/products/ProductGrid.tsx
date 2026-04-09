"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useState } from "react";

import {
  getLocalizedProductValue,
  getProductImage,
  type Product,
} from "@/data/products";
import { getCommonCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import ProductCard from "./ProductCard";

type ProductGridProps = {
  products: Product[];
  initialCategories: string[];
};

function getFilterButtonClassName(isActive: boolean): string {
  const base = "rounded-full border px-6 py-2 text-sm font-medium transition-all";

  if (isActive) {
    return `${base} border-primary bg-primary text-white shadow-lg shadow-black/5`;
  }

  return `${base} border-muted bg-white text-muted-foreground hover:border-gold hover:text-gold`;
}

function filterProductsByCategory(
  products: Product[],
  activeCategory: string,
  allCollectionsLabel: string
): Product[] {
  if (activeCategory === allCollectionsLabel) {
    return products;
  }

  return products.filter((product) => product.category === activeCategory);
}

export default function ProductGrid({
  products,
  initialCategories,
}: ProductGridProps): React.JSX.Element {
  const locale = useLocale() as AppLocale;
  const copy = getCommonCopy(locale);
  const [activeCategory, setActiveCategory] = useState<string>(copy.allCollections);
  const filteredProducts = filterProductsByCategory(
    products,
    activeCategory,
    copy.allCollections
  );

  return (
    <section className="mx-auto mt-16 max-w-[1600px] animate-fade-in px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setActiveCategory(copy.allCollections)}
          className={getFilterButtonClassName(activeCategory === copy.allCollections)}
        >
          {copy.allCollections}
        </button>
        {initialCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setActiveCategory(category)}
            className={getFilterButtonClassName(activeCategory === category)}
          >
            {category}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">{copy.noProductsFound}</div>
      ) : (
        <motion.div layout className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <AnimatePresence>
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.slug || index}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard
                  title={getLocalizedProductValue(product, locale, "title")}
                  slug={product.slug}
                  image={getProductImage(product)}
                  category={product.category}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}
