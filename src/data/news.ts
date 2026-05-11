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
  body?: Partial<Record<AppLocale, NewsArticleBody>>;
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
  const { docs } = await payload.find({
    collection: "news",
    where: { _status: { equals: "published" } },
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
