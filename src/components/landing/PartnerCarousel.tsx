"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

import type { PartnerItem } from "@/data/home";
import type { PartnerCarouselCopy } from "@/features/home/types";

import {
  scrollContainerByDirection,
  type CarouselDirection,
} from "./carouselUtils";

const PARTNER_SECTION_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(247,250,253,0.96), rgba(247,250,253,0.96)), url('/assets/backgrounds/partner-section-bg.png')",
  backgroundPosition: "center",
  backgroundSize: "cover",
};

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

function getCarouselActionLabel(
  copy: PartnerCarouselCopy,
  key: "previous" | "next"
): string {
  return key === "previous" ? copy.previousLabel : copy.nextLabel;
}

type PartnerCarouselProps = {
  title: string;
  description: string;
  items: PartnerItem[];
  copy: PartnerCarouselCopy;
};

export function PartnerCarousel({
  title,
  description,
  items,
  copy,
}: PartnerCarouselProps): React.JSX.Element {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const timer = window.setInterval(() => {
      if (scrollerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
        // If we reached the end, scroll back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollerRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollContainerByDirection(scrollerRef.current, "next", 780);
        }
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [items.length, isPaused]);

  const scrollByAmount = (direction: CarouselDirection): void => {
    scrollContainerByDirection(scrollerRef.current, direction, 780);
  };

  return (
    <motion.section 
      className="wayon-section pb-16" 
      style={PARTNER_SECTION_STYLE}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="wayon-container">
        <header className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[780px]">
            <h2 className="wayon-title">{title}</h2>
            <p className="wayon-copy mt-5">{description}</p>
          </div>

          <div className="flex items-center gap-2">
            {NAVIGATION_BUTTONS.map(({ direction, ariaLabelKey, Icon }) => (
              <button
                key={direction}
                type="button"
                onClick={() => scrollByAmount(direction)}
                className="flex size-12 items-center justify-center bg-white text-[#333333] shadow-[0_0_1rem_rgba(0,0,0,0.08)] transition-colors hover:bg-[color:var(--primary)] hover:text-white"
                aria-label={getCarouselActionLabel(copy, ariaLabelKey)}
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </header>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {items.map((partner) => (
            <article
              key={partner.title}
              className="relative flex w-[min(76rem,92vw)] shrink-0 snap-start items-center gap-6 bg-white px-8 py-10 shadow-[0.636rem_0.636rem_1rem_0.1rem_rgba(0,0,0,0.1)] md:px-10 md:py-12"
            >
              <div className="flex size-[9rem] shrink-0 items-center justify-center rounded-full border border-[color:var(--primary)] bg-white md:size-[18rem]">
                <div className="relative size-[56px] md:size-[96px]">
                  <Image
                    src={partner.image}
                    alt={partner.title}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-[24px] font-semibold leading-[1.5] text-[#1e1e1e]">
                  {partner.title}
                </h3>
                <p className="mt-3 text-[16px] font-normal leading-[1.78] text-[#4a4a4a]">
                  {partner.description}
                </p>
              </div>

              <div className="absolute end-0 top-0 bg-[color:var(--primary)] px-5 py-4 text-[14px] font-medium text-white md:rounded-es-[3.4rem] md:px-7">
                {partner.title}
              </div>
            </article>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
