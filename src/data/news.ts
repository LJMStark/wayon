import type { SerializedEditorState } from "lexical";
import { unstable_cache } from "next/cache";

import {
  getPayloadClient,
  localizedRich,
  localizedString,
  mediaUrl,
} from "@/data/_payload";
import { NEWS_CACHE_TAG } from "@/data/cacheTags";
import type { AppLocale } from "@/i18n/types";

export type NewsArticleBody = SerializedEditorState;

export type NewsArticle = {
  _id: string;
  title: Record<AppLocale, string>;
  slug: string;
  publishedAt: string;
  updatedAt: string;
  imageUrl: string;
  excerpt: Record<AppLocale, string>;
  category?: string;
  body?: Partial<Record<AppLocale, NewsArticleBody>>;
};

type RawNews = {
  id: string;
  title?: unknown;
  slug?: string | null;
  publishedAt?: string | null;
  updatedAt?: string | null;
  coverImage?: unknown;
  excerpt?: unknown;
  category?: string | null;
  body?: unknown;
};

const NEWS_CACHE_SECONDS = 300;
const NEWS_DETAIL_CACHE_SECONDS = 3600;

function mapNews(raw: RawNews): NewsArticle {
  return {
    _id: raw.id,
    title: localizedString(raw.title) ?? emptyLocalized(),
    slug: raw.slug ?? "",
    publishedAt: raw.publishedAt ?? "",
    updatedAt: raw.updatedAt ?? raw.publishedAt ?? "",
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
  return getCachedNewsArticles();
}

const getCachedNewsArticles = unstable_cache(
  async function loadPublishedNewsArticles(): Promise<NewsArticle[]> {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } },
      limit: 200,
      sort: "-publishedAt",
      locale: "all",
      depth: 2,
    });
    return docs.map((doc) => mapNews(doc as unknown as RawNews));
  },
  ["published-news-articles"],
  {
    tags: [NEWS_CACHE_TAG],
    revalidate: NEWS_CACHE_SECONDS,
  }
);

export async function getNewsArticleBySlug(
  slug: string
): Promise<NewsArticle | null> {
  return getCachedNewsArticleBySlug(slug);
}

const getCachedNewsArticleBySlug = unstable_cache(
  async function loadPublishedNewsArticleBySlug(
    slug: string
  ): Promise<NewsArticle | null> {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "news",
      where: {
        and: [
          { slug: { equals: slug } },
          { _status: { equals: "published" } },
        ],
      },
      limit: 1,
      locale: "all",
      depth: 2,
    });
    const [first] = docs;
    if (!first) return null;
    return mapNews(first as unknown as RawNews);
  },
  ["published-news-article-by-slug"],
  {
    tags: [NEWS_CACHE_TAG],
    revalidate: NEWS_DETAIL_CACHE_SECONDS,
  }
);

export async function getNewsSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  return getCachedNewsSlugs();
}

const getCachedNewsSlugs = unstable_cache(
  async function loadPublishedNewsSlugs(): Promise<
    { slug: string; updatedAt: string }[]
  > {
    const payload = await getPayloadClient();
    const { docs } = await payload.find({
      collection: "news",
      where: { _status: { equals: "published" } },
      limit: 200,
      sort: "-publishedAt",
      depth: 0,
    });
    return docs
      .filter((doc): doc is typeof doc & { slug: string } => {
        const slug = (doc as { slug?: string | null }).slug;
        return typeof slug === "string" && slug.length > 0;
      })
      .map((doc) => ({
        slug: (doc as { slug: string }).slug,
        updatedAt: doc.updatedAt,
      }));
  },
  ["published-news-slugs"],
  {
    tags: [NEWS_CACHE_TAG],
    revalidate: NEWS_CACHE_SECONDS,
  }
);

export async function getNewsSitemapEntries(): Promise<
  { slug: string; updatedAt: string; locales: AppLocale[] }[]
> {
  return getCachedNewsSitemapEntries();
}

const getCachedNewsSitemapEntries = unstable_cache(
  async function loadPublishedNewsSitemapEntries(): Promise<
    { slug: string; updatedAt: string; locales: AppLocale[] }[]
  > {
    const articles = await getCachedNewsArticles();
    return articles
      .map((article) => ({
        slug: article.slug,
        updatedAt: article.updatedAt,
        locales: getAvailableNewsLocales(article),
      }))
      .filter(
        (entry): entry is { slug: string; updatedAt: string; locales: AppLocale[] } =>
          entry.slug.length > 0 && entry.locales.length > 0
      );
  },
  ["published-news-sitemap-entries"],
  {
    tags: [NEWS_CACHE_TAG],
    revalidate: NEWS_CACHE_SECONDS,
  }
);

export function getLocalizedNewsValue(
  article: NewsArticle,
  locale: AppLocale,
  field: "title" | "excerpt"
): string {
  if (!article) return "";
  const value = article[field] as Record<AppLocale, string> | string;
  if (typeof value === "string") {
    const text = value.trim();
    return isUsableNewsText(text, locale) ? text : "";
  }

  const localized = value?.[locale];
  if (isUsableNewsText(localized, locale)) {
    return localized.trim();
  }

  if (locale === "zh" && value?.zh?.trim()) {
    return value.zh.trim();
  }

  if (locale !== "zh" && isUsableNewsText(value?.en, "en")) {
    return value.en.trim();
  }

  return "";
}

export function getLocalizedNewsBody(
  article: NewsArticle,
  locale: AppLocale
): NewsArticleBody | null {
  if (!article?.body) return null;
  const localized = article.body[locale];
  if (isUsableNewsBody(localized, locale)) {
    return localized;
  }

  if (locale === "zh" && article.body.zh) {
    return article.body.zh;
  }

  if (locale !== "zh" && isUsableNewsBody(article.body.en, "en")) {
    return article.body.en;
  }

  return null;
}

export function isNewsAvailableInLocale(
  article: NewsArticle,
  locale: AppLocale
): boolean {
  return (
    getLocalizedNewsValue(article, locale, "title").length > 0 &&
    getLocalizedNewsBody(article, locale) !== null
  );
}

export function getAvailableNewsLocales(article: NewsArticle): AppLocale[] {
  const locales: AppLocale[] = ["zh", "en", "es", "ar"];
  return locales.filter((locale) => isNewsAvailableInLocale(article, locale));
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

function isUsableNewsText(
  value: string | undefined,
  locale: AppLocale
): value is string {
  const text = value?.trim();
  if (!text) {
    return false;
  }

  if (locale !== "zh" && /[\u3400-\u9fff]/.test(text)) {
    return false;
  }

  return true;
}

function isUsableNewsBody(
  value: NewsArticleBody | undefined,
  locale: AppLocale
): value is NewsArticleBody {
  if (!value) {
    return false;
  }

  if (locale !== "zh" && /[\u3400-\u9fff]/.test(extractLexicalText(value))) {
    return false;
  }

  return true;
}

function extractLexicalText(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "";
  }

  const record = value as { root?: unknown; text?: unknown; children?: unknown };
  const parts: string[] = [];

  if (typeof record.text === "string") {
    parts.push(record.text);
  }

  if (record.root) {
    parts.push(extractLexicalText(record.root));
  }

  if (Array.isArray(record.children)) {
    parts.push(...record.children.map((child) => extractLexicalText(child)));
  }

  return parts.filter(Boolean).join(" ").trim();
}
