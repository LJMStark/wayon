import { getTranslations } from "next-intl/server";

import {
  HERO_SLIDES,
  getAboutAlbum,
  getAboutIntro,
  getEngineeringCases,
  getHomeProducts,
  getNewsFeature,
  getNewsItems,
  getPartners,
  getSolutions,
} from "@/data/home";
import { getLandingCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import type { HomePageData } from "../types";

const DEFAULT_CASE_TITLE = "ENGINEERING CASE";
const DEFAULT_CASE_SUBTITLE =
  "Showcasing ZYL's successful applications in global projects, including residential, commercial, and public spaces.";

export async function getHomePageData(locale: AppLocale): Promise<HomePageData> {
  const t = await getTranslations({ locale });
  const landingCopy = getLandingCopy(locale);

  return {
    hero: {
      slides: HERO_SLIDES,
      slideLabel: landingCopy.hero.slideLabel,
    },
    aboutIntro: getAboutIntro(t),
    aboutAlbum: {
      items: getAboutAlbum(t),
      copy: {
        ctaLabel: landingCopy.aboutAlbum.learnMore,
        previousLabel: landingCopy.aboutAlbum.previous,
        nextLabel: landingCopy.aboutAlbum.next,
      },
    },
    productsCarousel: {
      items: getHomeProducts(t),
      copy: {
        title: landingCopy.productsCarousel.title,
        description: landingCopy.productsCarousel.description,
        detailLabel: landingCopy.productsCarousel.detail,
        previousLabel: landingCopy.productsCarousel.previous,
        nextLabel: landingCopy.productsCarousel.next,
      },
    },
    solutionTabs: {
      title: t("SolutionTabs.whatWeDo"),
      description: t("SolutionTabs.applicationSolutions"),
      items: getSolutions(t),
      copy: {
        ctaTemplate: landingCopy.solutionTabs.cta,
        previousLabel: landingCopy.solutionTabs.previous,
        nextLabel: landingCopy.solutionTabs.next,
      },
    },
    engineeringCase: {
      title: t("Navigation.case") || DEFAULT_CASE_TITLE,
      subtitle: t("Hero.subtitle") || DEFAULT_CASE_SUBTITLE,
      items: getEngineeringCases(t),
    },
    partnerCarousel: {
      title: t("PartnerCarousel.industryPartners"),
      description: t("PartnerCarousel.trustedGlobal"),
      items: getPartners(t),
      copy: {
        previousLabel: landingCopy.partnerCarousel.previous,
        nextLabel: landingCopy.partnerCarousel.next,
      },
    },
    newsSection: {
      title: t("NewsSection.latestNews"),
      feature: getNewsFeature(t),
      items: getNewsItems(t),
    },
  };
}
