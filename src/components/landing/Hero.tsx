"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { HERO_SLIDES } from "@/data/home";

export function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="relative aspect-[1920/850] min-h-[260px] w-full md:min-h-[420px]">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-700 ${index === activeSlide ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            {slide.type === "video" ? (
              <video
                className="size-full object-cover"
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
                className="object-cover"
                preload={index === 1}
              />
            )}
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 md:bottom-8">
        {HERO_SLIDES.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveSlide(index)}
            className={`h-[6px] rounded-full transition-all ${index === activeSlide ? "w-10 bg-white" : "w-10 bg-white/35"}`}
            aria-label={`Go to hero slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
