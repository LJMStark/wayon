import { AboutAlbum } from "@/components/landing/AboutAlbum";
import { AboutIntro } from "@/components/landing/AboutIntro";
import { EngineeringCase } from "@/components/landing/EngineeringCase";
import { Hero } from "@/components/landing/Hero";
import { NewsSection } from "@/components/landing/NewsSection";
import { PartnerCarousel } from "@/components/landing/PartnerCarousel";
import { ProductsCarousel } from "@/components/landing/ProductsCarousel";
import { SolutionTabs } from "@/components/landing/SolutionTabs";

import type { HomePageData } from "../types";

export function HomePageView({
  hero,
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
      <AboutIntro data={aboutIntro} />
      <AboutAlbum items={aboutAlbum.items} copy={aboutAlbum.copy} />
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
