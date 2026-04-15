"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import type { SolutionItem } from "@/data/home";
import type { SolutionTabsCopy } from "@/features/home/types";
import { formatCopy } from "@/data/siteCopy";
import { Link } from "@/i18n/routing";

import { getWrappedIndex, type CarouselDirection } from "./carouselUtils";

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

function getTabOverlayClassName(isActive: boolean): string {
  if (isActive) {
    return "absolute inset-0 bg-[color:var(--primary)]/85 transition-colors";
  }

  return "absolute inset-0 bg-white/88 transition-colors";
}

function getTabTextClassName(isActive: boolean): string {
  if (isActive) {
    return "text-[18px] font-normal leading-none text-white";
  }

  return "text-[18px] font-normal leading-none text-[#323232]";
}

function getCarouselActionLabel(
  copy: SolutionTabsCopy,
  key: "previous" | "next"
): string {
  return key === "previous" ? copy.previousLabel : copy.nextLabel;
}

type SolutionTabsProps = {
  title: string;
  description: string;
  items: SolutionItem[];
  copy: SolutionTabsCopy;
};

export function SolutionTabs({
  title,
  description,
  items,
  copy,
}: SolutionTabsProps): React.JSX.Element {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItem = items[activeIndex];

  const changeActiveIndex = (direction: CarouselDirection): void => {
    setActiveIndex((current) => getWrappedIndex(current, items.length, direction));
  };

  return (
    <motion.section 
      className="wayon-section"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="wayon-container">
        <header className="mb-6 text-center md:mb-10">
          <h2 className="wayon-title">{title}</h2>
          <p className="wayon-copy mx-auto mt-5 max-w-[780px]">
            {description}
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
                  {formatCopy(copy.ctaTemplate, { title: activeItem.title })}
                  <ArrowRight className="size-4" />
                </Link>
                <div className="flex items-center gap-2">
                  {NAVIGATION_BUTTONS.map(({ direction, ariaLabelKey, Icon }) => (
                    <button
                      key={direction}
                      type="button"
                      onClick={() => changeActiveIndex(direction)}
                      className="flex size-10 items-center justify-center border border-white/40 text-white transition-colors hover:bg-white/10"
                      aria-label={getCarouselActionLabel(copy, ariaLabelKey)}
                    >
                      <Icon className="size-4" />
                    </button>
                  ))}
                </div>
              </footer>
            </article>
          </div>

          <div className="mt-5 grid gap-[5px] md:grid-cols-5">
            {items.map((solution, index) => (
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
                    <div className={getTabOverlayClassName(index === activeIndex)} />
                  </div>
                <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-5 text-left">
                  <span className={getTabTextClassName(index === activeIndex)}>
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
    </motion.section>
  );
}
