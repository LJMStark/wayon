import {
  formatNewsDate,
  getLocalizedNewsBody,
  getLocalizedNewsValue,
  getNewsCategoryLabel,
  type NewsArticle,
} from "@/data/news";
import type { AppLocale } from "@/i18n/types";

import type { NewsDetailPageData, NewsPreviewItem } from "../types";

import { TRADE_YELLOW_PLACEHOLDER_IMAGE } from "@/features/products/model/productExposure";

const NEWS_FALLBACK_IMAGE = TRADE_YELLOW_PLACEHOLDER_IMAGE;

export function getNewsHref(slug: string): string {
  return `/news/${slug}`;
}

export function getEmptyNewsMessage(locale: AppLocale): string {
  return {
    en: "No news available yet.",
    zh: "暂时还没有新闻内容。",
    es: "Aun no hay noticias disponibles.",
    ar: "لا توجد أخبار متاحة بعد.",
  }[locale];
}

export function toNewsPreviewItem(
  article: NewsArticle,
  locale: AppLocale
): NewsPreviewItem | null {
  if (!article.slug) {
    return null;
  }

  const title = getLocalizedNewsValue(article, locale, "title");

  if (!title) {
    return null;
  }

  return {
    date: formatNewsDate(article.publishedAt, locale).full,
    category: getNewsCategoryLabel(article.category, locale),
    title,
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    image: article.imageUrl || NEWS_FALLBACK_IMAGE,
    slug: article.slug,
  };
}

export function buildNewsDetailPageData(
  article: NewsArticle,
  locale: AppLocale,
  copy: {
    backToNewsLabel: string;
    contactLabel: string;
  }
): NewsDetailPageData {
  return {
    backToNewsLabel: copy.backToNewsLabel,
    contactLabel: copy.contactLabel,
    title: getLocalizedNewsValue(article, locale, "title"),
    excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
    body: getLocalizedNewsBody(article, locale),
    imageUrl: article.imageUrl || null,
    dateLabel: formatNewsDate(article.publishedAt, locale).full,
    categoryLabel: getNewsCategoryLabel(article.category, locale),
  };
}
