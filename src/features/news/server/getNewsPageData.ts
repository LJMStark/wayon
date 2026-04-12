import { cache } from "react";

import { getNewsArticles } from "@/data/news";
import { getCommonCopy, getNewsPageCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import {
  getEmptyNewsMessage,
  toNewsPreviewItem,
} from "../model/news-view";
import type { NewsPageData } from "../types";

const getNewsArticleList = cache(async function getNewsArticleList() {
  return getNewsArticles();
});

export const getNewsPageData = cache(async function getNewsPageData(
  locale: AppLocale
): Promise<NewsPageData> {
  const [newsCopy, commonCopy, articles] = await Promise.all([
    Promise.resolve(getNewsPageCopy(locale)),
    Promise.resolve(getCommonCopy(locale)),
    getNewsArticleList(),
  ]);

  const newsItems = articles
    .map((article) => toNewsPreviewItem(article, locale))
    .filter((item): item is NonNullable<typeof item> => item !== null);
  const [featured, ...recent] = newsItems;

  return {
    eyebrow: newsCopy.eyebrow,
    heroTitle: newsCopy.heroTitle,
    heroDescription: newsCopy.heroDescription,
    recentUpdatesLabel: commonCopy.recentUpdates,
    readLabel: newsCopy.readLabel,
    featured: featured ?? null,
    recent,
    emptyMessage: getEmptyNewsMessage(locale),
  };
});
