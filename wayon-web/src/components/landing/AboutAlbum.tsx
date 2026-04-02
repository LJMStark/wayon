"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { ABOUT_ALBUM } from "@/data/home";

export function AboutAlbum() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = ABOUT_ALBUM[activeIndex];

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + ABOUT_ALBUM.length) % ABOUT_ALBUM.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % ABOUT_ALBUM.length);
  };

  return (
    <section className="relative pb-12 md:pb-0">
      <div className="wayon-container relative">
        <div className="relative aspect-[12/5] min-h-[420px] overflow-hidden bg-[color:var(--surface)] md:min-h-[540px]">
          <Image
            src={activeItem.image}
            alt={activeItem.title}
            fill
            sizes="(max-width: 768px) 100vw, 1140px"
            className="object-cover"
          />

          <div className="absolute inset-y-0 right-0 flex w-full items-center px-4 md:justify-end md:px-0">
            <article className="w-full max-w-[520px] bg-black/40 p-6 text-white backdrop-blur-[2px] md:mr-[13.5%] md:p-8">
              <header className="mb-4">
                <h3 className="text-[24px] font-medium md:text-[30px]">{activeItem.title}</h3>
              </header>
              <p className="text-[15px] font-light leading-[1.7] text-white/90">
                {activeItem.text}
              </p>
              <footer className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <Link href={activeItem.href} className="wayon-button-link text-[15px] text-white">
                  Learn More About Us
                  <ArrowRight className="size-4" />
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10"
                    aria-label="Previous album item"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="flex size-10 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:bg-white/10"
                    aria-label="Next album item"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </footer>
            </article>
          </div>
        </div>

        <div className="mt-4 grid gap-3 px-[15px] sm:grid-cols-2 md:absolute md:bottom-10 md:left-1/2 md:w-[71.875%] md:-translate-x-1/2 md:grid-cols-6 md:px-0">
          {ABOUT_ALBUM.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative overflow-hidden border transition-all ${
                index === activeIndex
                  ? "border-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.65)]"
                  : "border-white/20"
              }`}
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
    </section>
  );
}
