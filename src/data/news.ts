import type { SerializedEditorState } from "lexical";

import {
  getPayloadClient,
  localizedRich,
  localizedString,
  mediaUrl,
} from "@/data/_payload";
import type { AppLocale } from "@/i18n/types";

export type NewsArticleBody = SerializedEditorState;

export type NewsArticle = {
  _id: string;
  title: Record<AppLocale, string>;
  slug: string;
  publishedAt: string;
  imageUrl: string;
  excerpt: Record<AppLocale, string>;
  category?: string;
  body?: Record<AppLocale, NewsArticleBody>;
};

type RawNews = {
  id: string;
  title?: unknown;
  slug?: string | null;
  publishedAt?: string | null;
  coverImage?: unknown;
  excerpt?: unknown;
  category?: string | null;
  body?: unknown;
};

function mapNews(raw: RawNews): NewsArticle {
  return {
    _id: raw.id,
    title: localizedString(raw.title) ?? emptyLocalized(),
    slug: raw.slug ?? "",
    publishedAt: raw.publishedAt ?? "",
    imageUrl: mediaUrl(raw.coverImage) ?? "",
    excerpt: localizedString(raw.excerpt) ?? emptyLocalized(),
    category: raw.category ?? undefined,
    body: localizedRich<NewsArticleBody>(raw.body),
  };
}

function emptyLocalized(): Record<AppLocale, string> {
  return { en: "", zh: "", es: "", ar: "" };
}

export async function getNewsArticles(): Promise<NewsArticle[]> {
  const payload = await getPayloadClient();
  const nowIso = new Date().toISOString();
  const { docs } = await payload.find({
    collection: "news",
    where: {
      and: [
        { publishedAt: { exists: true } },
        { publishedAt: { less_than_equal: nowIso } },
      ],
    },
    limit: 200,
    sort: "-publishedAt",
    locale: "all",
    depth: 2,
  });
  return docs.map((doc) => mapNews(doc as unknown as RawNews));
}

export async function getNewsArticleBySlug(
  slug: string
): Promise<NewsArticle | null> {
  const payload = await getPayloadClient();
  const nowIso = new Date().toISOString();
  const { docs } = await payload.find({
    collection: "news",
    where: {
      and: [
        { slug: { equals: slug } },
        { publishedAt: { exists: true } },
        { publishedAt: { less_than_equal: nowIso } },
      ],
    },
    limit: 1,
    locale: "all",
    depth: 2,
  });
  const [first] = docs;
  if (!first) return null;
  return mapNews(first as unknown as RawNews);
}

export async function getNewsSlugs(): Promise<string[]> {
  const articles = await getNewsArticles();
  return articles.map((a) => a.slug).filter(Boolean);
}

export function getLocalizedNewsValue(
  article: NewsArticle,
  locale: AppLocale,
  field: "title" | "excerpt"
): string {
  if (!article) return "";
  const value = article[field];
  if (typeof value === "string") return value;
  return value?.[locale] || value?.["en"] || value?.["zh"] || "";
}

export function getLocalizedNewsBody(
  article: NewsArticle,
  locale: AppLocale
): NewsArticleBody | null {
  if (!article?.body) return null;
  return article.body[locale] || article.body.en || article.body.zh || null;
}

export function formatNewsDate(
  publishedAt: string,
  locale: AppLocale
): {
  day: string;
  yearMonth: string;
  full: string;
} {
  const date = new Date(publishedAt);
  const day = date.getDate().toString().padStart(2, "0");

  const localeMap: Record<AppLocale, string> = {
    en: "en-US",
    zh: "zh-CN",
    es: "es-ES",
    ar: "ar-AE",
  };

  const full = date.toLocaleDateString(localeMap[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const yearMonth = date.toLocaleDateString(localeMap[locale], {
    year: "numeric",
    month: "short",
  });

  return { day, yearMonth, full };
}

const NEWS_CATEGORY_LABELS: Record<string, Record<AppLocale, string>> = {
  company: {
    en: "Company News",
    zh: "公司新闻",
    es: "Noticias de la empresa",
    ar: "أخبار الشركة",
  },
  industry: {
    en: "Industry News",
    zh: "行业新闻",
    es: "Noticias de la industria",
    ar: "أخبار الصناعة",
  },
  exhibition: {
    en: "Exhibition",
    zh: "展会",
    es: "Exposición",
    ar: "معرض",
  },
  product: {
    en: "Product Launch",
    zh: "新品发布",
    es: "Lanzamiento de producto",
    ar: "إطلاق المنتج",
  },
};

export function getNewsCategoryLabel(
  category: string | undefined,
  locale: AppLocale
): string {
  if (!category) return "";
  return NEWS_CATEGORY_LABELS[category]?.[locale] || category;
}
