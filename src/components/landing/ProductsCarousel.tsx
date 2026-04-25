"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { ProductItem } from "@/data/home";
import type { ProductsCarouselCopy } from "@/features/home/types";
import { Link } from "@/i18n/routing";

import {
  scrollContainerByDirection,
} from "./carouselUtils";

type ProductsCarouselProps = {
  items: ProductItem[];
  copy: ProductsCarouselCopy;
};

export function ProductsCarousel({
  items,
  copy,
}: ProductsCarouselProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "prev" | "next"): void => {
    scrollContainerByDirection(scrollerRef.current, direction, 320);
  };

  return (
    <section className="wayon-section overflow-hidden bg-[color:var(--background)] px-0 py-16 md:py-24">
      <div className="mx-auto max-w-[1920px]">
        {/* Header */}
        <header className="mb-10 px-4 text-center md:mb-16">
          <div className="mx-auto max-w-[760px]">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="wayon-title"
            >
              {copy.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="wayon-copy mx-auto mt-5 max-w-[680px]"
            >
              {copy.description}
            </motion.p>
          </div>
        </header>

        {/* Desktop Expandable Accordion Gallery */}
        <div className="hidden h-[65vh] min-h-[500px] max-h-[700px] w-full gap-2 px-4 md:flex lg:gap-4 lg:px-8">
          {items.map((product, index) => {
            const isActive = activeIndex === index;

            return (
              <motion.div
                key={product.title}
                layout
                onClick={() => setActiveIndex(index)}
                onHoverStart={() => setActiveIndex(index)}
                initial={false}
                animate={{
                  flex: isActive ? 6 : 1,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 30,
                  mass: 1.2,
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-neutral-200 transition-shadow duration-500 hover:shadow-2xl ${
                  isActive ? "shadow-xl" : ""
                }`}
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                  sizes={isActive ? "50vw" : "15vw"}
                  priority={isActive}
                />

                {/* Gradient Overlay for Text Visibility */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 ${
                    isActive ? "opacity-100" : "opacity-40 group-hover:opacity-60"
                  }`}
                />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
                  {/* Expanded Content */}
                  <div
                    className={`overflow-hidden transition-all duration-500 ${
                      isActive
                        ? "translate-y-0 opacity-100"
                        : "translate-y-8 opacity-0 pointer-events-none"
                    }`}
                  >
                    <h3 className="mb-3 text-2xl font-medium tracking-wide text-white lg:text-3xl">
                      {product.title}
                    </h3>
                    <p className="mb-6 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80 lg:text-base">
                      {product.description}
                    </p>
                    <Link
                      href={product.href}
                      className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/20 px-6 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)]"
                    >
                      {copy.detailLabel}
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  {/* Vertical Title (when collapsed) */}
                  <div
                    className={`absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col justify-end transition-opacity duration-500 ${
                      isActive ? "pointer-events-none opacity-0" : "delay-200 opacity-100"
                    }`}
                  >
                    <h3
                      className="whitespace-nowrap text-sm font-medium tracking-wider text-white lg:text-base"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        transform: "rotate(180deg)",
                      }}
                    >
                      {product.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Carousel (Enhanced Full-width Snap) */}
        <div className="relative md:hidden">
          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-8 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map((product) => (
              <Link
                key={product.title}
                href={product.href}
                className="relative shrink-0 snap-center w-[85vw] aspect-[4/5] overflow-hidden rounded-2xl shadow-lg"
              >
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  sizes="85vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6">
                  <h3 className="mb-2 text-xl font-medium text-white">
                    {product.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-white/80">
                    {product.description}
                  </p>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm text-white backdrop-blur-md">
                    {copy.detailLabel}
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 px-4">
            <button
              onClick={() => scrollByAmount("prev")}
              className="flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white"
              aria-label={copy.previousLabel}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              onClick={() => scrollByAmount("next")}
              className="flex size-12 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 shadow-sm transition-colors hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white"
              aria-label={copy.nextLabel}
            >
              <ChevronRight className="size-5" />
            </button>
          </div>
        </div>

        {/* View All Products Link (Desktop) */}
        <div className="mt-12 hidden justify-center md:flex">
          <Link href="/products" className="wayon-button-link text-[15px]">
            {copy.detailLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
