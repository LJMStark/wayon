"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import {
  useReducedMotion,
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

import type { HeroSlide } from "@/data/home";
import { Link } from "@/i18n/routing";

import { getWrappedIndex } from "./carouselUtils";

type HeroProps = {
  slides: HeroSlide[];
};

const HERO_TITLE_CONTAINER: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const HERO_TITLE_LINE: Variants = {
  hidden: { y: "110%" },
  show: {
    y: "0%",
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Hero({ slides }: HeroProps): React.JSX.Element {
  const t = useTranslations("Hero");
  const highlightedTitleLines = t("titleLine2")
    .split("\n")
    .filter(Boolean);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const shouldReduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

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
      ref={sectionRef}
      className="wayon-home-hero relative -mt-[var(--header-height)] w-full overflow-hidden bg-[color:var(--primary)]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={`${activeSlide}-${slide?.src}`}
          className="absolute inset-0 z-0"
          style={{ willChange: "transform, opacity" }}
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
          <div className="absolute inset-0 bg-gradient-to-r from-[#002b50]/72 via-[#002b50]/28 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#002b50]/82 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      <motion.div
        className="wayon-home-hero__content absolute inset-0 z-10 flex flex-col justify-end"
        style={shouldReduce ? undefined : { y: heroContentY, opacity: heroContentOpacity, willChange: "transform, opacity" }}
      >
        <div className="wayon-home-hero__inner mx-auto w-full max-w-[90rem]">
          <motion.div
            variants={HERO_TITLE_CONTAINER}
            initial={shouldReduce ? false : "hidden"}
            animate="show"
          >
            <h1
              aria-label={[t("titleLine1"), ...highlightedTitleLines].join(" ")}
              className="wayon-hero-title text-white"
            >
              <span className="wayon-home-hero__kicker-wrap block overflow-hidden">
                <motion.span
                  variants={HERO_TITLE_LINE}
                  className="wayon-home-hero__kicker block font-light uppercase opacity-80"
                >
                  {t("titleLine1")}
                </motion.span>
              </span>
              {highlightedTitleLines.map((line) => (
                <span key={line} className="block overflow-hidden">
                  <motion.span
                    variants={HERO_TITLE_LINE}
                    className="wayon-home-hero__title-line block"
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="wayon-home-hero__actions flex flex-col items-start sm:flex-row sm:items-center"
          >
            <Link
              href="/products"
              className="group relative inline-flex items-center gap-3 px-1 py-4 text-xs uppercase tracking-[0] text-white md:text-sm"
            >
              <span className="relative z-10">{t("exploreProducts")}</span>
              <span className="pointer-events-none absolute inset-x-1 bottom-3 h-[1px] bg-white/40 transition-colors duration-300 group-hover:bg-white" />
            </Link>

            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-3 px-1 py-4 text-xs uppercase tracking-[0] text-white/60 transition-colors duration-300 hover:text-white md:text-sm"
            >
              <span className="relative z-10">{t("getFreeSample")}</span>
              <span className="pointer-events-none absolute inset-x-1 bottom-3 h-[1px] origin-left scale-x-0 bg-white transition-transform duration-500 ease-out group-hover:scale-x-100" />
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute right-6 bottom-10 md:right-16 md:bottom-16 lg:right-24 z-20 flex gap-4">
          <div className="flex items-center gap-4">
            <span className="text-white/40 text-xs font-medium tracking-widest">0{activeSlide + 1}</span>
            <div className="h-[1px] w-16 bg-white/20 relative overflow-hidden">
              {!isPaused && (
                <motion.div
                  key={activeSlide}
                  className="absolute inset-y-0 left-0 w-full origin-left bg-white"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
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
