import type {
  AboutAlbumItem,
  AboutIntroData,
  CaseItem,
  HeroSlide,
  NewsFeature,
  NewsItem,
  PartnerItem,
  ProductItem,
  SolutionItem,
} from "@/data/home";

export type HomeHeroData = {
  slides: HeroSlide[];
  slideLabel: string;
};

export type AboutAlbumCopy = {
  ctaLabel: string;
  previousLabel: string;
  nextLabel: string;
};

export type ProductsCarouselCopy = {
  title: string;
  description: string;
  detailLabel: string;
  previousLabel: string;
  nextLabel: string;
};

export type SolutionTabsCopy = {
  ctaTemplate: string;
  previousLabel: string;
  nextLabel: string;
};

export type PartnerCarouselCopy = {
  previousLabel: string;
  nextLabel: string;
};

export type AboutAlbumSectionData = {
  items: AboutAlbumItem[];
  copy: AboutAlbumCopy;
};

export type ProductsCarouselSectionData = {
  items: ProductItem[];
  copy: ProductsCarouselCopy;
};

export type SolutionTabsSectionData = {
  title: string;
  description: string;
  items: SolutionItem[];
  copy: SolutionTabsCopy;
};

export type EngineeringCaseSectionData = {
  title: string;
  subtitle: string;
  items: CaseItem[];
};

export type PartnerCarouselSectionData = {
  title: string;
  description: string;
  items: PartnerItem[];
  copy: PartnerCarouselCopy;
};

export type NewsSectionData = {
  title: string;
  feature: NewsFeature;
  items: NewsItem[];
};

export type HomePageData = {
  hero: HomeHeroData;
  aboutIntro: AboutIntroData;
  aboutAlbum: AboutAlbumSectionData;
  productsCarousel: ProductsCarouselSectionData;
  solutionTabs: SolutionTabsSectionData;
  engineeringCase: EngineeringCaseSectionData;
  partnerCarousel: PartnerCarouselSectionData;
  newsSection: NewsSectionData;
};
