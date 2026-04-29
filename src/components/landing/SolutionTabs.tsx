"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

import type { SolutionItem } from "@/data/home";
import type { SolutionTabsCopy } from "@/features/home/types";
import { formatCopy } from "@/data/siteCopy";
import { Link } from "@/i18n/routing";

import { getWrappedIndex } from "./carouselUtils";

type SolutionTabsProps = {
  title: string;
  description: string;
  items: SolutionItem[];
  copy: SolutionTabsCopy;
};

export function SolutionTabs({
  title,
  description,
  items,
  copy,
}: SolutionTabsProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const activeItem = items[activeIndex];
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (isPaused || shouldReduce || items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => getWrappedIndex(current, items.length, "next"));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, items.length, shouldReduce]);

  return (
    <motion.section
      className="relative h-screen min-h-[700px] max-h-[1000px] w-full bg-[#09090b] overflow-hidden"
      initial={shouldReduce ? false : { opacity: 0 }}
      whileInView={shouldReduce ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1 }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images */}
      <AnimatePresence mode="sync">
        <motion.div
          key={activeItem.label}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={activeItem.image}
            alt={activeItem.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority={activeIndex === 0}
          />
          {/* High contrast gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent opacity-90" />
        </motion.div>
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 mx-auto max-w-[90rem] h-full flex flex-col justify-between px-6 lg:px-12 py-24">

        <header className="max-w-2xl">
          <h2 className="text-white/60 text-xs tracking-[0.3em] uppercase mb-4">{title}</h2>
          <p className="text-white text-[15px] leading-relaxed max-w-md">{description}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-12 lg:gap-24 items-end mb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <h3 className="text-[clamp(2.5rem,6vw,5.5rem)] font-light tracking-wide text-white mb-6 uppercase leading-[1.1]">
                {activeItem.title}
              </h3>
              <p className="text-[15px] lg:text-[16px] leading-[1.8] text-white/80 mb-10 max-w-xl">
                {activeItem.description}
              </p>
              <Link href={activeItem.href} className="group relative inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-white pb-3 w-fit">
                <span className="relative z-10">{formatCopy(copy.ctaTemplate, { title: activeItem.title })}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/30 transition-colors duration-300 group-hover:bg-white" />
                <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Minimalist Tabs list */}
          <div className="flex flex-col gap-6 items-start lg:items-end w-full lg:mb-4" role="tablist">
            {items.map((solution, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={solution.label}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveIndex(index)}
                  className={`text-left lg:text-right group flex items-center lg:flex-row-reverse gap-4 md:gap-6 transition-all duration-500 w-full lg:w-auto ${isActive ? "opacity-100" : "opacity-40 hover:opacity-100"}`}
                >
                  <span className={`text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-wider uppercase transition-all duration-500 whitespace-nowrap ${isActive ? "text-white translate-x-2 lg:-translate-x-2" : "text-white/60"}`}>
                    {solution.label}
                  </span>
                  <span className={`h-[1px] transition-all duration-500 hidden md:block ${isActive ? "w-16 bg-white" : "w-0 bg-transparent"}`} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
