import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/routing";
import {
  getCommonCopy,
  getMetadataCopy,
  getNewsPageCopy,
} from "@/data/siteCopy";
import {
  formatNewsDate,
  getLocalizedNewsValue,
  getNewsArticles,
  getNewsCategoryLabel,
} from "@/data/news";
import { buildPageMetadata } from "@/lib/metadata";
import { hasLocale } from "@/i18n/types";

type NewsPreviewItem = {
  date: string;
  category: string;
  title: string;
  excerpt: string;
  img: string;
  slug: string;
};

const NEWS_SECTION_STYLE = {
  animationDelay: "0.2s",
};

function getNewsHref(slug: string): string {
  return `/news/${slug}`;
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/news">): Promise<import("next").Metadata> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const metadataCopy = getMetadataCopy(locale).news;

  return buildPageMetadata({
    locale,
    title: metadataCopy.title,
    description: metadataCopy.description,
    path: "/news",
  });
}

export default async function NewsPage({
  params,
}: PageProps<"/[locale]/news">): Promise<React.JSX.Element> {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const commonCopy = getCommonCopy(locale);
  const newsCopy = getNewsPageCopy(locale);
  const newsArticles = await getNewsArticles();
  const newsItems = newsArticles
    .filter((article) => Boolean(article.slug))
    .map((article): NewsPreviewItem => ({
      date: formatNewsDate(article.publishedAt, locale).full,
      category: getNewsCategoryLabel(article.category, locale),
      title: getLocalizedNewsValue(article, locale, "title"),
      excerpt: getLocalizedNewsValue(article, locale, "excerpt"),
      img: article.imageUrl || "/assets/news/terrazzo-flooring-cover.jpg",
      slug: article.slug,
    }))
    .filter((item) => Boolean(item.title));
  const [featuredNews, ...recentNews] = newsItems;
  const featuredNewsHref = featuredNews ? getNewsHref(featuredNews.slug) : null;
  const emptyNewsMessage = {
    en: "No news available yet.",
    zh: "暂时还没有新闻内容。",
    es: "Aun no hay noticias disponibles.",
    ar: "لا توجد أخبار متاحة بعد.",
    ru: "Пока нет доступных новостей.",
  }[locale];

  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="bg-primary px-4 pb-20 pt-32 text-center">
        <div className="mx-auto max-w-4xl animate-fade-up">
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-gold">
            {newsCopy.eyebrow}
          </span>
          <h1 className="mb-6 text-4xl font-heading font-bold text-white md:text-5xl lg:text-6xl">
            {newsCopy.heroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-300">
            {newsCopy.heroDescription}
          </p>
        </div>
      </section>

      {featuredNews && featuredNewsHref ? (
        <section
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-12 px-4 animate-fade-in sm:px-6 lg:grid-cols-12 lg:px-8"
          style={NEWS_SECTION_STYLE}
        >
          <article id={featuredNews.slug} className="lg:col-span-7">
            <Link
              href={featuredNewsHref}
              className="group relative block overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={featuredNews.img}
                  alt={featuredNews.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 translate-y-4 transform p-8 transition-transform duration-500 group-hover:translate-y-0">
                <div className="mb-3 flex items-center space-x-4">
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    {featuredNews.category}
                  </span>
                  <span className="flex items-center text-sm font-medium text-gray-300">
                    <Calendar className="mr-2 h-4 w-4" /> {featuredNews.date}
                  </span>
                </div>
                <h2 className="mb-3 text-2xl font-heading font-bold text-white md:text-3xl">
                  {featuredNews.title}
                </h2>
                <p className="line-clamp-2 text-gray-300">{featuredNews.excerpt}</p>
              </div>
            </Link>
          </article>

          <div className="flex flex-col space-y-6 lg:col-span-5">
            <h3 className="mb-2 text-2xl font-heading font-bold text-primary">
              {commonCopy.recentUpdates}
            </h3>
            <div className="mb-4 h-px w-full bg-muted" />

            {recentNews.map((news: NewsPreviewItem) => (
              <Link
                key={news.slug}
                href={getNewsHref(news.slug)}
                className="group flex space-x-4 border-b border-muted/50 pb-6 last:border-0 last:pb-0"
              >
                <div
                  id={news.slug}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg md:h-32 md:w-32"
                >
                  <Image
                    src={news.img}
                    alt={news.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="mb-1 flex items-center text-xs font-medium text-muted-foreground">
                    {news.date} <span className="mx-2">&middot;</span>{" "}
                    <span className="text-gold">{news.category}</span>
                  </span>
                  <h4 className="mb-2 line-clamp-2 text-lg font-heading font-bold text-primary transition-colors group-hover:text-gold">
                    {news.title}
                  </h4>
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {news.excerpt}
                  </p>
                  <div className="mt-3 flex items-center text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
                    {newsCopy.readLabel} <ChevronRight className="ml-1 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section
          className="mx-auto mt-16 max-w-6xl px-4 animate-fade-in sm:px-6 lg:px-8"
          style={NEWS_SECTION_STYLE}
        >
          <div className="rounded-2xl border border-muted bg-card px-6 py-16 text-center">
            <h3 className="mb-2 text-2xl font-heading font-bold text-primary">
              {commonCopy.recentUpdates}
            </h3>
            <p className="text-muted-foreground">{emptyNewsMessage}</p>
          </div>
        </section>
      )}
    </div>
  );
}
