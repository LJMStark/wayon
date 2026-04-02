"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import { getSolutions } from "@/data/home";
import { useTranslations } from "next-intl";

export function SolutionTabs() {
  const t = useTranslations();
  const solutionsData = getSolutions(t);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = solutionsData[activeIndex];

  return (
    <section className="wayon-section">
      <div className="wayon-container">
        <header className="mb-6 text-center md:mb-10">
          <h2 className="wayon-title">
            <strong>ZYL</strong> PRE-FABRICATED
          </h2>
          <p className="wayon-copy mx-auto mt-5 max-w-[780px]">
            ZYL&apos;s pre-fabricated series offers efficient construction solutions, ensuring quick
            installation and exceptional durability.
          </p>
        </header>

        <div className="relative">
          <div className="relative overflow-hidden bg-[color:var(--surface)]">
            <div className="relative aspect-[7/3] min-h-[300px]">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                sizes="(max-width: 768px) 100vw, 1140px"
                className="object-cover"
              />
            </div>

            <article className="relative z-10 w-full bg-black/40 p-6 text-white backdrop-blur-[2px] md:absolute md:left-10 md:top-1/2 md:w-[44.642857%] md:-translate-y-1/2 md:p-10">
              <header className="mb-4">
                <h3 className="text-[28px] font-medium md:text-[34px]">{activeItem.title}</h3>
              </header>
              <p className="text-[15px] font-light leading-[1.78] text-white/90">
                {activeItem.description}
              </p>
              <footer className="mt-6 flex items-center justify-between gap-4">
                <Link href={activeItem.href} className="wayon-button-link text-[15px] text-white">
                  {`Learn More [${activeItem.title}]`}
                  <ArrowRight className="size-4" />
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveIndex((current) => (current - 1 + solutionsData.length) % solutionsData.length)}
                    className="flex size-10 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white/10"
                    aria-label="Previous solution"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveIndex((current) => (current + 1) % solutionsData.length)}
                    className="flex size-10 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white/10"
                    aria-label="Next solution"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </footer>
            </article>
          </div>

          <div className="mt-5 grid gap-[5px] md:grid-cols-5">
            {solutionsData.map((solution, index) => (
              <button
                key={solution.label}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="relative min-h-[84px] overflow-hidden"
              >
                <div className="absolute inset-0">
                  <Image
                    src={solution.image}
                    alt={solution.label}
                    fill
                    sizes="(max-width: 768px) 100vw, 225px"
                    className="object-cover"
                  />
                  <div
                    className={`absolute inset-0 transition-colors ${
                      index === activeIndex ? "bg-[color:var(--primary)]/85" : "bg-white/88"
                    }`}
                  />
                </div>
                <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-5 text-left">
                  <span
                    className={`text-[18px] font-normal leading-none ${index === activeIndex ? "text-white" : "text-[#323232]"}`}
                  >
                    {solution.label}
                  </span>
                  <ChevronRight
                    className={`size-5 shrink-0 ${index === activeIndex ? "text-white" : "text-[#323232]"}`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
