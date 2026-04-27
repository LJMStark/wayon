"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

import { ParallaxImage } from "@/components/ui/ParallaxImage";
import type { AboutAlbumItem } from "@/data/home";
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

function getThumbnailClassName(isActive: boolean): string {
  if (isActive) {
    return "relative overflow-hidden border border-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.65)] transition-all";
  }

  return "relative overflow-hidden border border-white/20 transition-all";
}

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
  const activeItem = items[activeIndex];
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (isPaused || items.length <= 1 || shouldReduce) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getWrappedIndex(current, items.length, "next"));
    }, 2000);

    return () => window.clearInterval(timer);
  }, [items.length, isPaused, shouldReduce]);

  const changeActiveIndex = (direction: CarouselDirection): void => {
    setActiveIndex((current) => getWrappedIndex(current, items.length, direction));
  };

  return (
    <motion.section
      className="relative pb-12 md:pb-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      initial={shouldReduce ? false : { opacity: 0, y: 24 }}
      whileInView={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="wayon-container relative">
        <div className="relative aspect-[12/5] min-h-[420px] overflow-hidden bg-[color:var(--surface)] md:min-h-[540px]">
          <ParallaxImage
            key={activeItem.image}
            src={activeItem.image}
            alt={activeItem.title}
            sizes="(max-width: 768px) 100vw, 1140px"
            className={`object-cover ${activeItem.image.includes('zyl-fashion-pavilion.png') ? 'object-top' : 'object-center'}`}
            intensity={70}
          />

          <div className="absolute inset-y-0 right-0 flex w-full items-center px-4 md:justify-end md:px-0">
            <article className="w-full max-w-[520px] bg-black/40 p-6 text-white backdrop-blur-[2px] md:mr-[13.5%] md:p-8">
              <header className="mb-4">
                <h3 className="text-[24px] font-medium md:text-[30px]">{activeItem.title}</h3>
              </header>
              <p className="text-[15px] font-normal leading-[1.7] text-white/90">
                {activeItem.text}
              </p>
              <footer className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Link href={activeItem.href} className="wayon-button-link text-[15px] text-white">
                  {copy.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
                <div className="flex items-center gap-2">
                  {NAVIGATION_BUTTONS.map(({ direction, ariaLabelKey, Icon }) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => changeActiveIndex(direction)}
                      className="flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10"
                      aria-label={getCarouselActionLabel(copy, ariaLabelKey)}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </footer>
            </article>
          </div>
        </div>

        <div className="mt-4 grid gap-3 px-[15px] sm:grid-cols-2 md:absolute md:bottom-10 md:left-1/2 md:w-[71.875%] md:-translate-x-1/2 md:grid-cols-6 md:px-0">
          {items.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={getThumbnailClassName(index === activeIndex)}
            >
              <div className="relative aspect-[3/2]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 180px"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
