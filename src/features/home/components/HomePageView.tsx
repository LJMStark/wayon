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
    <>
      <Hero slides={hero.slides} slideLabel={hero.slideLabel} />

      {/* Stats band — count-up animation, triggers on scroll into view */}
      <section className="border-b border-[color:var(--border)] bg-[color:var(--background)] px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 divide-x divide-gray-100 text-center md:grid-cols-4">
          {statsSummary.map((stat: HomeStat) => (
            <CountUpStat
              key={stat.label}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
            />
          ))}
        </div>
      </section>

      <ProductsCarousel
        items={productsCarousel.items}
        copy={productsCarousel.copy}
      />
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
      <AboutIntro data={aboutIntro} />
      <AboutAlbum items={aboutAlbum.items} copy={aboutAlbum.copy} />
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
    </>
  );
}
