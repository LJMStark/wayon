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
    <section className="overflow-hidden bg-[#09090b] px-4 py-24 lg:py-32 relative z-0">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_2.5fr] gap-12 lg:gap-16">

          {/* Sticky Header */}
          <div className="flex flex-col xl:sticky xl:top-32 h-fit z-10">
            <motion.h2
              initial={shouldReduce ? false : { opacity: 0, x: -30 }}
              whileInView={shouldReduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-[clamp(3rem,6vw,5.5rem)] font-light tracking-tight text-white mb-6 uppercase leading-[0.95]"
            >
              {copy.title}
            </motion.h2>
            <motion.p
              initial={shouldReduce ? false : { opacity: 0, y: 20 }}
              whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/60 text-[15px] leading-[1.8] max-w-md mb-12"
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
              <Link href="/products" className="group relative inline-flex items-center gap-4 text-sm tracking-[0.2em] uppercase text-white pb-3 w-fit">
                <span className="relative z-10">{copy.detailLabel}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/30 transition-colors duration-300 group-hover:bg-white" />
                <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </div>

          {/* Desktop Expandable Accordion Gallery */}
          <div className="hidden h-[75vh] min-h-[600px] max-h-[850px] w-full gap-2 xl:flex xl:gap-3">
            {items.map((product, index) => {
              const isActive = activeIndex === index;

              return (
                <motion.div
                  key={product.title}
                  layout
                  onClick={() => setActiveIndex(index)}
                  onHoverStart={() => setActiveIndex(index)}
                  onKeyDown={(e) => {
                    if (!isActive && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      setActiveIndex(index);
                    }
                  }}
                  role={isActive ? "group" : "button"}
                  tabIndex={isActive ? -1 : 0}
                  aria-label={isActive ? undefined : product.title}
                  initial={false}
                  animate={{
                    flex: isActive ? 6 : 1,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 30,
                    mass: 1,
                  }}
                  className={`group relative cursor-pointer overflow-hidden bg-[#121214] border border-white/5 transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                    isActive ? "opacity-100" : "opacity-80 hover:opacity-100 hover:border-white/20"
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

                  {/* High contrast luxury gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent transition-opacity duration-700 ${
                      isActive ? "opacity-90" : "opacity-60 group-hover:opacity-40"
                    }`}
                  />

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-12">
                    {/* Expanded Content */}
                    <div
                      className={`overflow-hidden transition-all duration-700 ease-[0.16,1,0.3,1] ${
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
                </motion.div>
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
                  className="relative shrink-0 snap-center w-[85vw] md:w-[60vw] aspect-[3/4] overflow-hidden bg-[#121214] border border-white/5 group"
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    sizes="(max-width: 768px) 85vw, 60vw"
                    className="object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent opacity-90" />

                  <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                    <h3 className="mb-3 text-2xl md:text-3xl font-light tracking-wide text-white">
                      {product.title}
                    </h3>
                    <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-white/70">
                      {product.description}
                    </p>
                    <span className="inline-flex w-fit items-center gap-3 text-xs tracking-[0.2em] uppercase text-white">
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
                className="flex size-12 items-center justify-center border border-white/20 bg-transparent text-white transition-colors hover:bg-white hover:text-black"
                aria-label={copy.previousLabel}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => scrollByAmount("next")}
                className="flex size-12 items-center justify-center border border-white/20 bg-transparent text-white transition-colors hover:bg-white hover:text-black"
                aria-label={copy.nextLabel}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-8">
              <Link href="/products" className="group relative inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-white pb-3 w-fit">
                <span className="relative z-10">{copy.detailLabel}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/30 transition-colors duration-300 group-hover:bg-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
