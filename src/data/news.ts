import { client } from '@/sanity/lib/client';
import { getNewsQuery, getNewsBySlugQuery } from '@/sanity/lib/queries';
import type { AppLocale } from "@/i18n/types";
import type { PortableTextBlock } from 'next-sanity';

export type NewsArticle = {
  _id: string;
  title: Record<AppLocale, string>;
  slug: string;
  publishedAt: string;
  imageUrl: string;
  excerpt: Record<AppLocale, string>;
  category?: string;
  body?: Record<AppLocale, PortableTextBlock[]>;
};

export async function getNewsArticles(): Promise<NewsArticle[]> {
  const result = await client.fetch(getNewsQuery);
  return result || [];
}

export async function getNewsArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const result = await client.fetch(getNewsBySlugQuery, { slug });
  return result || null;
}

export async function getNewsSlugs(): Promise<string[]> {
  const articles = await getNewsArticles();
  return articles.map(a => a.slug).filter(Boolean);
}

export function getLocalizedNewsValue(
  article: NewsArticle,
  locale: AppLocale,
  field: "title" | "excerpt"
): string {
  if (!article) return "";
  const value = article[field];
  if (typeof value === 'string') return value;
  return value?.[locale] || value?.['en'] || value?.['zh'] || "";
}

export function getLocalizedNewsBody(
  article: NewsArticle,
  locale: AppLocale
): PortableTextBlock[] {
  if (!article?.body) return [];
  return article.body[locale] || article.body['en'] || article.body['zh'] || [];
}

export function formatNewsDate(publishedAt: string, locale: AppLocale): {
  day: string;
  yearMonth: string;
  full: string;
} {
  const date = new Date(publishedAt);
  const day = date.getDate().toString().padStart(2, '0');

  const localeMap: Record<AppLocale, string> = {
    en: 'en-US',
    zh: 'zh-CN',
    es: 'es-ES',
    ar: 'ar-AE',
    ru: 'ru-RU',
  };

  const full = date.toLocaleDateString(localeMap[locale], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const yearMonth = date.toLocaleDateString(localeMap[locale], {
    year: 'numeric',
    month: 'short',
  });

  return { day, yearMonth, full };
}

const NEWS_CATEGORY_LABELS: Record<string, Record<AppLocale, string>> = {
  company: { en: 'Company News', zh: '公司新闻', es: 'Noticias de la empresa', ar: 'أخبار الشركة', ru: 'Новости компании' },
  industry: { en: 'Industry News', zh: '行业新闻', es: 'Noticias de la industria', ar: 'أخبار الصناعة', ru: 'Новости отрасли' },
  exhibition: { en: 'Exhibition', zh: '展会', es: 'Exposición', ar: 'معرض', ru: 'Выставка' },
  product: { en: 'Product Launch', zh: '新品发布', es: 'Lanzamiento de producto', ar: 'إطلاق المنتج', ru: 'Запуск продукта' },
};

export function getNewsCategoryLabel(category: string | undefined, locale: AppLocale): string {
  if (!category) return '';
  return NEWS_CATEGORY_LABELS[category]?.[locale] || category;
}
