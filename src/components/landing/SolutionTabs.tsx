"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

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

function useMatchMedia(query: string): boolean {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      return () => mq.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

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
  const isLargeViewport = useMatchMedia("(min-width: 1024px)");
  const sectionRef = useRef<HTMLElement>(null);
  const scrollDriven = isLargeViewport && !shouldReduce && items.length > 1;

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!scrollDriven) return;
    const next = Math.min(
      items.length - 1,
      Math.max(0, Math.floor(progress * items.length))
    );
    setActiveIndex((current) => (current === next ? current : next));
  });

  useEffect(() => {
    if (scrollDriven) return;
    if (isPaused || shouldReduce || items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((current) => getWrappedIndex(current, items.length, "next"));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, items.length, scrollDriven, shouldReduce]);

  const handleTabSelect = (index: number): void => {
    if (!scrollDriven || !sectionRef.current || items.length <= 1) {
      setActiveIndex(index);
      return;
    }
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const scrollableHeight = rect.height - window.innerHeight;
    const ratio = index / items.length + 1 / (items.length * 2);
    window.scrollTo({
      top: sectionTop + scrollableHeight * ratio,
      behavior: "smooth",
    });
  };

  return (
    <section
      ref={sectionRef}
      style={
        scrollDriven ? { height: `${items.length * 100}vh` } : undefined
      }
      className="relative w-full bg-[color:var(--primary)]"
    >
      <motion.div
        className="relative h-screen min-h-[700px] max-h-[1000px] w-full overflow-hidden lg:sticky lg:top-0"
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
          <div className="absolute inset-0 bg-[#002b50]/10" />
          <div className="absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-[#002b50]/34 via-[#002b50]/12 to-transparent" />
          <div className="absolute inset-y-0 left-0 w-[58%] bg-gradient-to-r from-[#002b50]/28 via-[#002b50]/10 to-transparent" />
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
              <h3 className="mb-6 text-[clamp(2.5rem,6vw,5.5rem)] font-light uppercase leading-[1.1] tracking-wide text-white drop-shadow-[0_4px_18px_rgba(0,43,80,0.45)]">
                {activeItem.title}
              </h3>
              <p className="mb-10 max-w-xl text-[15px] leading-[1.8] text-white/90 drop-shadow-[0_2px_10px_rgba(0,43,80,0.45)] lg:text-[16px]">
                {activeItem.description}
              </p>
              <Link href={activeItem.href} className="group relative inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-white pb-3 w-fit">
                <span className="relative z-10">{formatCopy(copy.ctaTemplate, { title: activeItem.title })}</span>
                <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/30 transition-colors duration-300 group-hover:bg-white" />
                <ArrowRight className="size-4 relative z-10 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-x-2" />
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
                  onClick={() => handleTabSelect(index)}
                  className={`text-left lg:text-right group flex items-center lg:flex-row-reverse gap-4 md:gap-6 transition-opacity duration-500 w-full lg:w-auto ${isActive ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
                >
                  <span className={`text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-wider uppercase transition-[transform,color] duration-500 whitespace-nowrap ${isActive ? "text-white translate-x-2 lg:-translate-x-2" : "text-white/60"}`}>
                    {solution.label}
                  </span>
                  <span className={`hidden h-[1px] w-16 origin-left bg-white transition-transform duration-500 md:block ${isActive ? "scale-x-100" : "scale-x-0"}`} />
                </button>
              )
            })}
          </div>
        </div>
      </div>
      </motion.div>
    </section>
  );
}
