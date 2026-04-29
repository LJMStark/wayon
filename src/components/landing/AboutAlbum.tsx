"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

import type { AboutAlbumItem } from "@/data/home";
import { formatCopy } from "@/data/siteCopy";
import type { AboutAlbumCopy } from "@/features/home/types";
import { Link } from "@/i18n/routing";

import { getWrappedIndex, type CarouselDirection } from "./carouselUtils";

const NAVIGATION_BUTTONS = [
  {
    direction: "prev",
    ariaLabelKey: "previous",
    Icon: ChevronLeft,
  },
  {
    direction: "next",
    ariaLabelKey: "next",
    Icon: ChevronRight,
  },
] as const;

type AboutAlbumProps = {
  items: AboutAlbumItem[];
  copy: AboutAlbumCopy;
};

function getCarouselActionLabel(copy: AboutAlbumCopy, key: "previous" | "next"): string {
  return key === "previous" ? copy.previousLabel : copy.nextLabel;
}

export function AboutAlbum({
  items,
  copy,
}: AboutAlbumProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (isPaused || items.length <= 1 || shouldReduce) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getWrappedIndex(current, items.length, "next"));
    }, 5000);

    return () => window.clearInterval(timer);
  }, [items.length, isPaused, shouldReduce]);

  const changeActiveIndex = (direction: CarouselDirection): void => {
    setActiveIndex((current) => getWrappedIndex(current, items.length, direction));
  };

  return (
    <motion.section
      className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-[color:var(--primary)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      initial={shouldReduce ? false : { opacity: 0 }}
      whileInView={shouldReduce ? undefined : { opacity: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 1 }}
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <div
            key={item.title}
            className={`absolute inset-0 transition-opacity duration-[1.5s] ease-[0.16,1,0.3,1] ${
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className={`object-cover transition-transform duration-[8s] ease-linear ${isActive ? "scale-105" : "scale-100"}`}
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[#002b50]/30" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,43,80,0.08)_0%,rgba(0,43,80,0.26)_100%)]" />

            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <div className={`transition-all duration-[1s] ease-[0.16,1,0.3,1] delay-300 ${isActive ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
                <h3 className="text-[clamp(2.5rem,5vw,4.5rem)] font-light tracking-widest text-white mb-6 uppercase">
                  {item.title}
                </h3>
                <p className="max-w-2xl mx-auto text-white/80 text-[15px] leading-relaxed mb-10">
                  {item.text}
                </p>
                <Link href={item.href} className="group relative inline-flex items-center gap-4 text-xs tracking-[0.2em] uppercase text-white pb-3 w-fit">
                  <span className="relative z-10">{copy.ctaLabel}</span>
                  <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/40 transition-colors duration-300 group-hover:bg-white" />
                  <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </div>
            </div>
          </div>
        );
      })}

      {items.length > 1 && (
        <div className="absolute right-6 top-6 z-20 flex items-center gap-3 md:bottom-12 md:right-12 md:top-auto">
          {NAVIGATION_BUTTONS.map(({ direction, ariaLabelKey, Icon }) => (
            <button
              key={direction}
              type="button"
              onClick={() => changeActiveIndex(direction)}
              className="flex size-12 items-center justify-center border border-white/30 bg-[#002b50]/30 text-white backdrop-blur-md transition-colors hover:bg-white hover:text-[color:var(--primary)]"
              aria-label={getCarouselActionLabel(copy, ariaLabelKey)}
            >
              <Icon className="size-5" aria-hidden="true" />
            </button>
          ))}
        </div>
      )}

      {items.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`h-[2px] transition-all duration-300 ${activeIndex === index ? "w-12 bg-white" : "w-6 bg-white/30"}`}
              aria-label={formatCopy(copy.slideLabel, { index: index + 1 })}
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}
