"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import type { HeroSlide } from "@/data/home";
import { formatCopy } from "@/data/siteCopy";
import { Link } from "@/i18n/routing";

import { getWrappedIndex } from "./carouselUtils";

function getSlideClassName(isActive: boolean): string {
  if (isActive) {
    return "absolute inset-0 transition-opacity duration-[1200ms] ease-out opacity-100";
  }

  return "absolute inset-0 pointer-events-none transition-opacity duration-[1200ms] ease-out opacity-0";
}

function getIndicatorClassName(isActive: boolean): string {
  if (isActive) {
    return "h-[3px] w-10 bg-white transition-[width,background-color] duration-300";
  }

  return "h-[3px] w-6 bg-white/35 transition-[width,background-color] duration-300 hover:bg-white/60";
}

function getSlideKey(slide: HeroSlide, index: number): string {
  return `${slide.type}:${slide.src}:${index}`;
}

type HeroProps = {
  slides: HeroSlide[];
  slideLabel: string;
};

export function Hero({ slides, slideLabel }: HeroProps): React.JSX.Element {
  const t = useTranslations("Hero");
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused || slides.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => getWrappedIndex(current, slides.length, "next"));
    }, 7000);

    return () => window.clearInterval(timer);
  }, [slides.length, isPaused]);

  return (
    <section
      className="relative overflow-hidden bg-[color:var(--primary)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative aspect-[1920/850] min-h-[420px] w-full md:min-h-[520px]">
        {slides.map((slide, index) => (
          <div
            key={getSlideKey(slide, index)}
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
                preload="metadata"
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
                priority={index === 0}
              />
            )}
          </div>
        ))}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-transparent rtl:bg-gradient-to-l"
        />

        <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-20 md:pb-28 lg:pb-32">
          <div className="wayon-container-wide">
            <div className="max-w-3xl space-y-6 text-white">
              <h1 className="wayon-title text-white whitespace-pre-line">
                <span className="block">{t("titleLine1")}</span>
                <span className="block">
                  <strong>{t("titleLine2")}</strong>
                </span>
              </h1>
              <p className="wayon-copy text-white/85 max-w-xl text-base md:text-[17px]">
                {t("subtitle")}
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/products" className="wayon-cta-primary">
                  {t("exploreProducts")}
                </Link>
                <Link href="/contact" className="wayon-cta-ghost text-white">
                  {t("getFreeSample")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-6 z-20 flex items-center justify-center gap-3 md:bottom-10">
          {slides.map((slide, index) => (
            <button
              key={getSlideKey(slide, index)}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={getIndicatorClassName(index === activeSlide)}
              aria-label={formatCopy(slideLabel, { index: index + 1 })}
              aria-current={index === activeSlide ? "true" : undefined}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
