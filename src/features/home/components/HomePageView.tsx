import { AboutAlbum } from "@/components/landing/AboutAlbum";
import { AboutIntro } from "@/components/landing/AboutIntro";
import { EngineeringCase } from "@/components/landing/EngineeringCase";
import { Hero } from "@/components/landing/Hero";
import { NewsSection } from "@/components/landing/NewsSection";
import { PartnerCarousel } from "@/components/landing/PartnerCarousel";
import { ProductsCarousel } from "@/components/landing/ProductsCarousel";
import { SolutionTabs } from "@/components/landing/SolutionTabs";
import { CountUpStat } from "@/components/ui/CountUpStat";

import type { HomePageData, HomeStat } from "../types";

export function HomePageView({
  hero,
  statsSummary,
  aboutIntro,
  aboutAlbum,
  productsCarousel,
  solutionTabs,
  engineeringCase,
  partnerCarousel,
  newsSection,
}: HomePageData): React.JSX.Element {
  return (
    <div className="wayon-home wayon-stone-bg text-[#242424]">
      <Hero slides={hero.slides} />

      <section className="relative z-10 -mt-12 px-4 sm:px-6">
        <div className="mx-auto max-w-[80rem]">
          <div className="grid grid-cols-2 gap-y-12 border border-[color:var(--border)] bg-white/82 px-6 py-12 text-center shadow-[0_28px_90px_-54px_rgba(0,43,80,0.45)] backdrop-blur-md sm:px-12 md:grid-cols-4 md:gap-y-0 md:divide-x md:divide-[#002b50]/10">
            {statsSummary.map((stat: HomeStat) => (
              <CountUpStat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
              />
            ))}
          </div>
        </div>
      </section>

      <ProductsCarousel
        items={productsCarousel.items}
        copy={productsCarousel.copy}
      />
      <AboutIntro data={aboutIntro} />
      <AboutAlbum items={aboutAlbum.items} copy={aboutAlbum.copy} />
      <SolutionTabs
        title={solutionTabs.title}
        description={solutionTabs.description}
        items={solutionTabs.items}
        copy={solutionTabs.copy}
      />
      <EngineeringCase
        title={engineeringCase.title}
        subtitle={engineeringCase.subtitle}
        items={engineeringCase.items}
      />
      <PartnerCarousel
        title={partnerCarousel.title}
        description={partnerCarousel.description}
        items={partnerCarousel.items}
        copy={partnerCarousel.copy}
      />
      <NewsSection
        title={newsSection.title}
        feature={newsSection.feature}
        items={newsSection.items}
      />
    </div>
  );
}
