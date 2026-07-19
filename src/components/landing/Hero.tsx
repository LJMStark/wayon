"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useReducedMotion,
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

import type { HeroSlide } from "@/data/home";
import { HOME_HERO_FALLBACK_IMAGE } from "@/features/home/model/homeVisuals";
import { Link } from "@/i18n/routing";

import { getWrappedIndex } from "./carouselUtils";
import { useCanAnimate, useMotionTransition } from "./useCanAnimate";

type HeroProps = {
  slides: HeroSlide[];
};

type HeroVideoMetadata = {
  src: string;
  duration: number;
};

function getSlideVideoSourceKey(slide: HeroSlide | undefined): string {
  return slide?.sources?.map((source) => source.src).join("|") || slide?.src || "";
}

const HERO_TITLE_CONTAINER: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const HERO_TITLE_LINE: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%" },
};

const IMAGE_SLIDE_DURATION_SECONDS = 6;
// Defer loading the hero MP4 sources until ~the LCP frame has painted so
// the 720p/1080p video bytes (1.77MB / 9.37MB) don't compete with the
// poster image for first-paint bandwidth on slow 4G. `requestIdleCallback`
// fires when the main thread is idle, which on mobile networks lands well
// after first paint; the `timeout` fallback caps the wait so video still
// arrives quickly on a fast connection.
const VIDEO_LOAD_IDLE_TIMEOUT_MS = 2500;

export function Hero({ slides }: HeroProps): React.JSX.Element {
  const t = useTranslations("Hero");
  const lockMiddleDot = (text: string): string => text.replace(/ · /g, " · ");
  const titleLine1 = lockMiddleDot(t("titleLine1").trim());
  const tagline = lockMiddleDot(t("tagline").trim());
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeVideoMetadata, setActiveVideoMetadata] =
    useState<HeroVideoMetadata | null>(null);
  // Gates rendering of <video> src / <source> children. False on first
  // paint (so the browser only fetches the poster image, not the MP4),
  // then flipped true once the main thread idles. See
  // VIDEO_LOAD_IDLE_TIMEOUT_MS above for the fast-network cap.
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const shouldReduce = useReducedMotion();
  // SSR-safe: false until after mount so initial styles match the server HTML.
  const canAnimate = useCanAnimate();
  const titleLineTransition = useMotionTransition({
    duration: 1.1,
    ease: [0.16, 1, 0.3, 1] as const,
  });
  const sectionRef = useRef<HTMLElement>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroContentY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1, 0]);

  const slide = slides[activeSlide] || slides[0];
  const slideVideoSourceKey = getSlideVideoSourceKey(slide);
  const progressDuration =
    slide?.type === "video" && activeVideoMetadata?.src === slideVideoSourceKey
      ? activeVideoMetadata.duration
      : IMAGE_SLIDE_DURATION_SECONDS;
  const goToNextSlide = useCallback(() => {
    if (slides.length <= 1 || shouldReduce) {
      return;
    }

    setActiveSlide((current) => getWrappedIndex(current, slides.length, "next"));
  }, [slides.length, shouldReduce]);

  useEffect(() => {
    if (slides.length <= 1 || shouldReduce || slide?.type === "video") {
      return;
    }

    const timer = window.setTimeout(
      () => goToNextSlide(),
      IMAGE_SLIDE_DURATION_SECONDS * 1000
    );

    return () => window.clearTimeout(timer);
  }, [slides.length, shouldReduce, slide?.type, activeSlide, goToNextSlide]);

  // Wait for the main thread to idle before allowing the <video> sources
  // to mount. On slow 4G this keeps the 1.77MB MP4 from racing the 156KB
  // poster image for first-paint bandwidth, which was the dominant LCP
  // pressure measured 2026-05-28 (PSI mobile LCP 11.3s, hero video the
  // identified LCP element / network blocker). requestIdleCallback fires
  // after first paint completes; the 2.5s timeout caps the wait on fast
  // networks where idle time arrives late. Server-rendered output is
  // unaffected — shouldLoadVideo is hydration-only state.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const trigger = () => setShouldLoadVideo(true);
    const idleApi = (
      window as Window & {
        requestIdleCallback?: (
          cb: IdleRequestCallback,
          opts?: IdleRequestOptions
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      }
    );
    if (typeof idleApi.requestIdleCallback === "function") {
      const id = idleApi.requestIdleCallback(trigger, {
        timeout: VIDEO_LOAD_IDLE_TIMEOUT_MS,
      });
      return () => {
        idleApi.cancelIdleCallback?.(id);
      };
    }
    const id = window.setTimeout(trigger, 1500);
    return () => {
      window.clearTimeout(id);
    };
  }, []);

  useEffect(() => {
    const video = activeVideoRef.current;

    // Video sources only mount once shouldLoadVideo flips true; calling
    // play() before that is a no-op the browser logs as an error. Wait
    // for both conditions before triggering playback.
    if (!video || slide?.type !== "video" || !shouldLoadVideo) {
      return;
    }

    video.play().catch(() => {
      // Browsers can still block autoplay in edge cases; the poster frame remains visible.
    });
  }, [slide?.src, slide?.type, shouldLoadVideo]);

  return (
    <section
      ref={sectionRef}
      className="zyl-home-hero relative -mt-[var(--header-height)] w-full overflow-hidden bg-[color:var(--primary)]"
    >
      {/*
        Poster base layer. Paints the hero image immediately as a real, always-
        opaque element that consumes the layout <head> preload of the 156KB
        WebP, so first paint never depends on the video (a <video poster> both
        loads late and is not an LCP candidate in Chrome). Kept OUTSIDE
        AnimatePresence so its opacity never starts at 0; the <video> mounts on
        top and covers it once it plays. (The LCP element itself is the heading
        text — see the initial={false} note below.)
      */}
      {slide?.type === "video" && slide.poster ? (
        <Image
          src={slide.poster}
          alt={slide.alt || ""}
          fill
          sizes="100vw"
          priority
          className="z-0 object-cover"
        />
      ) : null}
      <AnimatePresence initial={false}>
        <motion.div
          key={`${activeSlide}-${slide?.src}`}
          className="absolute inset-0 z-0"
          // AnimatePresence initial={false}: first paint skips enter styles so
          // SSR/client both show the active slide at full opacity.
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={
            shouldReduce
              ? { duration: 0 }
              : { duration: 1.8, ease: [0.25, 0.1, 0.25, 1] }
          }
        >
          {slide?.type === "video" ? (
            // The <video> element is not rendered until shouldLoadVideo flips
            // (main-thread idle / 2.5s). Rendering it up front — even transparent
            // with a deferred src — puts a <video> on top of the poster <img>,
            // and Chrome then excludes the covered <img> as an LCP candidate,
            // which pushed LCP onto the late-painting heading text (24.5s on
            // slow 4G). Mounting the video only after first paint keeps the
            // poster <img> as the topmost visible element, so it is the LCP.
            shouldLoadVideo ? (
              <video
                ref={activeVideoRef}
                className="size-full object-cover"
                autoPlay
                muted
                playsInline
                preload="none"
                loop={slides.length <= 1}
                // No `poster`: the base <img> above already shows it and is the
                // LCP element. The video paints real frames on top once ready.
                src={!slide.sources ? slide?.src : undefined}
                onEnded={() => {
                  goToNextSlide();
                }}
                onLoadedMetadata={(event) => {
                  const { duration } = event.currentTarget;

                  if (Number.isFinite(duration) && duration > 0) {
                    setActiveVideoMetadata({ src: slideVideoSourceKey, duration });
                  }
                }}
              >
                {slide.sources?.map((source) => (
                  <source
                    key={`${source.media || "default"}-${source.src}`}
                    src={source.src}
                    media={source.media}
                    type={source.type}
                  />
                ))}
              </video>
            ) : null
          ) : (
            <Image
              src={slide?.src || HOME_HERO_FALLBACK_IMAGE}
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
        className="zyl-home-hero__content absolute inset-0 z-10 flex flex-col justify-end"
        style={
          // Only attach scroll MotionValues after mount — identical absence on
          // SSR and first client paint avoids style attribute mismatches.
          canAnimate
            ? { y: heroContentY, opacity: heroContentOpacity, willChange: "transform, opacity" }
            : undefined
        }
      >
        <div className="zyl-home-hero__inner mx-auto w-full max-w-[90rem]">
          <motion.div
            variants={HERO_TITLE_CONTAINER}
            // Render the heading at its final position on the server (initial
            // === animate target) instead of `initial="hidden"`. With "hidden"
            // the lines were SSR'd at translateY(110%) and clipped by the
            // overflow-hidden wrapper, so the heading — the hero's largest
            // element and the actual LCP — only became visible once framer-motion
            // hydrated. On slow 4G hydration lands very late, which is what
            // pushed LCP to 24.5s. `initial={false}` paints the text at FCP.
            initial={false}
            animate="show"
            transition={
              shouldReduce
                ? { duration: 0, staggerChildren: 0, delayChildren: 0 }
                : undefined
            }
          >
            <h1
              aria-label={[titleLine1, tagline].filter(Boolean).join(" — ")}
              className="zyl-hero-title text-white"
            >
              <span className="block overflow-hidden">
                <motion.span
                  variants={HERO_TITLE_LINE}
                  transition={titleLineTransition}
                  className="zyl-home-hero__title-line zyl-home-hero__title-line--single block"
                >
                  {titleLine1}
                </motion.span>
              </span>
              {tagline ? (
                <span className="zyl-home-hero__tagline-wrap block overflow-hidden">
                  <motion.span
                    variants={HERO_TITLE_LINE}
                    transition={titleLineTransition}
                    className="zyl-home-hero__tagline block opacity-90"
                  >
                    {tagline}
                  </motion.span>
                </span>
              ) : null}
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={
              shouldReduce ? { duration: 0 } : { duration: 1, delay: 0.8 }
            }
            className="zyl-home-hero__actions flex flex-col items-start sm:flex-row sm:items-center"
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
              <motion.div
                key={activeSlide}
                className="absolute inset-y-0 left-0 w-full origin-left bg-white"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  shouldReduce
                    ? { duration: 0 }
                    : { duration: progressDuration, ease: "linear" }
                }
              />
            </div>
            <span className="text-white/40 text-xs font-medium tracking-widest">0{slides.length}</span>
          </div>
        </div>
      )}
    </section>
  );
}
