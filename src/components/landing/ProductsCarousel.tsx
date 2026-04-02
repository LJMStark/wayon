"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getHomeProducts } from "@/data/home";
import { useTranslations } from "next-intl";

export function ProductsCarousel() {
  const t = useTranslations();
  const homeProductsData = getHomeProducts(t);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "next" | "prev") => {
    const container = scrollerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction === "next" ? 360 : -360,
      behavior: "smooth",
    });
  };

  return (
    <section className="wayon-section overflow-hidden bg-[color:var(--background)]">
      <div className="wayon-container">
        <header className="mb-12 text-center md:mb-14">
          <div className="mx-auto max-w-[760px]">
            <h2 className="wayon-title">
              <strong>WAYON</strong> PRODUCT
            </h2>
            <p className="wayon-copy mx-auto mt-5 max-w-[680px]">
              Wayon Stone&apos;s main product portfolio includes quartz stone, zero-silica stone,
              terrazzo, flexible stone, marble, artificial marble, gem stone, porcelain slabs,
              cement stone, and other natural and engineered stone materials.
            </p>
            <Link href="/products" className="wayon-button-link mt-7 text-[15px]">
              Detail
            </Link>
          </div>
        </header>

        <div className="relative">
          <button
            type="button"
            onClick={() => scrollByAmount("prev")}
            className="absolute left-0 top-1/2 z-20 hidden size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#aac0d6] bg-white/90 text-[color:var(--primary)] transition-colors hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white md:flex"
            aria-label="Previous products"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("next")}
            className="absolute right-0 top-1/2 z-20 hidden size-14 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#aac0d6] bg-white/90 text-[color:var(--primary)] transition-colors hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white md:flex"
            aria-label="Next products"
          >
            <ChevronRight className="size-5" />
          </button>
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-16 bg-gradient-to-r from-white to-transparent md:block" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 hidden w-16 bg-gradient-to-l from-white to-transparent md:block" />

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-1 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-6"
          >
            {homeProductsData.map((product) => (
              <Link
                key={product.title}
                href={product.href}
                className="w-[min(20.75rem,78vw)] shrink-0 snap-start"
              >
                <article className="group flex flex-col-reverse transition-transform duration-500 ease-[cubic-bezier(0.28,0.2,0,1)] hover:-translate-y-6">
                  <header className="mt-6">
                    <h3 className="truncate text-center text-[18px] font-light leading-[30px] text-[#252525] transition-all duration-500 group-hover:text-[22px] group-hover:font-medium md:group-hover:text-[24px]">
                      {product.title}
                    </h3>
                  </header>

                  <div className="relative overflow-hidden bg-white shadow-[0_0_1rem_0_rgba(0,0,0,0.1)]">
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[color:var(--primary)] via-[#114168]/80 to-transparent px-5 py-6 opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <p className="text-[14px] leading-[1.55] text-white">
                        {product.description}
                      </p>
                    </div>

                    <div className="relative aspect-[33/42]">
                      <Image
                        src={product.image}
                        alt={product.title}
                        fill
                        sizes="(max-width: 768px) 78vw, 332px"
                        className="object-cover"
                      />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 md:hidden">
          <button
            type="button"
            onClick={() => scrollByAmount("prev")}
            className="flex size-12 items-center justify-center rounded-full border border-[#aac0d6] bg-white text-[color:var(--primary)] transition-colors hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white"
            aria-label="Previous products"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount("next")}
            className="flex size-12 items-center justify-center rounded-full border border-[#aac0d6] bg-white text-[color:var(--primary)] transition-colors hover:border-[color:var(--primary)] hover:bg-[color:var(--primary)] hover:text-white"
            aria-label="Next products"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
