import { cache } from "react";

import { getNewsArticleBySlug } from "@/data/news";
import { getCommonCopy } from "@/data/siteCopy";
import type { AppLocale } from "@/i18n/types";

import { buildNewsDetailPageData } from "../model/news-view";
import type { NewsDetailPageData } from "../types";

const getNewsArticleRecord = cache(async function getNewsArticleRecord(slug: string) {
  return getNewsArticleBySlug(slug);
});

export const getNewsDetailPageData = cache(async function getNewsDetailPageData(
  locale: AppLocale,
  slug: string
): Promise<NewsDetailPageData | null> {
  const article = await getNewsArticleRecord(slug);

  if (!article) {
    return null;
  }

  const commonCopy = getCommonCopy(locale);

  return buildNewsDetailPageData(article, locale, {
    backToNewsLabel: commonCopy.backToNews,
    contactLabel: commonCopy.contactUs,
    contentComingSoonLabel: commonCopy.contentComingSoon,
  });
});
