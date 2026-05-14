import type { NewsArticleBody } from "@/data/news";

export type NewsPreviewItem = {
  date: string;
  dateTime: string;
  dateDay: string;
  dateYearMonth: string;
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

export type NewsArticleContentBlock =
  | {
      type: "body";
      body: NewsArticleBody;
    }
  | {
      type: "visual";
      visual: NewsArticleVisual;
    };

export type NewsPageData = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  recentUpdatesLabel: string;
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
  contentBlocks: NewsArticleContentBlock[];
  publishedAt: string;
  updatedAt: string;
  dateLabel: string;
  categoryLabel: string;
};
