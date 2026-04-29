"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

import type { ProductItem } from "@/data/home";
import type { ProductsCarouselCopy } from "@/features/home/types";
import { Link } from "@/i18n/routing";

import { scrollContainerByDirection } from "./carouselUtils";

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
  const shouldReduce = useReducedMotion();

  const scrollByAmount = (direction: "prev" | "next"): void => {
    scrollContainerByDirection(scrollerRef.current, direction, 320);
  };

  return (
    <section className="relative z-0 overflow-hidden px-4 py-24 lg:py-32">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.5fr] gap-12 lg:gap-16">

          {/* Sticky Header */}
          <div className="flex flex-col xl:sticky xl:top-32 h-fit z-10">
            <motion.h2
              initial={shouldReduce ? false : { opacity: 0, x: -30 }}
              whileInView={shouldReduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-6 whitespace-pre-line text-[clamp(3.5rem,7vw,6rem)] font-light uppercase leading-[0.95] tracking-[0] text-[color:var(--primary)]"
            >
              {copy.title}
            </motion.h2>
            <motion.p
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="mb-12 max-w-md text-[15px] leading-[1.8] text-[#4a4a4a]"
            >
              {copy.description}
            </motion.p>

            <motion.div
              initial={shouldReduce ? false : { opacity: 0 }}
              whileInView={shouldReduce ? undefined : { opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="hidden xl:block"
            >
              <Link href="/products" className="group relative inline-flex w-fit items-center gap-4 pb-3 text-sm uppercase tracking-[0.2em] text-[color:var(--primary)]">
                <span className="relative z-10">{copy.detailLabel}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[color:var(--primary)]/35 transition-colors duration-300 group-hover:bg-[color:var(--primary)]" />
                <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </div>

          {/* Desktop Expandable Accordion Gallery */}
          <div className="hidden h-[75vh] min-h-[600px] max-h-[850px] w-full gap-2 xl:flex xl:gap-3">
            {items.map((product, index) => {
              const isActive = activeIndex === index;

              return (
                <div
                  key={product.title}
                  onClick={() => setActiveIndex(index)}
                  onMouseEnter={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (!isActive && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  role={isActive ? "group" : "button"}
                  tabIndex={isActive ? -1 : 0}
                  aria-label={isActive ? undefined : product.title}
                  // Native CSS transition on flex-grow lets the browser
                  // batch the row reflow once per frame instead of paying
                  // framer-motion's per-frame layout dispatch on a 75vh
                  // container of 5 image cards.
                  style={{
                    flexGrow: isActive ? 6 : 1,
                    transitionProperty: "flex-grow, opacity, border-color",
                    transitionDuration: "500ms",
                    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  className={`group relative basis-0 cursor-pointer overflow-hidden border border-[#002b50]/10 bg-white shadow-[0_24px_80px_-56px_rgba(0,43,80,0.42)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--primary)] ${
                    isActive ? "opacity-100" : "opacity-80 hover:opacity-100 hover:border-[#002b50]/25"
                  }`}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:transform-none"
                    sizes={isActive ? "40vw" : "10vw"}
                    priority={isActive}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                    <div
                      aria-hidden
                      className={`absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#002b50]/72 via-[#002b50]/24 to-transparent transition-opacity duration-700 ${
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-70"
                      }`}
                    />
                    {/* Expanded Content */}
                    <div
                      className={`relative z-10 overflow-hidden transition-[transform,opacity] duration-700 ease-[0.16,1,0.3,1] ${
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-12 opacity-0 pointer-events-none"
                      }`}
                    >
                      <h3 className="mb-4 text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-wide text-white capitalize leading-[1.1]">
                        {product.title}
                      </h3>
                      <p className="mb-8 line-clamp-2 max-w-xl text-[15px] leading-relaxed text-white/70">
                        {product.description}
                      </p>
                      <Link
                        href={product.href}
                        className="inline-flex items-center gap-3 text-xs tracking-[0.2em] uppercase text-white/90 hover:text-white transition-colors"
                      >
                        <span className="border-b border-white/30 pb-1">{copy.detailLabel}</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>

                    {/* Collapsed title (Vertical text) */}
                    <div
                      aria-hidden
                      className={`absolute inset-0 flex justify-center items-end pb-12 transition-opacity duration-500 ${
                        isActive ? "pointer-events-none opacity-0" : "delay-300 opacity-100"
                      }`}
                    >
                      <span className="whitespace-nowrap text-[13px] tracking-[0.3em] uppercase text-white/80 -rotate-90 origin-center translate-y-1/2">
                        {product.title}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Carousel */}
          <div className="relative xl:hidden">
            <div
              ref={scrollerRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {items.map((product) => (
                <Link
                  key={product.title}
                  href={product.href}
                  className="group relative aspect-[3/4] w-[85vw] shrink-0 snap-center overflow-hidden border border-[#002b50]/10 bg-white shadow-[0_24px_80px_-56px_rgba(0,43,80,0.42)] md:w-[60vw]"
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 85vw, 60vw"
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <div
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-[#002b50]/72 via-[#002b50]/24 to-transparent"
                    />
                    <h3 className="relative z-10 mb-3 text-2xl font-light tracking-wide text-white md:text-3xl">
                      {product.title}
                    </h3>
                    <p className="relative z-10 mb-6 line-clamp-2 text-sm leading-relaxed text-white/80">
                      {product.description}
                    </p>
                    <span className="relative z-10 inline-flex w-fit items-center gap-3 text-xs uppercase tracking-[0.2em] text-white">
                      <span className="border-b border-white/30 pb-1">{copy.detailLabel}</span>
                      <ArrowRight className="size-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 mt-2">
              <button
                type="button"
                onClick={() => scrollByAmount("prev")}
                className="flex size-12 items-center justify-center border border-[#002b50]/20 bg-white/45 text-[color:var(--primary)] transition-colors hover:bg-[color:var(--primary)] hover:text-white"
                aria-label={copy.previousLabel}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("next")}
                className="flex size-12 items-center justify-center border border-[#002b50]/20 bg-white/45 text-[color:var(--primary)] transition-colors hover:bg-[color:var(--primary)] hover:text-white"
                aria-label={copy.nextLabel}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-8">
              <Link href="/products" className="group relative inline-flex w-fit items-center gap-4 pb-3 text-xs uppercase tracking-[0.2em] text-[color:var(--primary)]">
                <span className="relative z-10">{copy.detailLabel}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-[color:var(--primary)]/35 transition-colors duration-300 group-hover:bg-[color:var(--primary)]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
