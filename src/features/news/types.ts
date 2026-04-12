import type { PortableTextBlock } from "next-sanity";

export type NewsPreviewItem = {
  date: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
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
  contactLabel: string;
  title: string;
  excerpt: string;
  body: PortableTextBlock[];
  imageUrl: string | null;
  dateLabel: string;
  categoryLabel: string;
};
