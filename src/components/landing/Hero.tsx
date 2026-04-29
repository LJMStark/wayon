"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";

import type { HeroSlide } from "@/data/home";
import { Link } from "@/i18n/routing";

import { getWrappedIndex } from "./carouselUtils";

type HeroProps = {
  slides: HeroSlide[];
};

export function Hero({ slides }: HeroProps): React.JSX.Element {
  const t = useTranslations("Hero");
  const highlightedTitleLines = t("titleLine2")
    .split("\n")
    .filter(Boolean);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    if (isPaused || slides.length <= 1 || shouldReduce) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlide((current) => getWrappedIndex(current, slides.length, "next"));
    }, 6000);

    return () => window.clearInterval(timer);
  }, [slides.length, isPaused, shouldReduce]);

  const slide = slides[activeSlide] || slides[0];

  return (
    <section
      className="relative -mt-[var(--header-height)] h-screen min-h-[700px] w-full overflow-hidden bg-[#09090b]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${activeSlide}-${slide?.src}`}
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {slide?.type === "video" ? (
            <video
              className="size-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              src={slide?.src}
            />
          ) : (
            <Image
              src={slide?.src || "/assets/hero-placeholder.jpg"}
              alt={slide?.alt || ""}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-6 pb-24 md:px-16 md:pb-32 lg:px-24 lg:pb-40">
        <div className="max-w-[90rem] w-full mx-auto space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <h1 className="wayon-hero-title text-white">
              <span className="block text-[clamp(1.5rem,3vw,2.5rem)] font-light tracking-[0.15em] opacity-80 mb-6 uppercase">
                {t("titleLine1")}
              </span>
              {highlightedTitleLines.map((line) => (
                <span
                  key={line}
                  className="block text-[clamp(3.5rem,9vw,8.5rem)] leading-[1.05] tracking-tight"
                >
                  {line}
                </span>
              ))}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-8 pt-8"
          >
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 text-xs md:text-sm tracking-[0.25em] uppercase text-white pb-2"
            >
              <span className="relative z-10">{t("exploreProducts")}</span>
              <span className="absolute bottom-0 left-0 h-[1px] w-full bg-white/40 transition-colors duration-300 group-hover:bg-white" />
            </Link>

            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-3 text-xs md:text-sm tracking-[0.25em] uppercase text-white/60 hover:text-white pb-2 transition-colors duration-300"
            >
              <span className="relative z-10">{t("getFreeSample")}</span>
              <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-white transition-all duration-500 ease-out group-hover:w-full" />
            </Link>
          </motion.div>
        </div>
      </div>

      {slides.length > 1 && (
        <div className="absolute right-6 bottom-10 md:right-16 md:bottom-16 lg:right-24 z-20 flex gap-4">
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs font-medium tracking-widest">0{activeSlide + 1}</span>
            <div className="h-[1px] w-16 bg-white/20 relative overflow-hidden">
              {!isPaused && (
                <motion.div
                  key={activeSlide}
                  className="absolute inset-y-0 left-0 bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 6, ease: "linear" }}
                />
              )}
            </div>
            <span className="text-white/40 text-xs font-medium tracking-widest">0{slides.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}
