"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useRef } from "react";

import { getPartners } from "@/data/home";
import { getLandingCopy } from "@/data/siteCopy";

import {
  scrollContainerByDirection,
  type CarouselDirection,
} from "./carouselUtils";

const PARTNER_SECTION_STYLE = {
  backgroundImage:
    "linear-gradient(rgba(247,250,253,0.96), rgba(247,250,253,0.96)), url('/assets/backgrounds/partner-section-bg.png')",
  backgroundPosition: "center",
  backgroundSize: "cover",
};

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

function getCarouselActionLabel(
  copy: ReturnType<typeof getLandingCopy>,
  key: "previous" | "next"
): string {
  return copy.partnerCarousel[key];
}

export function PartnerCarousel(): React.JSX.Element {
  const locale = useLocale();
  const t = useTranslations();
  const copy = getLandingCopy(locale);
  const partnersData = getPartners(t);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: CarouselDirection): void => {
    scrollContainerByDirection(scrollerRef.current, direction, 780);
  };

  return (
    <section className="wayon-section pb-16" style={PARTNER_SECTION_STYLE}>
      <div className="wayon-container">
        <header className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[780px]">
            <h2 className="wayon-title">
              {t("PartnerCarousel.industryPartners")}
            </h2>
            <p className="wayon-copy mt-5">
              {t("PartnerCarousel.trustedGlobal")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {NAVIGATION_BUTTONS.map(({ direction, ariaLabelKey, Icon }) => (
              <button
                key={direction}
                type="button"
                onClick={() => scrollByAmount(direction)}
                className="flex size-12 items-center justify-center bg-white text-[#333333] shadow-[0_0_1rem_rgba(0,0,0,0.08)] transition-colors hover:bg-[color:var(--primary)] hover:text-white"
                aria-label={getCarouselActionLabel(copy, ariaLabelKey)}
              >
                <Icon className="size-5" />
              </button>
            ))}
          </div>
        </header>

        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {partnersData.map((partner) => (
            <article
              key={partner.title}
              className="relative flex w-[min(76rem,92vw)] shrink-0 snap-start items-center gap-6 bg-white px-8 py-10 shadow-[0.636rem_0.636rem_1rem_0.1rem_rgba(0,0,0,0.1)] md:px-10 md:py-12"
            >
              <div className="flex size-[9rem] shrink-0 items-center justify-center rounded-full border border-[color:var(--primary)] bg-white md:size-[18rem]">
                <div className="relative size-[56px] md:size-[96px]">
                  <Image
                    src={partner.image}
                    alt={partner.title}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="text-[24px] font-semibold leading-[1.5] text-[#1e1e1e]">
                  {partner.title}
                </h3>
                <p className="mt-3 text-[16px] font-light leading-[1.78] text-[#666666]">
                  {partner.description}
                </p>
              </div>

              <div className="absolute right-0 top-0 bg-[color:var(--primary)] px-5 py-4 text-[14px] font-medium text-white md:rounded-bl-[3.4rem] md:px-7">
                {partner.title}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
