"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { HeroSlide } from "@/data/home";
import { formatCopy } from "@/data/siteCopy";

import { getWrappedIndex } from "./carouselUtils";

function getSlideClassName(isActive: boolean): string {
  if (isActive) {
    return "absolute inset-0 transition-opacity duration-700 opacity-100";
  }

  return "absolute inset-0 pointer-events-none transition-opacity duration-700 opacity-0";
}

function getIndicatorClassName(isActive: boolean): string {
  if (isActive) {
    return "h-[6px] w-10 rounded-full bg-white transition-all";
  }

  return "h-[6px] w-10 rounded-full bg-white/35 transition-all";
}

type HeroProps = {
  slides: HeroSlide[];
  slideLabel: string;
};

export function Hero({ slides, slideLabel }: HeroProps): React.JSX.Element {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => getWrappedIndex(current, slides.length, "next"));
    }, 7000);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden">
      <div className="relative aspect-[1920/850] min-h-[260px] w-full md:min-h-[420px]">
        {slides.map((slide, index) => (
          <div
            key={slide.src}
            className={getSlideClassName(index === activeSlide)}
          >
            {slide.type === "video" ? (
              <video
                className={`size-full object-cover transition-transform duration-[7000ms] ease-linear ${
                  index === activeSlide ? "scale-105" : "scale-100"
                }`}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                src={slide.src}
              />
            ) : (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                sizes="100vw"
                className={`object-cover transition-transform duration-[7000ms] ease-linear ${
                  index === activeSlide ? "scale-105" : "scale-100"
                }`}
                preload={index === 1}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-8">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveSlide(index)}
            className={getIndicatorClassName(index === activeSlide)}
            aria-label={formatCopy(slideLabel, { index: index + 1 })}
          />
        ))}
      </div>
    </section>
  );
}
