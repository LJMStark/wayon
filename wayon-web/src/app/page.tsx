import { AboutAlbum } from "@/components/landing/AboutAlbum";
import { AboutIntro } from "@/components/landing/AboutIntro";
import { EngineeringCase } from "@/components/landing/EngineeringCase";
import { Hero } from "@/components/landing/Hero";
import { NewsSection } from "@/components/landing/NewsSection";
import { PartnerCarousel } from "@/components/landing/PartnerCarousel";
import { ProductsCarousel } from "@/components/landing/ProductsCarousel";
import { SocialTabs } from "@/components/landing/SocialTabs";
import { SolutionTabs } from "@/components/landing/SolutionTabs";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutIntro />
      <AboutAlbum />
      <ProductsCarousel />
      <SolutionTabs />
      <EngineeringCase />
      <PartnerCarousel />
      <NewsSection />
      <SocialTabs />
    </>
  );
}
