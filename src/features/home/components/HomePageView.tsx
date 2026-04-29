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
    <div className="wayon-home bg-[#09090b] text-white">
      <Hero slides={hero.slides} />

      {/* Stats band — dark luxury integration */}
      <section className="relative z-10 -mt-12 px-4 sm:px-6">
        <div className="mx-auto max-w-[80rem]">
          <div className="bg-[#121214]/80 backdrop-blur-xl border border-white/5 py-12 px-6 sm:px-12 grid grid-cols-2 gap-y-12 md:gap-y-0 divide-x divide-white/5 text-center md:grid-cols-4 shadow-2xl">
            {statsSummary.map((stat: HomeStat) => (
              <CountUpStat
                key={stat.label}
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                tone="inverse"
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
