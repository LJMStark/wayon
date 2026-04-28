import { getTranslations } from "next-intl/server";

import {
  HERO_SLIDES,
  getAboutAlbum,
  getAboutIntro,
  getEngineeringCases,
  getHomeProducts,
  getPartners,
  getSolutions,
  type NewsFeature,
  type NewsItem,
} from "@/data/home";
import {
  getLocalizedNewsValue,
  getNewsArticles,
  type NewsArticle,
} from "@/data/news";
import { getAboutPageCopy, getLandingCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import { getNewsHref } from "@/features/news/model/news-view";

import type { HomePageData } from "../types";

const DEFAULT_CASE_TITLE = "ENGINEERING CASE";
const DEFAULT_CASE_SUBTITLE =
  "Showcasing ZYL's successful applications in global projects, including residential, commercial, and public spaces.";
const HOME_NEWS_LIMIT = 5;
const NEWS_FALLBACK_IMAGE = "/assets/fallbacks/news-fallback.jpg";

type HomeNewsEntry = NewsItem &
  Pick<NewsFeature, "excerpt" | "image">;

function toHomeNewsEntry(
  article: NewsArticle,
  locale: AppLocale
): HomeNewsEntry | null {
  if (!article.slug) {
    return null;
  }

  const title = getLocalizedNewsValue(article, locale, "title");
  const dateParts = formatHomeNewsDate(article.publishedAt);

  if (!title || !dateParts) {
    return null;
  }

  return {
    title,
    href: getNewsHref(article.slug),
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    image: article.imageUrl || NEWS_FALLBACK_IMAGE,
    ...dateParts,
  };
}

function formatHomeNewsDate(
  publishedAt: string
): Pick<NewsItem, "day" | "yearMonth"> | null {
  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    day: date.getDate().toString().padStart(2, "0"),
    yearMonth: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
  };
}

function getHomeNewsSection(
  articles: NewsArticle[],
  locale: AppLocale
): { feature: NewsFeature | null; items: NewsItem[] } {
  const [featuredNews, ...recentNews] = articles
    .map((article) => toHomeNewsEntry(article, locale))
    .filter((entry): entry is HomeNewsEntry => entry !== null)
    .slice(0, HOME_NEWS_LIMIT);

  return {
    feature: featuredNews
      ? {
          title: featuredNews.title,
          excerpt: featuredNews.excerpt,
          href: featuredNews.href,
          image: featuredNews.image,
        }
      : null,
    items: recentNews.map(({ title, href, day, yearMonth }) => ({
      title,
      href,
      day,
      yearMonth,
    })),
  };
}

export async function getHomePageData(locale: AppLocale): Promise<HomePageData> {
  const [t, articles] = await Promise.all([
    getTranslations({ locale }),
    getNewsArticles(),
  ]);
  const landingCopy = getLandingCopy(locale);
  const aboutCopy = getAboutPageCopy(locale);
  const homeNewsSection = getHomeNewsSection(articles, locale);

  return {
    hero: {
      slides: HERO_SLIDES,
      slideLabel: landingCopy.hero.slideLabel,
    },
    statsSummary: aboutCopy.stats,
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
      feature: homeNewsSection.feature,
      items: homeNewsSection.items,
    },
  };
}
