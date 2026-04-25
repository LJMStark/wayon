import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";

import { Link } from "@/i18n/routing";

import { getNewsHref } from "../model/news-view";
import type { NewsPageData, NewsPreviewItem } from "../types";

const NEWS_SECTION_STYLE = {
  animationDelay: "0.2s",
};

export function NewsPageView({
  eyebrow,
  heroTitle,
  heroDescription,
  recentUpdatesLabel,
  readLabel,
  featured,
  recent,
  emptyMessage,
}: NewsPageData): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background pb-24">
      <section className="-mt-[var(--header-height)] bg-primary px-4 pb-20 pt-[calc(var(--header-height)+8rem)] text-center">
        <div className="mx-auto max-w-4xl animate-fade-up">
          <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-gold">
            {eyebrow}
          </span>
          <h1 className="mb-6 text-4xl font-heading font-bold text-white md:text-5xl lg:text-6xl">
            {heroTitle}
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light text-gray-300">
            {heroDescription}
          </p>
        </div>
      </section>

      {featured ? (
        <section
          className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-12 px-4 animate-fade-in sm:px-6 lg:grid-cols-12 lg:px-8"
          style={NEWS_SECTION_STYLE}
        >
          <article id={featured.slug} className="lg:col-span-7">
            <Link
              href={getNewsHref(featured.slug)}
              className="group relative block overflow-hidden rounded-2xl shadow-2xl"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 translate-y-4 transform p-8 transition-transform duration-500 group-hover:translate-y-0">
                <div className="mb-3 flex items-center space-x-4">
                  <span className="rounded-full bg-gold px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                    {featured.category}
                  </span>
                  <span className="flex items-center text-sm font-medium text-gray-300">
                    <Calendar className="me-2 h-4 w-4" /> {featured.date}
                  </span>
                </div>
                <h2 className="mb-3 text-2xl font-heading font-bold text-white md:text-3xl">
                  {featured.title}
                </h2>
                <p className="line-clamp-2 text-gray-300">{featured.excerpt}</p>
              </div>
            </Link>
          </article>

          <div className="flex flex-col space-y-6 lg:col-span-5">
            <h3 className="mb-2 text-2xl font-heading font-bold text-primary">
              {recentUpdatesLabel}
            </h3>
            <div className="mb-4 h-px w-full bg-muted" />

            {recent.map((item) => (
              <NewsPreviewCard key={item.slug} item={item} readLabel={readLabel} />
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
              {recentUpdatesLabel}
            </h3>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </div>
        </section>
      )}
    </div>
  );
}

function NewsPreviewCard({
  item,
  readLabel,
}: {
  item: NewsPreviewItem;
  readLabel: string;
}): React.JSX.Element {
  return (
    <Link
      href={getNewsHref(item.slug)}
      className="group flex space-x-4 border-b border-muted/50 pb-6 last:border-0 last:pb-0"
    >
      <div
        id={item.slug}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg md:h-32 md:w-32"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          unoptimized
        />
      </div>
      <div className="flex flex-col justify-center">
        <span className="mb-1 flex items-center text-xs font-medium text-muted-foreground">
          {item.date} <span className="mx-2">&middot;</span>{" "}
          <span className="text-gold">{item.category}</span>
        </span>
        <h4 className="mb-2 line-clamp-2 text-lg font-heading font-bold text-primary transition-colors group-hover:text-gold">
          {item.title}
        </h4>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.excerpt}
        </p>
        <div className="mt-3 flex items-center text-sm font-medium text-muted-foreground transition-colors group-hover:text-primary">
          {readLabel} <ChevronRight className="ms-1 h-4 w-4 rtl:rotate-180" />
        </div>
      </div>
    </Link>
  );
}
