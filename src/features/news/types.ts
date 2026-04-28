import type { NewsArticleBody } from "@/data/news";

export type NewsPreviewItem = {
  date: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
};

export type NewsArticleVisual = {
  src: string;
  alt: string;
  caption: string;
};

export type NewsPageData = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  recentUpdatesLabel: string;
  readLabel: string;
  featured: NewsPreviewItem | null;
  recent: NewsPreviewItem[];
  emptyMessage: string;
};

export type NewsDetailPageData = {
  backToNewsLabel: string;
  contactCtaTitle: string;
  contactLabel: string;
  contentComingSoonLabel: string;
  title: string;
  excerpt: string;
  body: NewsArticleBody | null;
  imageUrl: string | null;
  visuals: NewsArticleVisual[];
  publishedAt: string;
  dateLabel: string;
  categoryLabel: string;
};
