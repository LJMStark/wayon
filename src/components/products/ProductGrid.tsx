"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import { motion, AnimatePresence } from "framer-motion";

type Product = {
  url: string;
  title: string;
  category: string;
  imageSrc: string;
  localImage?: string;
};

export default function ProductGrid({ products, initialCategories }: { products: Product[]; initialCategories: string[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("All Collections");

  const filteredProducts = activeCategory === "All Collections" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getFilterBtnClass = (isActive: boolean) => {
    const base = "px-6 py-2 rounded-full border text-sm font-medium transition-all";
    if (isActive) {
      return `${base} border-primary bg-primary text-white shadow-lg shadow-black/5`;
    }
    return `${base} border-muted bg-white text-muted-foreground hover:border-gold hover:text-gold`;
  };

  return (
    <section className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 pb-24 animate-fade-in">
      {/* Filters */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
        <button 
          onClick={() => setActiveCategory("All Collections")}
          className={getFilterBtnClass(activeCategory === "All Collections")}
        >
          All Collections
        </button>
        {initialCategories.map((cat, idx) => (
           <button 
            key={idx} 
            onClick={() => setActiveCategory(cat)}
            className={getFilterBtnClass(activeCategory === cat)}
          >
             {cat}
           </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          No products found for this category.
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.url || idx}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard 
                  title={product.title}
                  url={product.url}
                  image={product.localImage ? product.localImage : product.imageSrc}
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
